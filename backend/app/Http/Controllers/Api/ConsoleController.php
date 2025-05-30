<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Console;
use Illuminate\Http\Request;

class ConsoleController extends Controller {

    /**
    * Obtener todas las consolas.
    *
    * @return \Illuminate\Http\Response
    */

    public function index() {
        $consoles = Console::all();
        return response()->json($consoles);
    }

    /**
    * Obtener una consola específica por su slug.
    *
    * @param  string  $slug
    * @return \Illuminate\Http\Response
    */

    public function show($slug) {
        $console = Console::where('slug', $slug)->firstOrFail();
        return response()->json($console);
    }
}