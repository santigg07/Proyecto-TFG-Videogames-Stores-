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

class OrderController extends Controller
{
    /**
     * Mostrar un listado de los pedidos del usuario.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $orders = Order::with(['items.game.console'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

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
}