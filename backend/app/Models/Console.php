<?php
// app/Models/Console.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Console extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'manufacturer',
        'image'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con los juegos
     */
    public function games()
    {
        return $this->hasMany(Game::class, 'console_id');
    }

    /**
     * Accessor para la URL completa de la imagen
     */
    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }

        // Si ya es una URL completa, devolverla tal como está
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        // Construir la URL completa
        return url('storage/' . $this->image);
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
              ->orWhere('manufacturer', 'LIKE', "%{$term}%")
              ->orWhere('slug', 'LIKE', "%{$term}%");
        });
    }

    /**
     * Scope para filtrar por fabricante
     */
    public function scopeByManufacturer($query, $manufacturer)
    {
        if (!$manufacturer) {
            return $query;
        }

        return $query->where('manufacturer', $manufacturer);
    }

    /**
     * Boot del modelo para manejar eventos
     */
    protected static function boot()
    {
        parent::boot();

        // Al eliminar una consola, asegurar que no tiene juegos
        static::deleting(function ($console) {
            if ($console->games()->count() > 0) {
                throw new \Exception('No se puede eliminar la consola porque tiene juegos asociados');
            }
        });
    }
}