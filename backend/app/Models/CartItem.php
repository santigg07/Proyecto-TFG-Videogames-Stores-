<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'game_id',
        'quantity',
        'price'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'user_id' => 'integer',
        'game_id' => 'integer'
    ];

    /**
     * Get the user that owns the cart item
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the game associated with the cart item
     */
    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * Get the total price for this cart item
     */
    public function getTotalAttribute()
    {
        return $this->price * $this->quantity;
    }
}