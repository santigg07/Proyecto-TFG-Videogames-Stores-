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
use Illuminate\Support\Facades\Http;

class PayPalController extends Controller
{
    private $baseUrl;
    private $clientId;
    private $clientSecret;

    public function __construct()
    {
        $this->baseUrl = config('services.paypal.mode') === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';
            
        $this->clientId = config('services.paypal.client_id');
        $this->clientSecret = config('services.paypal.client_secret');
    }

    /**
     * Obtener token de acceso de PayPal
     */
    private function getAccessToken()
    {
        $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
            ->asForm()
            ->post($this->baseUrl . '/v1/oauth2/token', [
                'grant_type' => 'client_credentials'
            ]);

        if ($response->successful()) {
            return $response->json()['access_token'];
        }

        throw new \Exception('No se pudo obtener el token de PayPal');
    }

    /**
     * Crear orden de PayPal
     */
    public function createOrder(Request $request)
    {
        $validated = $request->validate([
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

            // Calcular total
            $total = $cartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            // Obtener token de acceso
            $accessToken = $this->getAccessToken();

            // Crear orden en PayPal
            $response = Http::withToken($accessToken)
                ->post($this->baseUrl . '/v2/checkout/orders', [
                    'intent' => 'CAPTURE',
                    'purchase_units' => [[
                        'amount' => [
                            'currency_code' => 'EUR',
                            'value' => number_format($total, 2, '.', '')
                        ],
                        'description' => 'Compra en Retro Time'
                    ]],
                    'application_context' => [
                        'brand_name' => 'Retro Time',
                        'return_url' => config('app.url') . '/checkout/success',
                        'cancel_url' => config('app.url') . '/checkout/cancel'
                    ]
                ]);

            if ($response->successful()) {
                $orderData = $response->json();
                
                // Guardar datos temporales en sesión
                session([
                    'paypal_order_id' => $orderData['id'],
                    'shipping_address' => $validated['shipping_address'],
                    'cart_items' => $cartItems->toArray()
                ]);

                return response()->json([
                    'success' => true,
                    'order_id' => $orderData['id'],
                    'approval_url' => collect($orderData['links'])->firstWhere('rel', 'approve')['href'] ?? null
                ]);
            }

            throw new \Exception('Error al crear la orden de PayPal');

        } catch (\Exception $e) {
            Log::error('PayPal Create Order Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Capturar pago de PayPal
     */
    public function captureOrder(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|string'
        ]);

        $user = Auth::user();

        DB::beginTransaction();

        try {
            // Obtener token de acceso
            $accessToken = $this->getAccessToken();

            // Capturar el pago
            $response = Http::withToken($accessToken)
                ->post($this->baseUrl . '/v2/checkout/orders/' . $validated['order_id'] . '/capture');

            if (!$response->successful()) {
                throw new \Exception('Error al capturar el pago');
            }

            $captureData = $response->json();

            // Verificar que el pago fue completado
            if ($captureData['status'] !== 'COMPLETED') {
                throw new \Exception('El pago no fue completado');
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
                if ($game) {
                    $game->stock -= $item->quantity;
                    $game->save();
                }
            }

            // Limpiar el carrito
            CartItem::where('user_id', $user->id)->delete();

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
            Log::error('PayPal Capture Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manejar webhooks de PayPal
     */
    public function handleWebhook(Request $request)
    {
        $headers = $request->headers->all();
        $body = $request->getContent();

        // Verificar la firma del webhook (implementar según documentación de PayPal)
        // Por ahora solo logueamos el evento

        $event = json_decode($body, true);

        Log::info('PayPal Webhook received', [
            'event_type' => $event['event_type'] ?? 'unknown',
            'resource' => $event['resource'] ?? []
        ]);

        switch ($event['event_type'] ?? '') {
            case 'CHECKOUT.ORDER.APPROVED':
                Log::info('Order approved: ' . ($event['resource']['id'] ?? 'unknown'));
                break;
                
            case 'PAYMENT.CAPTURE.COMPLETED':
                Log::info('Payment captured: ' . ($event['resource']['id'] ?? 'unknown'));
                break;
                
            default:
                Log::info('Unhandled PayPal event: ' . ($event['event_type'] ?? 'unknown'));
        }

        return response()->json(['status' => 'success']);
    }
}