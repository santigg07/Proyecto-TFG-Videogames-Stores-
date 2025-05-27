<?php
// backend/app/Models/Order.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total',
        'status',
        'payment_method',
        'payment_id',
        'shipping_address'
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'shipping_address' => 'array'
    ];

    /**
     * Obtener el usuario propietario de la orden.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtener los artículos para el pedido.
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Obtener estado formateado
     */
    public function getFormattedStatusAttribute()
    {
        $statuses = [
            'pending' => 'Pendiente',
            'processing' => 'Procesando',
            'completed' => 'Completado',
            'cancelled' => 'Cancelado'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Obtener el formato de la forma de pago
     */
    public function getFormattedPaymentMethodAttribute()
    {
        $methods = [
            'stripe' => 'Tarjeta de Crédito',
            'paypal' => 'PayPal'
        ];

        return $methods[$this->payment_method] ?? $this->payment_method;
    }
}