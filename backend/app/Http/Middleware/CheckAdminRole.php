<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckAdminRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        
        if ($user->role_id !== 1) { // 1 es el ID del rol admin
            return response()->json(['error' => 'Acceso denegado. Se requieren privilegios de administrador'], 403);
        }
        
        return $next($request);
    }
}