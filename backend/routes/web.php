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