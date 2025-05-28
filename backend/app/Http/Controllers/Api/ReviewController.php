<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Game;
use App\Models\Order;
use App\Models\ReviewVote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Obtener reseñas de un juego
     */
    public function index($gameId)
    {
        $reviews = Review::with('user')
            ->where('game_id', $gameId)
            ->orderBy('helpful_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        // Si el usuario está autenticado, verificar sus votos
        if (Auth::check()) {
            $userId = Auth::id();
            $reviews->getCollection()->transform(function ($review) use ($userId) {
                $vote = $review->getUserVote($userId);
                $review->user_vote = $vote ? $vote->is_helpful : null;
                return $review;
            });
        }
        
        return response()->json($reviews);
    }
    
    /**
     * Crear una nueva reseña
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'order_id' => 'nullable|exists:orders,id',
            'rating' => 'required|integer|between:1,5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:1000'
        ]);
        
        $userId = Auth::id();
        
        // Verificar si el usuario ya ha reseñado este juego con esta orden
        $existingReview = Review::where('user_id', $userId)
            ->where('game_id', $validated['game_id'])
            ->where('order_id', $validated['order_id'])
            ->first();
            
        if ($existingReview) {
            return response()->json([
                'error' => 'Ya has reseñado este producto'
            ], 422);
        }
        
        // Verificar si es una compra verificada
        $isVerifiedPurchase = false;
        if ($validated['order_id']) {
            $order = Order::where('id', $validated['order_id'])
                ->where('user_id', $userId)
                ->where('status', 'completed')
                ->whereHas('items', function($query) use ($validated) {
                    $query->where('game_id', $validated['game_id']);
                })
                ->exists();
                
            $isVerifiedPurchase = $order;
        }
        
        // Crear la reseña
        $review = Review::create([
            'user_id' => $userId,
            'game_id' => $validated['game_id'],
            'order_id' => $validated['order_id'],
            'rating' => $validated['rating'],
            'title' => $validated['title'],
            'comment' => $validated['comment'],
            'is_verified_purchase' => $isVerifiedPurchase
        ]);
        
        // Actualizar el rating promedio del juego
        $this->updateGameRating($validated['game_id']);
        
        return response()->json([
            'success' => true,
            'review' => $review->load('user')
        ]);
    }
    
    /**
     * Votar si una reseña es útil
     */
    public function vote(Request $request, $reviewId)
    {
        $validated = $request->validate([
            'is_helpful' => 'required|boolean'
        ]);
        
        $userId = Auth::id();
        $review = Review::findOrFail($reviewId);
        
        // No se puede votar la propia reseña
        if ($review->user_id === $userId) {
            return response()->json([
                'error' => 'No puedes votar tu propia reseña'
            ], 422);
        }
        
        DB::beginTransaction();
        
        try {
            // Buscar voto existente
            $existingVote = ReviewVote::where('user_id', $userId)
                ->where('review_id', $reviewId)
                ->first();
                
            if ($existingVote) {
                // Si el voto es el mismo, eliminarlo (toggle)
                if ($existingVote->is_helpful === $validated['is_helpful']) {
                    $existingVote->delete();
                    $review->decrement('helpful_count');
                } else {
                    // Cambiar el voto
                    $existingVote->update(['is_helpful' => $validated['is_helpful']]);
                    if ($validated['is_helpful']) {
                        $review->increment('helpful_count', 2); // +2 porque antes era negativo
                    } else {
                        $review->decrement('helpful_count', 2); // -2 porque antes era positivo
                    }
                }
            } else {
                // Crear nuevo voto
                ReviewVote::create([
                    'user_id' => $userId,
                    'review_id' => $reviewId,
                    'is_helpful' => $validated['is_helpful']
                ]);
                
                if ($validated['is_helpful']) {
                    $review->increment('helpful_count');
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'helpful_count' => $review->fresh()->helpful_count
            ]);
            
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Error al procesar el voto'], 500);
        }
    }
    
    /**
     * Verificar si el usuario puede reseñar un juego
     */
    public function canReview($gameId)
    {
        $userId = Auth::id();
        
        // Verificar si ya ha reseñado
        $hasReviewed = Review::where('user_id', $userId)
            ->where('game_id', $gameId)
            ->exists();
            
        // Verificar si ha comprado el juego
        $hasPurchased = Order::where('user_id', $userId)
            ->where('status', 'completed')
            ->whereHas('items', function($query) use ($gameId) {
                $query->where('game_id', $gameId);
            })
            ->exists();
            
        return response()->json([
            'can_review' => !$hasReviewed,
            'has_purchased' => $hasPurchased,
            'has_reviewed' => $hasReviewed
        ]);
    }
    
    /**
     * Actualizar el rating promedio del juego
     */
    private function updateGameRating($gameId)
    {
        $avgRating = Review::where('game_id', $gameId)->avg('rating');
        $totalReviews = Review::where('game_id', $gameId)->count();
        
        // Aquí podrías actualizar campos en la tabla games si los tienes
        // Game::where('id', $gameId)->update([
        //     'average_rating' => $avgRating,
        //     'total_reviews' => $totalReviews
        // ]);
    }
}