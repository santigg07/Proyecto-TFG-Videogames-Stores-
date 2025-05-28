<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    /**
     * Mostrar el carrito del usuario
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        
        $cartItems = CartItem::with(['game.console'])
            ->where('user_id', $user->id)
            ->get();
            
        return response()->json([
            'success' => true,
            'items' => $cartItems,
            'total' => $cartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            })
        ]);
    }

    /**
     * Añadir artículo a la cesta
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $user = Auth::user();
        $game = Game::findOrFail($validated['game_id']);

        // Verificar stock disponible
        if ($game->stock < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => 'No hay suficiente stock disponible'
            ], 400);
        }

        // Buscar si el item ya existe en el carrito
        $cartItem = CartItem::where('user_id', $user->id)
            ->where('game_id', $validated['game_id'])
            ->first();

        if ($cartItem) {
            // Si existe, actualizar cantidad
            $newQuantity = $cartItem->quantity + $validated['quantity'];
            
            if ($game->stock < $newQuantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay suficiente stock disponible'
                ], 400);
            }
            
            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            // Si no existe, crear nuevo item
            $cartItem = CartItem::create([
                'user_id' => $user->id,
                'game_id' => $validated['game_id'],
                'quantity' => $validated['quantity'],
                'price' => $game->sale_price ?? $game->price
            ]);
        }

        // Cargar relaciones para la respuesta
        $cartItem->load(['game.console']);

        return response()->json([
            'success' => true,
            'message' => 'Producto añadido al carrito',
            'item' => $cartItem
        ]);
    }

    /**
     * Actualizar la cantidad de artículos del carrito
     */
    public function update(Request $request, int $itemId): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $user = Auth::user();
        
        $cartItem = CartItem::where('user_id', $user->id)
            ->where('id', $itemId)
            ->firstOrFail();

        $game = Game::findOrFail($cartItem->game_id);

        // Verificar stock disponible
        if ($game->stock < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => 'No hay suficiente stock disponible'
            ], 400);
        }

        $cartItem->quantity = $validated['quantity'];
        $cartItem->save();

        $cartItem->load(['game.console']);

        return response()->json([
            'success' => true,
            'message' => 'Cantidad actualizada',
            'item' => $cartItem
        ]);
    }

    /**
     * Eliminar un artículo del carrito
     */
    public function destroy(int $itemId): JsonResponse
    {
        $user = Auth::user();
        
        $cartItem = CartItem::where('user_id', $user->id)
            ->where('id', $itemId)
            ->firstOrFail();

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado del carrito'
        ]);
    }

    /**
     * Limpiar el carrito del usuario
     */
    public function clear(): JsonResponse
    {
        $user = Auth::user();
        
        CartItem::where('user_id', $user->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Carrito vaciado'
        ]);
    }

    /**
     * Obtener resumen del carrito
     */
    public function summary(): JsonResponse
    {
        $user = Auth::user();
        
        $cartItems = CartItem::with(['game'])
            ->where('user_id', $user->id)
            ->get();

        $subtotal = $cartItems->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $shipping = 0; // Envío gratis por ahora
        $total = $subtotal + $shipping;

        return response()->json([
            'success' => true,
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'total' => $total,
            'item_count' => $cartItems->sum('quantity')
        ]);
    }
}