<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Game;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CartService
{
    /**
     * Add item to cart
     */
    public function addToCart(User $user, int $gameId, int $quantity): CartItem
    {
        return DB::transaction(function () use ($user, $gameId, $quantity) {
            $game = Game::lockForUpdate()->findOrFail($gameId);
            
            // Verificar stock
            if ($game->stock < $quantity) {
                throw new \Exception('Stock insuficiente');
            }
            
            // Buscar item existente
            $cartItem = CartItem::where('user_id', $user->id)
                ->where('game_id', $gameId)
                ->first();
            
            if ($cartItem) {
                $newQuantity = $cartItem->quantity + $quantity;
                
                if ($game->stock < $newQuantity) {
                    throw new \Exception('Stock insuficiente para la cantidad solicitada');
                }
                
                $cartItem->quantity = $newQuantity;
                $cartItem->save();
            } else {
                $cartItem = CartItem::create([
                    'user_id' => $user->id,
                    'game_id' => $gameId,
                    'quantity' => $quantity,
                    'price' => $game->sale_price ?? $game->price
                ]);
            }
            
            return $cartItem;
        });
    }
    
    /**
     * Update cart item quantity
     */
    public function updateQuantity(User $user, int $itemId, int $quantity): CartItem
    {
        return DB::transaction(function () use ($user, $itemId, $quantity) {
            $cartItem = CartItem::where('user_id', $user->id)
                ->where('id', $itemId)
                ->lockForUpdate()
                ->firstOrFail();
            
            $game = Game::lockForUpdate()->findOrFail($cartItem->game_id);
            
            if ($game->stock < $quantity) {
                throw new \Exception('Stock insuficiente');
            }
            
            $cartItem->quantity = $quantity;
            $cartItem->save();
            
            return $cartItem;
        });
    }
    
    /**
     * Remove item from cart
     */
    public function removeItem(User $user, int $itemId): bool
    {
        return CartItem::where('user_id', $user->id)
            ->where('id', $itemId)
            ->delete() > 0;
    }
    
    /**
     * Clear user's cart
     */
    public function clearCart(User $user): bool
    {
        return CartItem::where('user_id', $user->id)->delete() > 0;
    }
    
    /**
     * Get cart summary
     */
    public function getCartSummary(User $user): array
    {
        $items = CartItem::with('game')
            ->where('user_id', $user->id)
            ->get();
        
        $subtotal = $items->sum(function ($item) {
            return $item->price * $item->quantity;
        });
        
        $shipping = $this->calculateShipping($subtotal);
        $tax = $this->calculateTax($subtotal);
        $total = $subtotal + $shipping + $tax;
        
        return [
            'items' => $items,
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => $total,
            'item_count' => $items->sum('quantity')
        ];
    }
    
    /**
     * Calculate shipping cost
     */
    private function calculateShipping(float $subtotal): float
    {
        // Envío gratis para pedidos superiores a 50€
        return $subtotal >= 50 ? 0 : 4.99;
    }
    
    /**
     * Calculate tax
     */
    private function calculateTax(float $subtotal): float
    {
        // 21% IVA (ya incluido en el precio)
        return 0;
    }
    
    /**
     * Validate cart before checkout
     */
    public function validateCart(User $user): array
    {
        $items = CartItem::with('game')
            ->where('user_id', $user->id)
            ->get();
        
        $errors = [];
        $validItems = [];
        
        foreach ($items as $item) {
            if ($item->game->stock < $item->quantity) {
                $errors[] = [
                    'game' => $item->game->name,
                    'requested' => $item->quantity,
                    'available' => $item->game->stock
                ];
            } else {
                $validItems[] = $item;
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'items' => $validItems
        ];
    }
}