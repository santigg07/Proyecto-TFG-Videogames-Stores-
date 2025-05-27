<?php
// app/Http/Controllers/Api/OrderController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Crear nueva orden desde el carrito
     */
    public function create(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'shipping_address' => 'required|array',
                'shipping_address.address' => 'required|string|max:255',
                'shipping_address.city' => 'required|string|max:100',
                'shipping_address.postal_code' => 'required|string|max:20',
                'shipping_address.country' => 'required|string|max:100',
                'payment_method' => 'required|string|in:stripe,paypal'
            ]);

            $user = Auth::user();

            // Verificar que el carrito no esté vacío
            $cartItems = CartItem::with('game')->forUser($user->id)->get();
            
            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'El carrito está vacío'
                ], 400);
            }

            // Verificar stock de todos los productos
            foreach ($cartItems as $cartItem) {
                if ($cartItem->quantity > $cartItem->game->stock) {
                    return response()->json([
                        'success' => false,
                        'message' => "No hay suficiente stock para {$cartItem->game->name}. Disponible: {$cartItem->game->stock}"
                    ], 400);
                }
            }

            DB::beginTransaction();

            // Calcular total
            $total = $cartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            // Crear la orden
            $order = Order::create([
                'user_id' => $user->id,
                'total' => $total,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'shipping_address' => json_encode($request->shipping_address)
            ]);

            // Crear items de la orden y actualizar stock
            foreach ($cartItems as $cartItem) {
                // Crear OrderItem
                OrderItem::create([
                    'order_id' => $order->id,
                    'game_id' => $cartItem->game_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price
                ]);

                // Reducir stock
                $cartItem->game->decrement('stock', $cartItem->quantity);
            }

            // Limpiar carrito
            CartItem::forUser($user->id)->delete();

            DB::commit();

            // Cargar orden con relaciones
            $order->load(['items.game.console', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Orden creada exitosamente',
                'data' => [
                    'order' => $this->formatOrder($order),
                    'payment_data' => $this->preparePaymentData($order, $request->payment_method)
                ]
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener órdenes del usuario
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();

            $orders = Order::with(['items.game.console'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            $formattedOrders = $orders->getCollection()->map(function ($order) {
                return $this->formatOrder($order);
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'orders' => $formattedOrders,
                    'pagination' => [
                        'current_page' => $orders->currentPage(),
                        'last_page' => $orders->lastPage(),
                        'per_page' => $orders->perPage(),
                        'total' => $orders->total()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las órdenes',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener orden específica
     */
    public function show($id): JsonResponse
    {
        try {
            $user = Auth::user();

            $order = Order::with(['items.game.console', 'user'])
                ->where('user_id', $user->id)
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => $this->formatOrder($order)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Orden no encontrada',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 404);
        }
    }

    /**
     * Confirmar pago de orden
     */
    public function confirmPayment(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'payment_id' => 'required|string',
                'payment_status' => 'required|string|in:completed,failed'
            ]);

            $user = Auth::user();

            $order = Order::where('user_id', $user->id)->findOrFail($id);

            if ($order->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta orden ya fue procesada'
                ], 400);
            }

            DB::beginTransaction();

            // Actualizar orden
            $order->update([
                'payment_id' => $request->payment_id,
                'status' => $request->payment_status === 'completed' ? 'processing' : 'cancelled'
            ]);

            // Si el pago falló, restaurar stock
            if ($request->payment_status === 'failed') {
                foreach ($order->items as $item) {
                    $item->game->increment('stock', $item->quantity);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $request->payment_status === 'completed' 
                    ? 'Pago confirmado exitosamente' 
                    : 'Pago falló, orden cancelada',
                'data' => [
                    'order' => $this->formatOrder($order->fresh(['items.game.console']))
                ]
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al confirmar el pago',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener datos del usuario para checkout
     */
    public function getCheckoutData(): JsonResponse
    {
        try {
            $user = Auth::user();

            // Obtener carrito
            $cartItems = CartItem::with(['game.console'])
                ->forUser($user->id)
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'El carrito está vacío'
                ], 400);
            }

            // Calcular totales
            $subtotal = $cartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            $shipping = 0; // Envío gratis
            $total = $subtotal + $shipping;

            // Formatear items del carrito
            $items = $cartItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'game_id' => $item->game_id,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'subtotal' => (float) ($item->price * $item->quantity),
                    'game' => [
                        'id' => $item->game->id,
                        'name' => $item->game->name,
                        'image' => $item->game->image,
                        'console' => $item->game->console->name
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'address' => $user->address,
                        'city' => $user->city,
                        'postal_code' => $user->postal_code,
                        'country' => $user->country
                    ],
                    'cart' => [
                        'items' => $items,
                        'subtotal' => round($subtotal, 2),
                        'shipping' => $shipping,
                        'total' => round($total, 2),
                        'item_count' => $cartItems->sum('quantity')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos del checkout',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Formatear orden para respuesta
     */
    private function formatOrder($order): array
    {
        $shippingAddress = json_decode($order->shipping_address, true);

        return [
            'id' => $order->id,
            'total' => (float) $order->total,
            'status' => $order->status,
            'payment_method' => $order->payment_method,
            'payment_id' => $order->payment_id,
            'created_at' => $order->created_at->format('Y-m-d H:i:s'),
            'shipping_address' => $shippingAddress,
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'subtotal' => (float) ($item->price * $item->quantity),
                    'game' => [
                        'id' => $item->game->id,
                        'name' => $item->game->name,
                        'image' => $item->game->image,
                        'console' => $item->game->console->name
                    ]
                ];
            })
        ];
    }

    /**
     * Preparar datos para el proceso de pago
     */
    private function preparePaymentData($order, $paymentMethod): array
    {
        return [
            'order_id' => $order->id,
            'amount' => $order->total,
            'currency' => 'EUR',
            'payment_method' => $paymentMethod,
            'description' => "Orden #{$order->id} - Retro Time",
            // Aquí se agregarán los datos específicos de Stripe/PayPal más adelante
        ];
    }
}