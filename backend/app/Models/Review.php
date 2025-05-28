<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ReviewVote;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'game_id',
        'order_id',
        'rating',
        'title',
        'comment',
        'is_verified_purchase',
        'helpful_count'
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified_purchase' => 'boolean',
        'helpful_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Usuario que escribió la reseña
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Juego reseñado
     */
    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * Orden asociada (si aplica)
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Votos de utilidad
     */
    public function votes()
    {
        return $this->hasMany(ReviewVote::class);
    }

    /**
     * Verificar si un usuario ha votado esta reseña
     */
    public function hasVotedBy($userId)
    {
        return $this->votes()->where('user_id', $userId)->exists();
    }

    /**
     * Obtener el voto de un usuario específico
     */
    public function getUserVote($userId)
    {
        return $this->votes()->where('user_id', $userId)->first();
    }
}