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
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;

class StripeController extends Controller
{
    public function __construct()
    {
        // Configurar la clave secreta de Stripe
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Crear un Payment Intent de Stripe
     */
    public function createPaymentIntent(Request $request)
    {
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

        try {
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

            // Verificar que el total coincida
            if (abs($total - $validated['amount']) > 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => 'El total no coincide'
                ], 400);
            }

            // Crear Payment Intent en Stripe
            $paymentIntent = PaymentIntent::create([
                'amount' => intval($total * 100), // Stripe usa centavos
                'currency' => 'eur',
                'payment_method_types' => ['card'],
                'metadata' => [
                    'user_id' => $user->id,
                    'user_email' => $user->email
                ]
            ]);

            // Guardar datos temporales en sesión
            session([
                'payment_intent_id' => $paymentIntent->id,
                'shipping_address' => $validated['shipping_address'],
                'cart_items' => $cartItems->toArray()
            ]);

            return response()->json([
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id
            ]);

        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pago: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            Log::error('Payment Intent Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el pago'
            ], 500);
        }
    }

    /**
     * Verificar y confirmar el pago
     */
    public function verifyPayment(Request $request)
    {
        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
            'shipping_address' => 'required|array'
        ]);

        $user = Auth::user();

        DB::beginTransaction();

        try {
            // Recuperar el Payment Intent de Stripe
            $paymentIntent = PaymentIntent::retrieve($validated['payment_intent_id']);

            // Verificar que el pago fue exitoso
            if ($paymentIntent->status !== 'succeeded') {
                throw new \Exception('El pago no fue completado exitosamente');
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
                'payment_id' => $paymentIntent->id,
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
                if ($game) {
                    $game->stock -= $item->quantity;
                    $game->save();
                }
            }

            // Limpiar el carrito
            CartItem::where('user_id', $user->id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pago procesado exitosamente',
                'order' => $order->load('items.game')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment Verification Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manejar webhooks de Stripe
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig_header, $endpoint_secret
            );
        } catch(\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch(\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Manejar el evento
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                Log::info('Payment succeeded: ' . $paymentIntent->id);
                break;
                
            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                Log::error('Payment failed: ' . $paymentIntent->id);
                break;
                
            default:
                Log::info('Unhandled event type: ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }
}