<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class OrderController extends Controller
{
    /**
     * Mostrar todos los pedidos del usuario autenticado
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $userId = Auth::id();
        
        $orders = Order::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'total' => $order->total,
                    'status' => $order->status,
                    'payment_method' => $order->payment_method,
                    'created_at' => $order->created_at,
                    'items_count' => $order->items->count()
                ];
            });
        
        return response()->json($orders);
    }
    
    /**
     * Mostrar un pedido específico
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $userId = Auth::id();
        
        $order = Order::where('id', $id)
            ->where('user_id', $userId)
            ->with(['items.game.console'])
            ->firstOrFail();
        
        $orderData = [
            'id' => $order->id,
            'total' => $order->total,
            'status' => $order->status,
            'payment_method' => $order->payment_method,
            'payment_id' => $order->payment_id,
            'shipping_address' => $order->shipping_address,
            'created_at' => $order->created_at,
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'game_id' => $item->game_id,
                    'name' => $item->game->name,
                    'console' => $item->game->console->name,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->price * $item->quantity,
                    'image' => $item->game->image
                ];
            })
        ];
        
        return response()->json($orderData);
    }
    
    /**
     * Crear un nuevo pedido
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:stripe,paypal',
            'payment_id' => 'required|string',
            'shipping_address' => 'required|string'
        ]);
        
        $userId = Auth::id();
        $cart = $this->getCurrentCart();
        
        if (empty($cart)) {
            return response()->json([
                'success' => false,
                'message' => 'El carrito está vacío'
            ], 400);
        }
        
        // Obtener detalles de los productos
        $cartItems = [];
        $total = 0;
        
        foreach ($cart as $gameId => $quantity) {
            $game = Game::find($gameId);
            
            if (!$game) {
                continue;
            }
            
            if ($game->stock < $quantity) {
                return response()->json([
                    'success' => false,
                    'message' => "No hay suficiente stock de {$game->name}"
                ], 400);
            }
            
            $price = $game->sale_price ?? $game->price;
            $subtotal = $price * $quantity;
            $total += $subtotal;
            
            $cartItems[] = [
                'game_id' => $game->id,
                'price' => $price,
                'quantity' => $quantity
            ];
        }
        
        // Comenzar transacción para garantizar consistencia
        DB::beginTransaction();
        
        try {
            // Crear la orden
            $order = new Order();
            $order->user_id = $userId;
            $order->total = $total;
            $order->status = 'pending';
            $order->payment_method = $request->payment_method;
            $order->payment_id = $request->payment_id;
            $order->shipping_address = $request->shipping_address;
            $order->save();
            
            // Crear los items de la orden
            foreach ($cartItems as $item) {
                $orderItem = new OrderItem();
                $orderItem->order_id = $order->id;
                $orderItem->game_id = $item['game_id'];
                $orderItem->quantity = $item['quantity'];
                $orderItem->price = $item['price'];
                $orderItem->save();
                
                // Actualizar stock
                $game = Game::find($item['game_id']);
                $game->stock -= $item['quantity'];
                $game->save();
            }
            
            // Vaciar el carrito
            $this->clearCart();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Pedido creado correctamente',
                'order_id' => $order->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el pedido: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Obtener el carrito actual
     *
     * @return array
     */
    private function getCurrentCart()
    {
        if (Auth::check()) {
            // Para usuarios autenticados se podría obtener de la base de datos
            // Implementar lógica real aquí
            return Session::get('cart', []);
        } else {
            return Session::get('cart', []);
        }
    }
    
    /**
     * Vaciar el carrito
     *
     * @return void
     */
    private function clearCart()
    {
        Session::forget('cart');
    }
}