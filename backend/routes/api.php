<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\ConsoleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
// Rutas de API

// Rutas de autenticación (públicas)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

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
    
    // Lista de deseos
    Route::get('/user/wishlist', [UserController::class, 'wishlist']);
    Route::post('/user/wishlist', [UserController::class, 'addToWishlist']);
    Route::delete('/user/wishlist/{gameId}', [UserController::class, 'removeFromWishlist']);
    Route::delete('/user/wishlist/clear', [UserController::class, 'clearWishlist']);
    
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
});