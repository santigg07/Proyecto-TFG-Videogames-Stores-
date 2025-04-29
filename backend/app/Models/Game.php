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
     * Obtener el precio final (teniendo en cuenta descuentos).
     */
    public function getFinalPriceAttribute()
    {
        return $this->sale_price ?? $this->price;
    }
    
    /**
     * Verificar si el juego tiene descuento.
     */
    public function getHasDiscountAttribute()
    {
        return !is_null($this->sale_price) && $this->sale_price < $this->price;
    }
}