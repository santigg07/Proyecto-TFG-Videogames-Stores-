<?php
// app/Http/Controllers/Api/Admin/UserController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::with('role');

            // Filtro por búsqueda (nombre o email)
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            // Filtro por rol
            if ($request->has('role') && !empty($request->role)) {
                $query->whereHas('role', function($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }

            // Filtro por verificación de email
            if ($request->has('verified') && !empty($request->verified)) {
                if ($request->verified === 'verified') {
                    $query->whereNotNull('email_verified_at');
                } elseif ($request->verified === 'unverified') {
                    $query->whereNull('email_verified_at');
                }
            }

            // Ordenar por nombre
            $query->orderBy('name', 'asc');

            // Paginación
            $perPage = $request->get('per_page', 10);
            $users = $query->paginate($perPage);

            return response()->json($users);

        } catch (\Exception $e) {
            Log::error('Error al obtener usuarios: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener los usuarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('Datos recibidos para crear usuario:', $request->except('password', 'password_confirmation'));

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'role_id' => 'required|exists:roles,id',
                'email_verified_at' => 'boolean'
            ], [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'Ya existe un usuario con este email',
                'password.required' => 'La contraseña es obligatoria',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres',
                'password.confirmed' => 'Las contraseñas no coinciden',
                'role_id.required' => 'Debe seleccionar un rol',
                'role_id.exists' => 'El rol seleccionado no es válido'
            ]);

            if ($validator->fails()) {
                Log::warning('Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['password'] = Hash::make($data['password']);
            
            // Manejar verificación de email
            if (isset($data['email_verified_at']) && $data['email_verified_at']) {
                $data['email_verified_at'] = now();
            } else {
                $data['email_verified_at'] = null;
            }

            $user = User::create($data);
            Log::info('Usuario creado exitosamente:', $user->toArray());

            return response()->json([
                'message' => 'Usuario creado exitosamente',
                'data' => $user->load('role')
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear usuario: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Error al crear el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        try {
            return response()->json([
                'data' => $user->load('role')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        try {
            Log::info('Actualizando usuario ID: ' . $user->id, $request->except('password', 'password_confirmation'));

            // Validaciones base
            $rules = [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
                'role_id' => 'required|exists:roles,id',
                'email_verified_at' => 'boolean'
            ];

            // Solo validar contraseña si se proporciona
            if ($request->filled('password')) {
                $rules['password'] = 'required|string|min:8|confirmed';
            }

            $validator = Validator::make($request->all(), $rules, [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'Ya existe un usuario con este email',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres',
                'password.confirmed' => 'Las contraseñas no coinciden',
                'role_id.required' => 'Debe seleccionar un rol',
                'role_id.exists' => 'El rol seleccionado no es válido'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Manejar contraseña
            if ($request->filled('password')) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            // Manejar verificación de email
            if (isset($data['email_verified_at'])) {
                $data['email_verified_at'] = $data['email_verified_at'] ? now() : null;
            }

            $user->update($data);

            return response()->json([
                'message' => 'Usuario actualizado exitosamente',
                'data' => $user->fresh()->load('role')
            ]);

        } catch (\Exception $e) {
            Log::error('Error al actualizar usuario: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        try {
            // Verificar que no sea el usuario actual
            if ($user->id === request()->user()->id) {
                return response()->json([
                    'message' => 'No puedes eliminar tu propia cuenta'
                ], 409);
            }

            $user->delete();

            return response()->json([
                'message' => 'Usuario eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all roles for dropdowns.
     */
    public function getRoles(): JsonResponse
    {
        try {
            $roles = Role::orderBy('name', 'asc')->get(['id', 'name']);
            
            return response()->json([
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}