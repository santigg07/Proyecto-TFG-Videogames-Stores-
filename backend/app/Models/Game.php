<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;
      
    protected $fillable = [
        'console_id',
        'name',
        'slug',
        'description',
        'price',
        'sale_price',
        'stock',
        'release_year',
        'condition',
        'manufacturer',
        'includes',
        'image'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock' => 'integer',
        'release_year' => 'integer'
    ];

    /**
     * Obtener la consola a la que pertenece este juego.
     */
    public function console()
    {
        return $this->belongsTo(Console::class);
    }

    /**
     * Obtener las categorías asociadas con este juego.
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'game_category');
    }

    /**
     * Obtener todas las imágenes asociadas con este juego.
     */
    public function images()
    {
        return $this->hasMany(GameImage::class);
    }

    /**
     * Obtener la imagen principal del juego.
     */
    public function mainImage()
    {
        return $this->hasOne(GameImage::class)->where('is_main', 1);
    }

    /**
     * NUEVA RELACIÓN: Obtener los items del carrito para este juego
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * NUEVA RELACIÓN: Obtener los items de wishlist para este juego
     */
    public function wishlistItems()
    {
        return $this->hasMany(WishlistItem::class);
    }

    /**
     * NUEVA RELACIÓN: Obtener los items de pedidos para este juego
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Obtener el precio final (teniendo en cuenta descuentos).
     */
    public function getFinalPriceAttribute()
    {
        return $this->sale_price ?? $this->price;
    }

    /**
     * NUEVO ATRIBUTO: Obtener el precio actual (alias de final_price)
     */
    public function getCurrentPriceAttribute()
    {
        return $this->final_price;
    }
     
    /**
     * Verificar si el juego tiene descuento.
     */
    public function getHasDiscountAttribute()
    {
        return !is_null($this->sale_price) && $this->sale_price < $this->price;
    }

    /**
     * NUEVO ATRIBUTO: Verificar si el juego está en stock
     */
    public function getInStockAttribute()
    {
        return $this->stock > 0;
    }

    /**
     * NUEVO ATRIBUTO: Verificar si está en oferta
     */
    public function getIsOnSaleAttribute()
    {
        return $this->has_discount;
    }
}