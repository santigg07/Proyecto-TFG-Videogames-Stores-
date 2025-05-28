<?php
// backend/app/Http/Controllers/Api/OrderController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\CartItem;
use App\Models\Game;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Mostrar un listado de los pedidos del usuario.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        Log::info('OrderController index called', [
            'user_id' => $user->id,
            'user_role' => $user->role_id,
            'request_all' => $request->get('all'),
            'is_admin' => $user->role_id === 1
        ]);
        
        // Si es admin y solicita todos los pedidos
        if ($user->role_id === 1 && $request->get('all') === 'true') {
            // Para admin, obtener TODOS los pedidos
            $query = Order::with(['user', 'items.game.console']);

            Log::info('Admin query - getting all orders');
            
            // Búsqueda
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                    ->orWhere('payment_id', 'like', "%{$search}%")
                    ->orWhereHas('user', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                    });
                });
            }
        } else {
            // Para usuarios normales, solo sus pedidos
            $query = Order::with(['items.game.console'])
                ->where('user_id', $user->id);
        }
        
        // Filtrar por estado si se proporciona
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        // Ordenar
        $sortOrder = $request->get('sort', 'desc');
        $query->orderBy('created_at', $sortOrder);
        
        // Paginar - aumentar a 20 por página
        $orders = $query->paginate(20);
        
        // Añadir contador de artículos a cada pedido
        $orders->getCollection()->transform(function ($order) {
            $order->items_count = $order->items ? $order->items->sum('quantity') : 0;
            // Si no hay usuario, crear un objeto dummy
            if (!$order->user) {
                $order->user = (object) [
                    'name' => 'Usuario eliminado',
                    'email' => 'no-email@example.com'
                ];
            }
            return $order;
        });

        return response()->json([
            'success' => true,
            'orders' => $orders->items(),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total()
            ]
        ]);
    }

    /**
     * Mostrar la orden especificada.
     */
    public function show($id): JsonResponse
    {
        $user = Auth::user();
        
        $order = Order::with(['items.game.console', 'user'])
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        // Parsear la dirección de envío si es string JSON
        if (is_string($order->shipping_address)) {
            $order->shipping_address = json_decode($order->shipping_address, true);
        }

        return response()->json([
            'success' => true,
            'order' => $order
        ]);
    }

    /**
     * Crear una nueva orden (normalmente se llama desde los controladores de pago).
     */
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.address' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.postalCode' => 'required|string',
            'shipping_address.country' => 'required|string',
            'shipping_address.phone' => 'required|string',
            'payment_method' => 'required|in:stripe,paypal',
            'payment_id' => 'nullable|string'
        ]);

        $user = Auth::user();

        DB::beginTransaction();

        try {
            // Obtener items del carrito
            $cartItems = CartItem::with('game')
                ->where('user_id', $user->id)
                ->get();

            if ($cartItems->isEmpty()) {
                throw new \Exception('El carrito está vacío');
            }

            // Verificar stock disponible
            foreach ($cartItems as $item) {
                if ($item->game->stock < $item->quantity) {
                    throw new \Exception("No hay suficiente stock para {$item->game->name}");
                }
            }

            // Calcular total
            $total = $cartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            // Crear la orden
            $order = Order::create([
                'user_id' => $user->id,
                'total' => $total,
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'payment_id' => $validated['payment_id'] ?? null,
                'shipping_address' => json_encode($validated['shipping_address'])
            ]);

            // Crear items de la orden y actualizar stock
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'game_id' => $item->game_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price
                ]);

                // Actualizar stock
                $game = Game::find($item->game_id);
                $game->stock -= $item->quantity;
                $game->save();
            }

            // Limpiar el carrito
            CartItem::where('user_id', $user->id)->delete();

            DB::commit();

            // Cargar relaciones para la respuesta
            $order->load(['items.game.console']);

            return response()->json([
                'success' => true,
                'message' => 'Orden creada exitosamente',
                'order' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancelar una orden (sólo si está pendiente).
     */
    public function cancel($id): JsonResponse
    {
        $user = Auth::user();
        
        $order = Order::where('user_id', $user->id)
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        DB::beginTransaction();

        try {
            // Cambiar estado a cancelado
            $order->status = 'cancelled';
            $order->save();

            // Restaurar stock
            foreach ($order->items as $item) {
                $game = Game::find($item->game_id);
                if ($game) {
                    $game->stock += $item->quantity;
                    $game->save();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Orden cancelada exitosamente',
                'order' => $order->load(['items.game.console'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cancelar la orden: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de pedidos del usuario.
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();
        
        $stats = [
            'total_orders' => Order::where('user_id', $user->id)->count(),
            'completed_orders' => Order::where('user_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'pending_orders' => Order::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count(),
            'total_spent' => Order::where('user_id', $user->id)
                ->where('status', 'completed')
                ->sum('total')
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    /**
     * Actualizar información de tracking (solo admin)
     */
    public function updateTracking(Request $request, $id)
    {
        // Verificar que el usuario sea admin
        if (Auth::user()->role_id !== 1) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        
        $validated = $request->validate([
            'tracking_number' => 'nullable|string|max:100',
            'shipping_carrier' => 'nullable|string|max:50',
            'shipping_status' => 'nullable|in:pending,preparing,shipped,in_transit,delivered,returned',
            'shipping_notes' => 'nullable|string'
        ]);
        
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado'], 404);
        }
        
        // Actualizar campos
        $order->fill($validated);
        
        // Si el estado cambia a shipped, actualizar shipped_at
        if ($request->shipping_status === 'shipped' && !$order->shipped_at) {
            $order->shipped_at = now();
        }
        
        // Si el estado cambia a delivered, actualizar delivered_at
        if ($request->shipping_status === 'delivered' && !$order->delivered_at) {
            $order->delivered_at = now();
        }
        
        $order->save();
        
        // Opcional: Enviar email de notificación al cliente
        if ($request->shipping_status === 'shipped' && $order->tracking_number) {
            // Mail::to($order->user->email)->send(new ShippingNotification($order));
        }
        
        return response()->json([
            'success' => true,
            'order' => $order
        ]);
    }

    
}