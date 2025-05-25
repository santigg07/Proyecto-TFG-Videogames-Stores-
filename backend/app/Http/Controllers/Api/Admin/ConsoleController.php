<?php
// app/Http/Controllers/Api/Admin/ConsoleController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Console;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ConsoleController extends Controller
{
    /**
     * Display a listing of the consoles.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Console::withCount('games');

            // Filtro por búsqueda
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('manufacturer', 'LIKE', "%{$search}%")
                      ->orWhere('slug', 'LIKE', "%{$search}%");
                });
            }

            // Filtro por fabricante
            if ($request->has('manufacturer') && !empty($request->manufacturer)) {
                $query->where('manufacturer', $request->manufacturer);
            }

            // Ordenar por nombre
            $query->orderBy('name', 'asc');

            // Paginación
            $perPage = $request->get('per_page', 10);
            $consoles = $query->paginate($perPage);

            return response()->json($consoles);

        } catch (\Exception $e) {
            Log::error('Error al obtener consolas: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener las consolas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created console in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('Datos recibidos para crear consola:', $request->all());

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:consoles,name',
                'slug' => 'required|string|max:100|unique:consoles,slug|regex:/^[a-z0-9-]+$/',
                'manufacturer' => 'nullable|string|max:100',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ], [
                'name.required' => 'El nombre es obligatorio',
                'name.unique' => 'Ya existe una consola con este nombre',
                'slug.required' => 'El slug es obligatorio',
                'slug.unique' => 'Ya existe una consola con este slug',
                'slug.regex' => 'El slug solo puede contener letras minúsculas, números y guiones',
                'image.image' => 'El archivo debe ser una imagen',
                'image.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif',
                'image.max' => 'La imagen no puede ser mayor a 2MB'
            ]);

            if ($validator->fails()) {
                Log::warning('Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Procesar imagen si se subió
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('consoles', $imageName, 'public');
                $data['image'] = $imagePath;
                Log::info('Imagen guardada en: ' . $imagePath);
            }

            $console = Console::create($data);
            Log::info('Consola creada exitosamente:', $console->toArray());

            return response()->json([
                'message' => 'Consola creada exitosamente',
                'data' => $console->loadCount('games')
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear consola: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Error al crear la consola',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified console.
     */
    public function show(Console $console): JsonResponse
    {
        try {
            return response()->json([
                'data' => $console->loadCount('games')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la consola',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified console in storage.
     */
    public function update(Request $request, Console $console): JsonResponse
    {
        try {
            Log::info('Actualizando consola ID: ' . $console->id, $request->all());

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:consoles,name,' . $console->id,
                'slug' => 'required|string|max:100|unique:consoles,slug,' . $console->id . '|regex:/^[a-z0-9-]+$/',
                'manufacturer' => 'nullable|string|max:100',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ], [
                'name.required' => 'El nombre es obligatorio',
                'name.unique' => 'Ya existe una consola con este nombre',
                'slug.required' => 'El slug es obligatorio',
                'slug.unique' => 'Ya existe una consola con este slug',
                'slug.regex' => 'El slug solo puede contener letras minúsculas, números y guiones',
                'image.image' => 'El archivo debe ser una imagen',
                'image.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif',
                'image.max' => 'La imagen no puede ser mayor a 2MB'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Procesar nueva imagen si se subió
            if ($request->hasFile('image')) {
                // Eliminar imagen anterior si existe
                if ($console->image && Storage::disk('public')->exists($console->image)) {
                    Storage::disk('public')->delete($console->image);
                }

                $image = $request->file('image');
                $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('consoles', $imageName, 'public');
                $data['image'] = $imagePath;
            }

            $console->update($data);

            return response()->json([
                'message' => 'Consola actualizada exitosamente',
                'data' => $console->fresh()->loadCount('games')
            ]);

        } catch (\Exception $e) {
            Log::error('Error al actualizar consola: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar la consola',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified console from storage.
     */
    public function destroy(Console $console): JsonResponse
    {
        try {
            // Verificar si la consola tiene juegos asociados
            $gamesCount = $console->games()->count();
            if ($gamesCount > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar la consola porque tiene juegos asociados',
                    'games_count' => $gamesCount
                ], 409);
            }

            // Eliminar imagen si existe
            if ($console->image && Storage::disk('public')->exists($console->image)) {
                Storage::disk('public')->delete($console->image);
            }

            $console->delete();

            return response()->json([
                'message' => 'Consola eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al eliminar consola: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar la consola',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all consoles for dropdowns (without pagination).
     */
    public function all(): JsonResponse
    {
        try {
            $consoles = Console::orderBy('name', 'asc')->get(['id', 'name', 'manufacturer']);
            
            return response()->json([
                'data' => $consoles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las consolas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}