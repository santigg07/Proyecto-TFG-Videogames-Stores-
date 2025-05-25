<?php
// app/Models/GameImage.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'image_path',
        'is_main',
        'alt_text',
        'sort_order'
    ];

    protected $casts = [
        'is_main' => 'boolean'
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    // Accessor para obtener la URL completa de la imagen
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->image_path);
    }
}