<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


// Rutas para consolas
Route::get('/consoles', [App\Http\Controllers\Api\ConsoleController::class, 'index']);
Route::get('/consoles/{slug}', [App\Http\Controllers\Api\ConsoleController::class, 'show']);

// Rutas para juegos
Route::get('/games', [App\Http\Controllers\Api\GameController::class, 'index']);
Route::get('/games/console/{consoleSlug}', [App\Http\Controllers\Api\GameController::class, 'getByConsole']);
Route::get('/games/{slug}', [App\Http\Controllers\Api\GameController::class, 'show']);



















/* Rutas protegidas que requieren autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Rutas públicas
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
*/