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
     * Obtener todos los elementos de la lista de deseos del usuario
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            $wishlistItems = WishlistItem::with(['game.console'])
                ->where('user_id', $user->id)
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $wishlistItems
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar la lista de deseos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Añadir un juego a la lista de deseos
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'game_id' => 'required|exists:games,id'
            ]);
            
            $user = Auth::user();
            
            // Verificar si ya existe en la lista
            $existingItem = WishlistItem::where('user_id', $user->id)
                ->where('game_id', $request->game_id)
                ->first();
                
            if ($existingItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'El juego ya está en tu lista de deseos'
                ], 409);
            }
            
            $wishlistItem = WishlistItem::create([
                'user_id' => $user->id,
                'game_id' => $request->game_id
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Juego añadido a la lista de deseos',
                'data' => $wishlistItem
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al añadir a la lista de deseos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un juego de la lista de deseos
     */
    public function destroy($gameId)
    {
        try {
            $user = Auth::user();
            
            $wishlistItem = WishlistItem::where('user_id', $user->id)
                ->where('game_id', $gameId)
                ->first();
                
            if (!$wishlistItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'El juego no está en tu lista de deseos'
                ], 404);
            }
            
            $wishlistItem->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Juego eliminado de la lista de deseos'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar de la lista de deseos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar si un juego está en la lista de deseos
     */
    public function check($gameId)
    {
        try {
            $user = Auth::user();
            
            $isInWishlist = WishlistItem::where('user_id', $user->id)
                ->where('game_id', $gameId)
                ->exists();
            
            return response()->json([
                'success' => true,
                'in_wishlist' => $isInWishlist
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar la lista de deseos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Limpiar toda la lista de deseos del usuario
     */
    public function clearAll()
    {
        try {
            $user = Auth::user();
            
            $deletedCount = WishlistItem::where('user_id', $user->id)->delete();
            
            return response()->json([
                'success' => true,
                'message' => "Se eliminaron {$deletedCount} juegos de tu lista de deseos"
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al limpiar la lista de deseos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}