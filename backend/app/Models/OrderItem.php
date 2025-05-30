<?php
// backend/app/Models/OrderItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'game_id',
        'quantity',
        'price'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer'
    ];

    /**
     * Obtener la orden que posee el artículo.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Obtener la orden propietaria del artículo.
     */
    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * Obtener el subtotal de este artículo
     */
    public function getSubtotalAttribute()
    {
        return $this->price * $this->quantity;
    }
}