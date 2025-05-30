<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewVote extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_id',
        'user_id',
        'vote', // Puede ser booleano (true=útil, false=no útil) o integer (1/-1)
    ];

    protected $casts = [
        'vote' => 'boolean',
    ];

    /**
     * Relación con la reseña
     */
    public function review()
    {
        return $this->belongsTo(Review::class);
    }

    /**
     * Relación con el usuario que vota
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}