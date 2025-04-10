<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Console extends Model {
    use HasFactory;

    protected $filllable = [
        'name',
        'slug',
        'manufacturer',
        'image',
    ];

    /**
    * Obtener los juegos que pertenecen a esta consola.
    */
    public function games() {
        return $this->hasMany(Game::class);
    }
}
