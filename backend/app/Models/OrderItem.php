<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'game_id',
        'quantity',
        'price',
    ];

    /**
     * Obtener el pedido al que pertenece este ítem.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Obtener el juego asociado a este ítem de pedido.
     */
    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * Calcular el subtotal para este ítem.
     *
     * @return float
     */
    public function getSubtotalAttribute()
    {
        return $this->price * $this->quantity;
    }
}