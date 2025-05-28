<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Game;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Mail\OrderConfirmation;
use Illuminate\Support\Facades\Mail;


class StripeController extends Controller
{
    /**
     * Crear un Payment Intent de Stripe (simulado para desarrollo)
     */
    public function createPaymentIntent(Request $request)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0.50',
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

            // Calcular el total
            $total = $cartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            // MODO DESARROLLO: Simular Payment Intent
            $paymentIntentId = 'pi_development_' . uniqid();
            
            // Guardar datos temporales en sesión
            session([
                'payment_intent_id' => $paymentIntentId,
                'shipping_address' => $validated['shipping_address'],
                'cart_items' => $cartItems->toArray(),
                'cart_total' => $total
            ]);

            Log::info('Payment Intent creado', [
                'payment_intent_id' => $paymentIntentId,
                'user_id' => $user->id,
                'total' => $total
            ]);

            return response()->json([
                'success' => true,
                'client_secret' => 'development_secret_' . uniqid(),
                'payment_intent_id' => $paymentIntentId
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en createPaymentIntent: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar y confirmar el pago (simulado para desarrollo)
     */
    public function verifyPayment(Request $request)
    {
        DB::beginTransaction();

        try {
            $validated = $request->validate([
                'payment_intent_id' => 'required|string',
                'shipping_address' => 'required|array'
            ]);

            $user = Auth::user();
            
            if (!$user) {
                throw new \Exception('Usuario no autenticado');
            }

            // MODO DESARROLLO: Aceptar cualquier payment intent que empiece con 'pi_development_'
            if (!str_starts_with($validated['payment_intent_id'], 'pi_development_')) {
                Log::warning('Payment intent no válido para desarrollo: ' . $validated['payment_intent_id']);
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

            // Crear la orden
            $order = Order::create([
                'user_id' => $user->id,
                'total' => $total,
                'status' => 'completed',
                'payment_method' => 'stripe',
                'payment_id' => $validated['payment_intent_id'],
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
            session()->forget(['payment_intent_id', 'shipping_address', 'cart_items', 'cart_total']);

            DB::commit();

            Log::info('Pago verificado exitosamente', [
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_intent_id' => $validated['payment_intent_id']
            ]);

            // Cargar las relaciones necesarias
            $order->load(['items.game.console']);

            return response()->json([
                'success' => true,
                'message' => 'Pago procesado exitosamente',
                'order' => $order
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error en verifyPayment: ' . $e->getMessage() . ' - Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manejar webhooks de Stripe (stub para desarrollo)
     */
    public function handleWebhook(Request $request)
    {
        Log::info('Webhook recibido', $request->all());
        return response()->json(['status' => 'success']);
    }
}