<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class CartController extends Controller
{
    /**
     * Obtener el carrito actual
     *
     * @return \Illuminate\Http\Response
     */
    public function getCart()
    {
        $cart = $this->getCurrentCart();
        $cartItems = $this->getCartWithDetails($cart);
        
        return response()->json([
            'items' => $cartItems,
            'total' => $this->calculateTotal($cartItems)
        ]);
    }
    
    /**
     * Añadir un juego al carrito
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'game_id' => 'required|exists:games,id',
            'quantity' => 'required|integer|min:1'
        ]);
        
        $gameId = $request->game_id;
        $quantity = $request->quantity;
        
        // Verificar que el juego existe y hay stock suficiente
        $game = Game::findOrFail($gameId);
        
        if ($game->stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'No hay suficiente stock disponible'
            ], 400);
        }
        
        $cart = $this->getCurrentCart();
        
        // Si el juego ya está en el carrito, actualizar cantidad
        if (isset($cart[$gameId])) {
            $cart[$gameId] += $quantity;
        } else {
            $cart[$gameId] = $quantity;
        }
        
        $this->storeCart($cart);
        
        $cartItems = $this->getCartWithDetails($cart);
        
        return response()->json([
            'success' => true,
            'message' => 'Producto añadido al carrito',
            'items' => $cartItems,
            'total' => $this->calculateTotal($cartItems)
        ]);
    }
    
    /**
     * Actualizar la cantidad de un producto en el carrito
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateCart(Request $request)
    {
        $request->validate([
            'game_id' => 'required|exists:games,id',
            'quantity' => 'required|integer|min:1'
        ]);
        
        $gameId = $request->game_id;
        $quantity = $request->quantity;
        
        // Verificar stock
        $game = Game::findOrFail($gameId);
        if ($game->stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'No hay suficiente stock disponible'
            ], 400);
        }
        
        $cart = $this->getCurrentCart();
        
        if (!isset($cart[$gameId])) {
            return response()->json([
                'success' => false,
                'message' => 'Este producto no está en el carrito'
            ], 404);
        }
        
        $cart[$gameId] = $quantity;
        $this->storeCart($cart);
        
        $cartItems = $this->getCartWithDetails($cart);
        
        return response()->json([
            'success' => true,
            'message' => 'Carrito actualizado',
            'items' => $cartItems,
            'total' => $this->calculateTotal($cartItems)
        ]);
    }
    
    /**
     * Eliminar un producto del carrito
     *
     * @param  int  $id ID del juego
     * @return \Illuminate\Http\Response
     */
    public function removeFromCart($id)
    {
        $cart = $this->getCurrentCart();
        
        if (!isset($cart[$id])) {
            return response()->json([
                'success' => false,
                'message' => 'Este producto no está en el carrito'
            ], 404);
        }
        
        unset($cart[$id]);
        $this->storeCart($cart);
        
        $cartItems = $this->getCartWithDetails($cart);
        
        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado del carrito',
            'items' => $cartItems,
            'total' => $this->calculateTotal($cartItems)
        ]);
    }
    
    /**
     * Vaciar el carrito
     *
     * @return \Illuminate\Http\Response
     */
    public function clearCart()
    {
        $this->storeCart([]);
        
        return response()->json([
            'success' => true,
            'message' => 'Carrito vaciado',
            'items' => [],
            'total' => 0
        ]);
    }
    
    /**
     * Obtener el carrito actual (de la base de datos para usuarios autenticados o de la sesión)
     *
     * @return array
     */
    private function getCurrentCart()
    {
        if (Auth::check()) {
            // Para usuarios autenticados podríamos obtener el carrito de la base de datos
            // Esto requeriría una tabla 'cart_items' relacionada con 'users'
            return []; // Implementar lógica real aquí
        } else {
            // Para usuarios no autenticados, usar sesión
            return Session::get('cart', []);
        }
    }
    
    /**
     * Guardar el carrito (en la base de datos para usuarios autenticados o en la sesión)
     *
     * @param  array  $cart
     * @return void
     */
    private function storeCart($cart)
    {
        if (Auth::check()) {
            // Para usuarios autenticados podríamos guardar el carrito en la base de datos
            // Implementar lógica real aquí
        } else {
            // Para usuarios no autenticados, guardar en sesión
            Session::put('cart', $cart);
        }
    }
    
    /**
     * Obtener detalles completos de los productos en el carrito
     *
     * @param  array  $cart
     * @return array
     */
    private function getCartWithDetails($cart)
    {
        $items = [];
        
        foreach ($cart as $gameId => $quantity) {
            $game = Game::with('console')->find($gameId);
            
            if ($game) {
                $price = $game->sale_price ?? $game->price;
                
                $items[] = [
                    'id' => $game->id,
                    'name' => $game->name,
                    'slug' => $game->slug,
                    'console' => $game->console->name,
                    'price' => $price,
                    'regular_price' => $game->price,
                    'quantity' => $quantity,
                    'subtotal' => $price * $quantity,
                    'image' => $game->image,
                    'stock' => $game->stock
                ];
            }
        }
        
        return $items;
    }
    
    /**
     * Calcular el total del carrito
     *
     * @param  array  $items
     * @return float
     */
    private function calculateTotal($items)
    {
        $total = 0;
        
        foreach ($items as $item) {
            $total += $item['subtotal'];
        }
        
        return $total;
    }
}