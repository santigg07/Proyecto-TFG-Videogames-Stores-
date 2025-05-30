<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CheckAdminRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        if (!$user) {
            // Solo log para intentos de acceso sin autenticación
            Log::warning('Acceso admin sin autenticación desde IP: ' . $request->ip());
            
            return response()->json([
                'error' => 'No autenticado',
                'message' => 'Debes iniciar sesión para acceder a esta sección.'
            ], 401);
        }

        if ($user->role_id !== 1) {
            // Solo log para intentos de acceso sin permisos
            Log::warning('Acceso admin denegado', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);
            
            return response()->json([
                'error' => 'Acceso denegado',
                'message' => 'Se requieren privilegios de administrador.'
            ], 403);
        }

        // SIN LOG para accesos exitosos - se ejecuta en cada petición admin
        return $next($request);
    }
}