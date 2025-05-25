<?php
// app/Http/Controllers/Api/Admin/CategoryController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Category::withCount('games');

            // Filtro por búsqueda
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('slug', 'LIKE', "%{$search}%");
                });
            }

            // Ordenar por nombre
            $query->orderBy('name', 'asc');

            // Paginación
            $perPage = $request->get('per_page', 10);
            $categories = $query->paginate($perPage);

            return response()->json($categories);

        } catch (\Exception $e) {
            Log::error('Error al obtener categorías: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener las categorías',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('Datos recibidos para crear categoría:', $request->all());

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:categories,name',
                'slug' => 'required|string|max:100|unique:categories,slug|regex:/^[a-z0-9-]+$/'
            ], [
                'name.required' => 'El nombre es obligatorio',
                'name.unique' => 'Ya existe una categoría con este nombre',
                'slug.required' => 'El slug es obligatorio',
                'slug.unique' => 'Ya existe una categoría con este slug',
                'slug.regex' => 'El slug solo puede contener letras minúsculas, números y guiones'
            ]);

            if ($validator->fails()) {
                Log::warning('Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $category = Category::create($data);
            
            Log::info('Categoría creada exitosamente:', $category->toArray());

            return response()->json([
                'message' => 'Categoría creada exitosamente',
                'data' => $category->loadCount('games')
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear categoría: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Error al crear la categoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category): JsonResponse
    {
        try {
            return response()->json([
                'data' => $category->loadCount('games')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la categoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        try {
            Log::info('Actualizando categoría ID: ' . $category->id, $request->all());

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:categories,name,' . $category->id,
                'slug' => 'required|string|max:100|unique:categories,slug,' . $category->id . '|regex:/^[a-z0-9-]+$/'
            ], [
                'name.required' => 'El nombre es obligatorio',
                'name.unique' => 'Ya existe una categoría con este nombre',
                'slug.required' => 'El slug es obligatorio',
                'slug.unique' => 'Ya existe una categoría con este slug',
                'slug.regex' => 'El slug solo puede contener letras minúsculas, números y guiones'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $category->update($data);

            return response()->json([
                'message' => 'Categoría actualizada exitosamente',
                'data' => $category->fresh()->loadCount('games')
            ]);

        } catch (\Exception $e) {
            Log::error('Error al actualizar categoría: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar la categoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category): JsonResponse
    {
        try {
            // Verificar si la categoría tiene juegos asociados
            $gamesCount = $category->games()->count();
            if ($gamesCount > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar la categoría porque tiene juegos asociados',
                    'games_count' => $gamesCount
                ], 409);
            }

            $category->delete();

            return response()->json([
                'message' => 'Categoría eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al eliminar categoría: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar la categoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all categories for dropdowns (without pagination).
     */
    public function all(): JsonResponse
    {
        try {
            $categories = Category::orderBy('name', 'asc')->get(['id', 'name', 'slug']);
            
            return response()->json([
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las categorías',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}