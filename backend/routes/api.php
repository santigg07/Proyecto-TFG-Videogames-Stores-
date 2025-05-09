<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\ConsoleController;
use App\Http\Controllers\Api\CategoryController;

// Rutas de API

// Rutas para usuario autenticado
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas para consolas
Route::get('/consoles', [ConsoleController::class, 'index']);
Route::get('/consoles/{slug}', [ConsoleController::class, 'show']);

// Rutas para categorías
Route::get('/categories', [CategoryController::class, 'index']);

// Rutas para juegos
Route::get('/games', [GameController::class, 'index']);
Route::get('/games/search', [GameController::class, 'search']);
Route::get('/games/console/{consoleSlug}', [GameController::class, 'getByConsole']);
Route::get('/games/filter-data', [GameController::class, 'getFilterData']);  // Mover esta línea antes
Route::get('/games/{slug}', [GameController::class, 'show']);

// En routes/web.php o routes/api.php
Route::get('/test-image-path', function () {
    $paths = [];
    
    // Listar directorios
    $paths['storage_path'] = storage_path('app/public');
    $paths['public_path'] = public_path('storage');
    
    // Verificar si el directorio existe
    $paths['storage_exists'] = file_exists(storage_path('app/public'));
    $paths['public_storage_exists'] = file_exists(public_path('storage'));
    
    // Listar archivos en games
    $gamesPath = storage_path('app/public/games');
    $paths['games_dir_exists'] = file_exists($gamesPath);
    
    if ($paths['games_dir_exists']) {
        $paths['files_in_games'] = scandir($gamesPath);
    }
    
    return response()->json($paths);
});
Route::get('/test-symlink', function () {
    return response()->file(public_path('storage/games/super-mario-bros.jpg'));
});