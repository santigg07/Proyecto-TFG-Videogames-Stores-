<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WishlistItem extends Model
{
    use HasFactory;

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'game_id',
    ];

    /**
     * Obtener el usuario al que pertenece este ítem de la lista de deseos.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtener el juego de este ítem de la lista de deseos.
     */
    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}