<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Rutas de API
Route::prefix('api')->group(function () {
    Route::prefix('games')->group(function () {
        Route::get('/', function () {
            return response()->json([
                'data' => [
                    ['id' => 1, 'name' => 'Juego 1', 'price' => 59.99],
                    ['id' => 2, 'name' => 'Juego 2', 'price' => 49.99],
                ]
            ]);
        });
    });
});

// En routes/web.php
Route::get('/create-test-image', function () {
    $gamesPath = storage_path('app/public/games');
    
    // Crear directorio si no existe
    if (!file_exists($gamesPath)) {
        mkdir($gamesPath, 0775, true);
    }
    
    // Crear una imagen de prueba
    $imagePath = $gamesPath . '/test-image.jpg';
    
    // Usar una imagen simple (1x1 pixel negro)
    $image = base64_decode('R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=');
    file_put_contents($imagePath, $image);
    
    return response()->json([
        'success' => file_exists($imagePath),
        'path' => 'games/test-image.jpg',
        'full_path' => $imagePath
    ]);
});
Route::get('/test-symlink', function () {
    return response()->file(public_path('storage/games/super-mario-bros.jpg'));
});