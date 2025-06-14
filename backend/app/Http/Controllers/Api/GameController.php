<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Console;
use App\Models\GameImage;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB; // También añade esta para usar DB::table

class GameController extends Controller
{
    /**
     * Obtener todos los juegos con paginación.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            Log::info('Request parameters:', $request->all());
            
            $query = Game::with(['console', 'categories']);
            Log::info('Initial query count:', ['count' => $query->count()]);
            
            // Filtros
            // Por consola
            if ($request->has('console_id') && $request->console_id) {
                $query->where('console_id', $request->console_id);
                Log::info('After console filter:', ['count' => $query->count()]);
            }
            
            // Por categoría
            if ($request->has('category_id') && $request->category_id) {
                $query->whereHas('categories', function($q) use ($request) {
                    $q->where('categories.id', $request->category_id);
                });
                Log::info('After category filter:', ['count' => $query->count()]);
            }
            
            // Por rango de precios
            if ($request->has('min_price') && is_numeric($request->min_price)) {
                $query->where('price', '>=', $request->min_price);
                Log::info('After min_price filter:', ['count' => $query->count()]);
            }
            
            if ($request->has('max_price') && is_numeric($request->max_price)) {
                $query->where('price', '<=', $request->max_price);
                Log::info('After max_price filter:', ['count' => $query->count()]);
            }
            
            // Por condición (nuevo, usado, etc.)
            if ($request->has('condition') && $request->condition) {
                $query->where('condition', $request->condition);
                Log::info('After condition filter:', ['count' => $query->count()]);
            }
            
            // Por stock
            if ($request->has('in_stock') && $request->in_stock == 1) {
                $query->where('stock', '>', 0);
                Log::info('After in_stock filter:', ['count' => $query->count()]);
            }
            
            // Por año de lanzamiento
            if ($request->has('release_year') && $request->release_year) {
                $query->where('release_year', $request->release_year);
                Log::info('After release_year filter:', ['count' => $query->count()]);
            }
            
            // Por búsqueda
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('console', function($console) use ($search) {
                          $console->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('categories', function($category) use ($search) {
                          $category->where('name', 'like', "%{$search}%");
                      });
                });
                Log::info('After search filter:', ['count' => $query->count()]);
            }
            
            // Ordenación
            $sortBy = $request->sort_by ?? 'created_at';
            $sortOrder = $request->sort_order ?? 'desc';
            
            // Validar campos de ordenación permitidos
            $allowedSortFields = ['name', 'price', 'created_at', 'release_year'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            Log::info('Final query count:', ['count' => $query->count()]);
            
            // Paginación
            $perPage = $request->per_page ?? 12;
            $games = $query->paginate($perPage);
            
            Log::info('Paginated results:', ['count' => $games->count(), 'total' => $games->total()]);
            
            return response()->json($games);
        } catch (\Exception $e) {
            Log::error('Error in games query:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtener datos para los filtros.
     *
     * @return \Illuminate\Http\Response
     */
    public function getFilterData()
    {
        // Obtener rango de precios min/max
        $minPrice = Game::min('price');
        $maxPrice = Game::max('price');
        
        // Obtener todas las condiciones distintas
        $conditions = Game::distinct()
            ->whereNotNull('condition')
            ->pluck('condition')
            ->toArray();
        
        // Obtener todos los años de lanzamiento distintos
        $releaseYears = Game::distinct()
            ->whereNotNull('release_year')
            ->pluck('release_year')
            ->toArray();
        
        return response()->json([
            'priceRange' => [
                'min' => (float)$minPrice,
                'max' => (float)$maxPrice
            ],
            'conditions' => $conditions,
            'releaseYears' => $releaseYears
        ]);
    }

    /**
     * Búsqueda de juegos para autocompletado.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function search(Request $request)
    {
        // Verificar que existe el parámetro q
        if (!$request->has('q') || strlen($request->q) < 2) {
            return response()->json([]);
        }
        
        try {
            $query = $request->q;
            
            // Buscar juegos que coincidan con el término
            $games = Game::with('console')
                ->where('name', 'like', "%{$query}%")
                ->orWhereHas('console', function($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%");
                })
                ->orWhereHas('categories', function($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%");
                })
                ->take(10)
                ->get();
            
            return response()->json($games);
        } catch (\Exception $e) {
            Log::error('Error searching games', ['error' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }

    /**
     * Obtener los juegos por consola.
     *
     * @param  string  $consoleSlug
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getByConsole($consoleSlug, Request $request)
    {
        $console = Console::where('slug', $consoleSlug)->firstOrFail();
        
        $query = Game::with(['categories', 'console'])
            ->where('console_id', $console->id);
        
        // Filtros adicionales
        if ($request->has('category_id')) {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }
        
        // Ordenación
        $orderBy = $request->order_by ?? 'created_at';
        $orderDir = $request->order_dir ?? 'desc';
        $query->orderBy($orderBy, $orderDir);
        
        // Paginación
        $perPage = $request->per_page ?? 12;
        $games = $query->paginate($perPage);
        
        return response()->json([
            'console' => $console,
            'games' => $games
        ]);
    }

    /**
     * Obtener un juego específico por su slug.
     *
     * @param  string  $slug
     * @return \Illuminate\Http\Response
     */
    public function show($slug)
    {
        try {
            $game = Game::with(['console', 'categories', 'images'])
                ->where('slug', $slug)
                ->firstOrFail();
            
            // Debug: Ver qué imágenes se están cargando
            Log::info('Juego cargado:', [
                'id' => $game->id,
                'name' => $game->name,
                'image_principal' => $game->image,
                'imagenes_adicionales' => $game->images->count(),
                'imagenes_data' => $game->images->toArray()
            ]);
            
            // Juegos relacionados (misma consola y/o categorías)
            $relatedGames = Game::with(['console'])
                ->where('console_id', $game->console_id)
                ->where('id', '!=', $game->id)
                ->where('stock', '>', 0)
                ->inRandomOrder()
                ->limit(6)
                ->get();
            
            // Preparar todas las imágenes
            $allImages = [];
            
            // Agregar imagen principal primero
            if ($game->image) {
                $allImages[] = $game->image;
            }
            
            // Agregar imágenes adicionales
            foreach ($game->images as $img) {
                $allImages[] = $img->image_path;
            }
            
            Log::info('Todas las imágenes preparadas:', $allImages);
            
            return response()->json([
                'game' => [
                    'id' => $game->id,
                    'name' => $game->name,
                    'slug' => $game->slug,
                    'description' => $game->description,
                    'price' => $game->price,
                    'sale_price' => $game->sale_price,
                    'stock' => $game->stock,
                    'image' => $game->image,
                    'images' => $allImages, // Array con todas las imágenes
                    'release_year' => $game->release_year,
                    'condition' => $game->condition,
                    'manufacturer' => $game->manufacturer,
                    'includes' => $game->includes,
                    'console' => [
                        'id' => $game->console->id,
                        'name' => $game->console->name,
                        'slug' => $game->console->slug,
                    ],
                    'categories' => $game->categories->map(function($cat) {
                        return [
                            'id' => $cat->id,
                            'name' => $cat->name,
                            'slug' => $cat->slug
                        ];
                    }),
                    'created_at' => $game->created_at,
                    'updated_at' => $game->updated_at,
                ],
                'relatedGames' => $relatedGames->map(function ($game) {
                    return [
                        'id' => $game->id,
                        'name' => $game->name,
                        'slug' => $game->slug,
                        'price' => $game->price,
                        'sale_price' => $game->sale_price,
                        'image' => $game->image,
                        'console' => [
                            'name' => $game->console->name,
                            'slug' => $game->console->slug,
                        ]
                    ];
                })
            ]);
        } catch (\Exception $e) {
            Log::error('Error en show:', [
                'slug' => $slug,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'error' => 'Juego no encontrado',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Obtener los juegos más recientes
     */
    public function latest(Request $request)
    {
        $limit = $request->get('limit', 6);
        
        $games = Game::with(['console'])
            ->where('stock', '>', 0) // Solo juegos con stock
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
        
        // Transformar los datos para el frontend
        $games->transform(function ($game) {
            return [
                'id' => $game->id,
                'name' => $game->name,
                'slug' => $game->slug,
                'price' => $game->price,
                'sale_price' => $game->sale_price,
                'image' => $game->image,
                'stock' => $game->stock,
                'console' => [
                    'id' => $game->console->id,
                    'name' => $game->console->name,
                    'slug' => $game->console->slug
                ],
                'created_at' => $game->created_at->toISOString()
            ];
        });
        
        return response()->json([
            'success' => true,
            'games' => $games
        ]);
    }
}