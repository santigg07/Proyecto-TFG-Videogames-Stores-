<?php
// routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\ConsoleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;
// CORREGIR: Usar el namespace correcto para Admin
use App\Http\Controllers\Api\Admin\GameController as AdminGameController;

// Rutas de autenticación (públicas)
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');

// Rutas públicas para consolas y categorías
Route::get('/consoles', [ConsoleController::class, 'index']);
Route::get('/consoles/{slug}', [ConsoleController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Rutas públicas para juegos
Route::get('/games', [GameController::class, 'index']);
Route::get('/games/search', [GameController::class, 'search']);
Route::get('/games/filter-data', [GameController::class, 'getFilterData']);
Route::get('/games/console/{consoleSlug}', [GameController::class, 'getByConsole']);
Route::get('/games/{slug}', [GameController::class, 'show']);

// Rutas protegidas para admin - IMPORTANTE: Usar el middleware 'admin' que creamos
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // CRÍTICO: form-data DEBE ir primero antes de cualquier ruta con parámetros
    Route::get('/games/form-data', [AdminGameController::class, 'getFormData']);
    
    // CRUD de juegos
    Route::get('/games', [AdminGameController::class, 'index']);
    Route::post('/games', [AdminGameController::class, 'store']);
    Route::get('/games/{id}', [AdminGameController::class, 'show']);
    Route::put('/games/{id}', [AdminGameController::class, 'update']);
    Route::post('/games/{id}', [AdminGameController::class, 'update']); // Para FormData con _method
    Route::delete('/games/{id}', [AdminGameController::class, 'destroy']);
    
    // Manejo de imágenes
    Route::delete('/games/{gameId}/images/{imageId}', [AdminGameController::class, 'deleteImage']);

    // Rutas para gestión de consolas (solo admin)       
    // CRUD completo de consolas
    Route::apiResource('consoles', App\Http\Controllers\Api\ConsoleController::class);
    
    // Ruta adicional para obtener todas las consolas (para dropdowns)
    Route::get('consoles-all', [App\Http\Controllers\Api\ConsoleController::class, 'all']);
        
    
});

// Rutas protegidas que requieren autenticación
Route::middleware('auth:sanctum')->group(function () {
    
    // Información del usuario
    Route::get('/user', [UserController::class, 'show']);
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    
    // Estadísticas y actividad del usuario
    Route::get('/user/stats', [UserController::class, 'stats']);
    Route::get('/user/recent-activity', [UserController::class, 'recentActivity']);
    
    // Pedidos del usuario
    Route::get('/user/orders', [UserController::class, 'orders']);

    // Rutas para lista de deseos
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{gameId}', [WishlistController::class, 'destroy']);
    Route::get('/wishlist/check/{gameId}', [WishlistController::class, 'check']);
    Route::delete('/user/wishlist/clear', [WishlistController::class, 'clearAll']);
    
    // Configuración de seguridad
    Route::put('/user/password', [UserController::class, 'changePassword']);
    Route::get('/user/settings', [UserController::class, 'getSettings']);
    Route::put('/user/settings', [UserController::class, 'updateSettings']);
    Route::get('/user/security', function() {
        return response()->json(['two_factor_enabled' => false]);
    });
    
    // Gestión de datos
    Route::get('/user/export', [UserController::class, 'exportData']);
    Route::delete('/user/delete', [UserController::class, 'deleteAccount']);
    Route::delete('/user/data', [UserController::class, 'deleteUserData']);
    
    // Cerrar sesión en todos los dispositivos
    Route::post('/user/logout-all', function (Request $request) {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Sesión cerrada en todos los dispositivos']);
    });
    
    // Logout simple
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Ruta de prueba SIN middleware
Route::get('/test-admin', function() {
    try {
        $consoles = \App\Models\Console::orderBy('name')->get(['id', 'name']);
        $categories = \App\Models\Category::orderBy('name')->get(['id', 'name']);
        
        return response()->json([
            'success' => true,
            'consoles' => $consoles,
            'categories' => $categories,
            'message' => 'Datos obtenidos correctamente'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
});

/*
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\ConsoleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Admin\GameController as AdminGameController;


// Rutas de API

// Rutas de autenticación (públicas)
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');


// Rutas protegidas que requieren autenticación
Route::middleware('auth:sanctum')->group(function () {
    
    // Información del usuario
    Route::get('/user', [UserController::class, 'show']);
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    
    // Estadísticas y actividad del usuario
    Route::get('/user/stats', [UserController::class, 'stats']);
    Route::get('/user/recent-activity', [UserController::class, 'recentActivity']);
    
    // Pedidos del usuario
    Route::get('/user/orders', [UserController::class, 'orders']);


    // Rutas para lista de deseos (requieren autenticación)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist/{gameId}', [WishlistController::class, 'destroy']);
        Route::get('/wishlist/check/{gameId}', [WishlistController::class, 'check']);
        Route::delete('/user/wishlist/clear', [WishlistController::class, 'clearAll']); // Para el botón limpiar lista
    });
    
    // Configuración de seguridad
    Route::put('/user/password', [UserController::class, 'changePassword']);
    Route::get('/user/settings', [UserController::class, 'getSettings']);
    Route::put('/user/settings', [UserController::class, 'updateSettings']);
    Route::get('/user/security', function() {
        return response()->json(['two_factor_enabled' => false]); // Implementar 2FA más tarde
    });
    
    // Gestión de datos
    Route::get('/user/export', [UserController::class, 'exportData']);
    Route::delete('/user/delete', [UserController::class, 'deleteAccount']);
    Route::delete('/user/data', [UserController::class, 'deleteUserData']);
    
    // Cerrar sesión en todos los dispositivos
    Route::post('/user/logout-all', function (Illuminate\Http\Request $request) {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Sesión cerrada en todos los dispositivos']);
    });
    
});

// Rutas protegidas para admin
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // CRUD de juegos
    Route::get('/games', [AdminGameController::class, 'index']);
    Route::post('/games', [AdminGameController::class, 'store']);
    Route::get('/games/{id}', [AdminGameController::class, 'show']);
    Route::put('/games/{id}', [AdminGameController::class, 'update']);
    Route::delete('/games/{id}', [AdminGameController::class, 'destroy']);
    
    // Manejo de imágenes
    Route::delete('/games/{gameId}/images/{imageId}', [AdminGameController::class, 'deleteImage']);
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



// En routes/web.php o routes/api.php pude ser rutas de prueba
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
});*/