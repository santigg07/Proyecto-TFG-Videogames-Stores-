<?php

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

    /**
     * Obtener los juegos asociados con esta categoría.
     */
    public function games()
    {
        return $this->belongsToMany(Game::class, 'game_category');
    }
}