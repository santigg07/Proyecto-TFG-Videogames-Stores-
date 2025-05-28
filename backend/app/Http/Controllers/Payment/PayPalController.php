<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Game;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmation;

class PayPalController extends Controller
{
    /**
     * Crear orden de PayPal (simulado para desarrollo)
     */
    public function createOrder(Request $request)
    {
        try {
            $validated = $request->validate([
                'shipping_address' => 'required|array',
                'shipping_address.address' => 'required|string',
                'shipping_address.city' => 'required|string',
                'shipping_address.postalCode' => 'required|string',
                'shipping_address.country' => 'required|string',
                'shipping_address.phone' => 'required|string',
            ]);

            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener items del carrito
            $cartItems = CartItem::with('game')
                ->where('user_id', $user->id)
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'El carrito está vacío'
                ], 400);
            }

            // Calcular total
            $total = $cartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            // MODO DESARROLLO: Simular orden de PayPal
            $orderId = 'PAYPAL_' . uniqid();
            
            // Guardar datos temporales en sesión
            session([
                'paypal_order_id' => $orderId,
                'shipping_address' => $validated['shipping_address'],
                'cart_items' => $cartItems->toArray(),
                'cart_total' => $total
            ]);

            return response()->json([
                'success' => true,
                'order_id' => $orderId,
                'approval_url' => '#' // En desarrollo no redirigimos
            ]);

        } catch (\Exception $e) {
            Log::error('Error en createOrder PayPal: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Capturar pago de PayPal (simulado para desarrollo)
     */
    public function captureOrder(Request $request)
    {
        DB::beginTransaction();

        try {
            $validated = $request->validate([
                'order_id' => 'required|string'
            ]);

            $user = Auth::user();
            
            if (!$user) {
                throw new \Exception('Usuario no autenticado');
            }

            // Obtener items del carrito
            $cartItems = CartItem::with('game')
                ->where('user_id', $user->id)
                ->get();

            if ($cartItems->isEmpty()) {
                throw new \Exception('El carrito está vacío');
            }

            // Calcular total
            $total = $cartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            // Obtener dirección de envío de la sesión
            $shippingAddress = session('shipping_address', []);

            // Crear la orden
            $order = Order::create([
                'user_id' => $user->id,
                'total' => $total,
                'status' => 'completed',
                'payment_method' => 'paypal',
                'payment_id' => $validated['order_id'],
                'shipping_address' => json_encode($shippingAddress)
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
                if ($game && $game->stock >= $item->quantity) {
                    $game->stock -= $item->quantity;
                    $game->save();
                }
            }

            // Limpiar el carrito
            CartItem::where('user_id', $user->id)->delete();

            // Cargar relaciones para el email
            $order->load(['user', 'items.game.console']);

            // Enviar email de confirmación
            try {
                Mail::to($order->user->email)->send(new OrderConfirmation($order));
            } catch (\Exception $e) {
                Log::error('Error enviando email de confirmación: ' . $e->getMessage());
            }

            // Limpiar sesión
            session()->forget(['paypal_order_id', 'shipping_address', 'cart_items']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pago procesado exitosamente',
                'order' => $order->load('items.game')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error en captureOrder PayPal: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manejar webhooks de PayPal (stub para desarrollo)
     */
    public function handleWebhook(Request $request)
    {
        Log::info('PayPal Webhook recibido', $request->all());
        return response()->json(['status' => 'success']);
    }
}