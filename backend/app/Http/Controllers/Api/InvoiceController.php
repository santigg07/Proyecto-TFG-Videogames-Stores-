<?php
// backend/app/Http/Controllers/Api/InvoiceController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Descargar factura en PDF
     */
    public function download($orderId)
    {
        $user = Auth::user();
        
        // Buscar la orden
        $order = Order::with(['user', 'items.game.console'])
            ->where('id', $orderId)
            ->where(function($query) use ($user) {
                // El usuario puede ver su propia factura o si es admin puede ver todas
                if ($user->role_id === 1) {
                    return;
                }
                $query->where('user_id', $user->id);
            })
            ->first();
            
        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado'], 404);
        }
        
        // Generar el PDF
        $pdf = PDF::loadView('pdf.invoice', compact('order')); //El error es solo un aviso del autocompletado de VS Code (Intelephense), no de PHP ni de Laravel.funciona bien otran que salte el error
        
        // Configurar el PDF
        $pdf->setPaper('A4', 'portrait');
        
        // Nombre del archivo
        $fileName = 'factura_' . str_pad($order->id, 6, '0', STR_PAD_LEFT) . '.pdf';
        
        // Devolver el PDF para descarga
        return $pdf->download($fileName);
    }
    
    /**
     * Ver factura en el navegador
     */
    public function view($orderId)
    {
        $user = Auth::user();
        
        // Buscar la orden
        $order = Order::with(['user', 'items.game.console'])
            ->where('id', $orderId)
            ->where(function($query) use ($user) {
                if ($user->role_id === 1) {
                    return;
                }
                $query->where('user_id', $user->id);
            })
            ->first();
            
        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado'], 404);
        }
        
        // Generar el PDF
        $pdf = PDF::loadView('pdf.invoice', compact('order'));
        
        // Configurar el PDF
        $pdf->setPaper('A4', 'portrait');
        
        // Mostrar en el navegador
        return $pdf->stream('factura_' . str_pad($order->id, 6, '0', STR_PAD_LEFT) . '.pdf');
    }
}