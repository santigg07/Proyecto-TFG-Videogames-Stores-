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
        'shipping_address',
        'tracking_number',
        'shipping_carrier',
        'shipping_status',
        'shipped_at',
        'delivered_at',
        'shipping_notes'
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'shipping_address' => 'array',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Obtener el usuario propietario del pedido.
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
     * Obtiene los artículos del pedido (alias por compatibilidad).
     */
    public function orderItems()
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
     * Obtener el formato del método de pago
     */
    public function getFormattedPaymentMethodAttribute()
    {
        $methods = [
            'stripe' => 'Tarjeta de Crédito',
            'paypal' => 'PayPal'
        ];

        return $methods[$this->payment_method] ?? $this->payment_method;
    }

    // Método para obtener el estado de envío formateado
    public function getShippingStatusTextAttribute()
    {
        $statuses = [
            'pending' => 'Pendiente',
            'preparing' => 'Preparando',
            'shipped' => 'Enviado',
            'in_transit' => 'En tránsito',
            'delivered' => 'Entregado',
            'returned' => 'Devuelto'
        ];
        
        return $statuses[$this->shipping_status] ?? $this->shipping_status;
    }

    // Método para verificar si se puede trackear
    public function isTrackable()
    {
        return $this->tracking_number && $this->shipping_carrier;
    }

    
}