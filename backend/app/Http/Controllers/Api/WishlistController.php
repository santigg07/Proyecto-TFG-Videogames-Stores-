<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    /**
     * Mostrar la lista de deseos del usuario autenticado
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $userId = Auth::id();
        
        $wishlistItems = WishlistItem::where('user_id', $userId)
            ->with(['game.console'])
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'game_id' => $item->game_id,
                    'name' => $item->game->name,
                    'slug' => $item->game->slug,
                    'console' => $item->game->console->name,
                    'price' => $item->game->sale_price ?? $item->game->price,
                    'regular_price' => $item->game->price,
                    'image' => $item->game->image,
                    'in_stock' => $item->game->stock > 0,
                    'added_at' => $item->created_at
                ];
            });
        
        return response()->json($wishlistItems);
    }
    
    /**
     * Añadir un juego a la lista de deseos
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function add(Request $request)
    {
        $request->validate([
            'game_id' => 'required|exists:games,id'
        ]);
        
        $userId = Auth::id();
        $gameId = $request->game_id;
        
        // Verificar si ya está en la lista de deseos
        $existing = WishlistItem::where('user_id', $userId)
            ->where('game_id', $gameId)
            ->first();
        
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Este juego ya está en tu lista de deseos'
            ], 400);
        }
        
        // Añadir a la lista de deseos
        $wishlistItem = new WishlistItem();
        $wishlistItem->user_id = $userId;
        $wishlistItem->game_id = $gameId;
        $wishlistItem->save();
        
        $game = Game::with('console')->find($gameId);
        
        return response()->json([
            'success' => true,
            'message' => 'Juego añadido a la lista de deseos',
            'item' => [
                'id' => $wishlistItem->id,
                'game_id' => $game->id,
                'name' => $game->name,
                'slug' => $game->slug,
                'console' => $game->console->name,
                'price' => $game->sale_price ?? $game->price,
                'regular_price' => $game->price,
                'image' => $game->image,
                'in_stock' => $game->stock > 0,
                'added_at' => $wishlistItem->created_at
            ]
        ]);
    }
    
    /**
     * Eliminar un juego de la lista de deseos
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function remove($id)
    {
        $userId = Auth::id();
        
        $wishlistItem = WishlistItem::where('id', $id)
            ->where('user_id', $userId)
            ->first();
        
        if (!$wishlistItem) {
            return response()->json([
                'success' => false,
                'message' => 'Este elemento no está en tu lista de deseos'
            ], 404);
        }
        
        $wishlistItem->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Juego eliminado de la lista de deseos'
        ]);
    }
}