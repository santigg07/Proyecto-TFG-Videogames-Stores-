<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAuthenticated
{
    
    /* Handle an incoming request.
    */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar si el usuario está autenticado
        if (!auth('sanctum')->check()) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado. Debes iniciar sesión para acceder a esta funcionalidad.',
                'code' => 'UNAUTHENTICATED'
            ], 401);
        }
        
        // Verificar si el token es válido
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Token de autenticación inválido o expirado.',
                'code' => 'INVALID_TOKEN'
            ], 401);
        }
        
        return $next($request);
    }
}
