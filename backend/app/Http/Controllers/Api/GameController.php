<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Console;
use App\Models\Category;
use Illuminate\Http\Request;

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
        $query = Game::with(['console', 'categories']);
        
        // Filtros
        if ($request->has('console_id')) {
            $query->where('console_id', $request->console_id);
        }
        
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
        
        return response()->json($games);
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
        $game = Game::with(['console', 'categories', 'images'])
            ->where('slug', $slug)
            ->firstOrFail();
        
        // Juegos relacionados (misma consola y/o categorías)
        $relatedGames = Game::with(['console'])
            ->where('console_id', $game->console_id)
            ->where('id', '!=', $game->id)
            ->take(4)
            ->get();
        
        return response()->json([
            'game' => $game,
            'relatedGames' => $relatedGames
        ]);
    }
}