<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'image_path',
        'is_main'
    ];

    /**
     * Obtener el juego al que pertenece esta imagen.
     */
    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}