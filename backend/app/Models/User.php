<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'city',
        'postal_code',
        'country',
        'birth_date',
        'role_id',
        'notifications_offers',
        'notifications_products',
        'notifications_orders',
        'notifications_newsletter',
        'privacy_public_profile',
        'privacy_wishlist',
        'privacy_purchase_history',
        'two_factor_enabled',
        'two_factor_secret',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'birth_date' => 'date',
        'notifications_offers' => 'boolean',
        'notifications_products' => 'boolean',
        'notifications_orders' => 'boolean',
        'notifications_newsletter' => 'boolean',
        'privacy_public_profile' => 'boolean',
        'privacy_wishlist' => 'boolean',
        'privacy_purchase_history' => 'boolean',
        'two_factor_enabled' => 'boolean',
    ];

    /**
     * Relación con el rol del usuario
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Relación con los pedidos del usuario
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Relación con los items de la lista de deseos
     */
    public function wishlistItems()
    {
        return $this->hasMany(WishlistItem::class);
    }

    /**
     * Verificar si el usuario es administrador
     */
    public function isAdmin()
    {
        return $this->role && $this->role->name === 'admin';
    }

    /**
     * Verificar si el usuario es cliente
     */
    public function isCustomer()
    {
        return $this->role && $this->role->name === 'customer';
    }

    /**
     * Obtener el nombre completo para mostrar
     */
    public function getDisplayNameAttribute()
    {
        return $this->name;
    }

    /**
     * Formatear la dirección completa
     */
    public function getFullAddressAttribute()
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->postal_code,
            $this->country
        ]);
        
        return implode(', ', $parts);
    }

    /**
     * Get the cart items for the user
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    // También puedes añadir estos métodos útiles:

    /**
     * Get the total items in cart
     */
    public function getCartItemsCountAttribute()
    {
        return $this->cartItems()->sum('quantity');
    }

    /**
     * Get the cart total
     */
    public function getCartTotalAttribute()
    {
        return $this->cartItems()->with('game')->get()->sum(function ($item) {
            return $item->price * $item->quantity;
        });
    }
}