<?php
// app/Models/Category.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con los juegos (many-to-many)
     */
    public function games()
    {
        return $this->belongsToMany(Game::class, 'game_category');
    }

    /**
     * Scope para búsqueda
     */
    public function scopeSearch($query, $term)
    {
        if (!$term) {
            return $query;
        }

        return $query->where(function($q) use ($term) {
            $q->where('name', 'LIKE', "%{$term}%")
              ->orWhere('slug', 'LIKE', "%{$term}%");
        });
    }

    /**
     * Boot del modelo para manejar eventos
     */
    protected static function boot()
    {
        parent::boot();

        // Al eliminar una categoría, asegurar que no tiene juegos
        static::deleting(function ($category) {
            if ($category->games()->count() > 0) {
                throw new \Exception('No se puede eliminar la categoría porque tiene juegos asociados');
            }
        });
    }
}