<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'total',
        'status',
        'payment_method',
        'payment_id',
        'shipping_address',
    ];

    /**
     * Los estados posibles para un pedido.
     */
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Los métodos de pago disponibles.
     */
    const PAYMENT_STRIPE = 'stripe';
    const PAYMENT_PAYPAL = 'paypal';

    /**
     * Obtener el usuario que realizó este pedido.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtener los ítems de este pedido.
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Calcular el total del pedido basado en los ítems.
     */
    public function calculateTotal()
    {
        return $this->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });
    }

    /**
     * Comprobar si un pedido puede ser cancelado.
     *
     * @return bool
     */
    public function canBeCancelled()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_PROCESSING]);
    }

    /**
     * Scope para filtrar por estado.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para filtrar pedidos recientes.
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}