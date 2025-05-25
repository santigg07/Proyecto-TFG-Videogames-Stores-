<?php
// app/Http/Controllers/Api/Admin/GameController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Console;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class GameController extends Controller
{
    /**
     * Obtener datos para formularios (consolas y categorías)
     */
    public function getFormData()
    {
        try {
            Log::info('Solicitando datos del formulario para admin');
            
            $consoles = Console::orderBy('name')->get(['id', 'name']);
            $categories = Category::orderBy('name')->get(['id', 'name']);
            
            Log::info('Datos encontrados:', [
                'consoles' => $consoles->count(),
                'categories' => $categories->count(),
                'consoles_data' => $consoles->toArray(),
                'categories_data' => $categories->toArray()
            ]);
            
            return response()->json([
                'success' => true,
                'consoles' => $consoles,
                'categories' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getFormData: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'error' => 'Error al cargar datos del formulario',
                'message' => $e->getMessage(),
                'consoles' => [],
                'categories' => []
            ], 500);
        }
    }

    /**
     * Listar todos los juegos para el admin
     */
    public function index(Request $request)
    {
        try {
            $query = Game::with(['console', 'categories']);
            
            // Filtros de búsqueda
            if ($request->has('search')) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%")
                      ->orWhereHas('console', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            }
            
            if ($request->has('console_id')) {
                $query->where('console_id', $request->console_id);
            }
            
            // Ordenación
            $sortBy = $request->sort_by ?? 'created_at';
            $sortOrder = $request->sort_order ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);
            
            // Paginación
            $perPage = $request->per_page ?? 15;
            $games = $query->paginate($perPage);
            
            return response()->json($games);
        } catch (\Exception $e) {
            Log::error('Error en index: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener juegos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo juego
     */
    public function store(Request $request)
    {
        try {
            Log::info('Datos recibidos para crear juego:', $request->all());
            
            $request->validate([
                'name' => 'required|string|max:255',
                'console_id' => 'required|exists:consoles,id',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'sale_price' => 'nullable|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'release_year' => 'nullable|integer|min:1970|max:' . date('Y'),
                'condition' => 'nullable|string|max:50',
                'manufacturer' => 'nullable|string|max:100',
                'includes' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category_ids' => 'nullable|array',
                'category_ids.*' => 'exists:categories,id'
            ]);
            
            $data = $request->all();
            
            // Generar slug si no se proporciona
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($request->name);
            }
            
            // Manejar la imagen
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('games', 'public');
                $data['image'] = $imagePath;
            }
            
            $game = Game::create($data);
            
            // Asociar categorías
            if ($request->has('category_ids')) {
                $game->categories()->sync($request->category_ids);
            }
            
            Log::info('Juego creado exitosamente:', ['game_id' => $game->id]);
            
            return response()->json([
                'message' => 'Juego creado exitosamente',
                'game' => $game->load(['console', 'categories'])
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación:', $e->errors());
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creando juego: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un juego específico
     */
    public function show($id)
    {
        try {
            $game = Game::with(['console', 'categories', 'images'])->findOrFail($id);
            return response()->json($game);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Juego no encontrado',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar un juego
     */
    public function update(Request $request, $id)
    {
        try {
            $game = Game::findOrFail($id);
            
            $request->validate([
                'name' => 'required|string|max:255',
                'console_id' => 'required|exists:consoles,id',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'sale_price' => 'nullable|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'release_year' => 'nullable|integer|min:1970|max:' . date('Y'),
                'condition' => 'nullable|string|max:50',
                'manufacturer' => 'nullable|string|max:100',
                'includes' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category_ids' => 'nullable|array',
                'category_ids.*' => 'exists:categories,id'
            ]);
            
            $data = $request->all();
            
            // Generar slug si cambió el nombre
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($request->name);
            }
            
            // Manejar la imagen
            if ($request->hasFile('image')) {
                // Eliminar imagen anterior si existe
                if ($game->image) {
                    Storage::disk('public')->delete($game->image);
                }
                
                $imagePath = $request->file('image')->store('games', 'public');
                $data['image'] = $imagePath;
            }
            
            $game->update($data);
            
            // Actualizar categorías
            if ($request->has('category_ids')) {
                $game->categories()->sync($request->category_ids);
            }
            
            return response()->json([
                'message' => 'Juego actualizado exitosamente',
                'game' => $game->load(['console', 'categories'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error actualizando juego: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar juego',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un juego
     */
    public function destroy($id)
    {
        try {
            $game = Game::findOrFail($id);
            
            // Eliminar imagen si existe
            if ($game->image) {
                Storage::disk('public')->delete($game->image);
            }
            
            // Eliminar relaciones
            $game->categories()->detach();
            
            $game->delete();
            
            return response()->json([
                'message' => 'Juego eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar juego',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}