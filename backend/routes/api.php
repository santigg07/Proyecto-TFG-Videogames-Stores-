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

// Rutas protegidas que requieren autenticación
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