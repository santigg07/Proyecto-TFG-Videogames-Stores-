<?php
// app/Http/Controllers/Api/UserController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Obtener información del usuario autenticado
     */
    public function show()
    {
        $user = Auth::user();
        return response()->json($user);
    }

    /**
     * Obtener perfil completo del usuario
     */
    public function profile()
    {
        $user = Auth::user();
        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'city' => $user->city,
            'postal_code' => $user->postal_code,
            'country' => $user->country,
            'birth_date' => $user->birth_date,
        ]);
    }

    /**
     * Actualizar perfil del usuario
     */
    public function updateProfile(Request $request)
    {
        $user = User::find(Auth::id());
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'country' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
        ]);

        foreach ($validated as $key => $value) {
            $user->$key = $value;
        }
        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ]);
    }

    /**
     * Obtener estadísticas del usuario
     */
    public function stats()
    {
        $user = Auth::user();
        
        try {
            $totalOrders = Order::where('user_id', $user->id)->count();
            $totalSpent = Order::where('user_id', $user->id)
                ->where('status', 'completed')
                ->sum('total');
            $wishlistCount = WishlistItem::where('user_id', $user->id)->count();

            return response()->json([
                'total_orders' => $totalOrders,
                'total_spent' => number_format((float)$totalSpent, 2, '.', ''), // ARREGLAR formato
                'wishlist_count' => $wishlistCount,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en stats: ' . $e->getMessage());
            
            return response()->json([
                'total_orders' => 0,
                'total_spent' => '0.00',
                'wishlist_count' => 0,
            ]);
        }
    }

    /**
     * Obtener actividad reciente del usuario
     */
    public function recentActivity()
    {
        $user = Auth::user();
        
        try {
            // Combinar diferentes tipos de actividad
            $activities = collect();

            // Pedidos recientes - AÑADIR verificación de existencia
            $recentOrders = Order::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($order) {
                    return [
                        'type' => 'order',
                        'description' => "Pedido #{$order->id} - {$order->status}",
                        'created_at' => $order->created_at,
                    ];
                });

            // Items añadidos a wishlist recientemente - AÑADIR verificación
            $recentWishlist = WishlistItem::with('game')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->take(3)
                ->get()
                ->map(function ($item) {
                    // VERIFICAR que game existe
                    if (!$item->game) {
                        return null;
                    }
                    
                    return [
                        'type' => 'wishlist',
                        'description' => "Añadiste {$item->game->name} a tu lista de deseos",
                        'created_at' => $item->created_at,
                    ];
                })
                ->filter(); // Eliminar elementos null

            $activities = $activities->merge($recentOrders)->merge($recentWishlist);
            
            return response()->json($activities->sortByDesc('created_at')->take(10)->values());
            
        } catch (\Exception $e) {
            // AÑADIR logging del error
            Log::error('Error en recentActivity: ' . $e->getMessage());
            
            // Devolver respuesta vacía en caso de error
            return response()->json([]);
        }
    }

    /**
     * Obtener pedidos del usuario
     */
    public function orders(Request $request)
    {
        $user = Auth::user();
        
        $query = Order::with(['orderItems.game.console'])
            ->where('user_id', $user->id);

        // Filtrar por estado si se proporciona
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Ordenar
        $sortOrder = $request->get('sort', 'desc');
        $query->orderBy('created_at', $sortOrder);

        $orders = $query->paginate(10);
        
        // Añadir contador de items a cada pedido
        $orders->getCollection()->transform(function ($order) {
            $order->items_count = $order->orderItems->sum('quantity');
            return $order;
        });

        return response()->json($orders);
    }

    /**
     * Obtener lista de deseos del usuario
     */
    public function wishlist()
    {
        $user = Auth::user();
        
        $wishlistItems = WishlistItem::with(['game.console'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json($wishlistItems);
    }

    /**
     * Añadir juego a la lista de deseos
     */
    public function addToWishlist(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id'
        ]);

        $wishlistItem = WishlistItem::firstOrCreate([
            'user_id' => $user->id,
            'game_id' => $validated['game_id']
        ]);

        return response()->json([
            'message' => 'Juego añadido a la lista de deseos',
            'item' => $wishlistItem->load('game')
        ]);
    }

    /**
     * Eliminar juego de la lista de deseos
     */
    public function removeFromWishlist($gameId)
    {
        $user = Auth::user();
        
        $deleted = WishlistItem::where('user_id', $user->id)
            ->where('game_id', $gameId)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Juego eliminado de la lista de deseos']);
        }

        return response()->json(['message' => 'Juego no encontrado en la lista de deseos'], 404);
    }

    /**
     * Limpiar lista de deseos
     */
    public function clearWishlist()
    {
        $user = Auth::user();
        
        WishlistItem::where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Lista de deseos limpiada']);
    }

    /**
     * Cambiar contraseña
     */
    public function changePassword(Request $request)
    {
        $user = User::find(Auth::id());
        
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual es incorrecta'
            ], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada correctamente']);
    }

    /**
     * Obtener configuraciones del usuario
     */
    public function getSettings()
    {
        $user = Auth::user();
        
        return response()->json([
            'notifications-offers' => $user->notifications_offers ?? true,
            'notifications-products' => $user->notifications_products ?? false,
            'notifications-orders' => $user->notifications_orders ?? true,
            'notifications-newsletter' => $user->notifications_newsletter ?? false,
            'privacy-public-profile' => $user->privacy_public_profile ?? false,
            'privacy-wishlist' => $user->privacy_wishlist ?? false,
            'privacy-purchase-history' => $user->privacy_purchase_history ?? false,
        ]);
    }

    /**
     * Actualizar configuraciones del usuario
     */
    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        
        $settings = $request->all();
        
        // Validar que solo se actualicen configuraciones permitidas
        $allowedSettings = [
            'notifications-offers', 'notifications-products', 'notifications-orders', 'notifications-newsletter',
            'privacy-public-profile', 'privacy-wishlist', 'privacy-purchase-history'
        ];
        
        $filteredSettings = array_intersect_key($settings, array_flip($allowedSettings));
        
        // Convertir nombres de configuración a nombres de columna
        $columnMapping = [
            'notifications-offers' => 'notifications_offers',
            'notifications-products' => 'notifications_products',
            'notifications-orders' => 'notifications_orders',
            'notifications-newsletter' => 'notifications_newsletter',
            'privacy-public-profile' => 'privacy_public_profile',
            'privacy-wishlist' => 'privacy_wishlist',
            'privacy-purchase-history' => 'privacy_purchase_history',
        ];
        
        $updateData = [];
        foreach ($filteredSettings as $key => $value) {
            if (isset($columnMapping[$key])) {
                $updateData[$columnMapping[$key]] = (bool) $value;
            }
        }
        
        foreach ($updateData as $column => $value) {
            $user->$column = $value;
        }
        // Ensure $user is an Eloquent model before saving
        if ($user instanceof User) {  
            $user->save();
        }

        return response()->json(['message' => 'Configuraciones actualizadas']);
    }

    /**
     * Exportar datos del usuario
     */
    public function exportData()
    {
        $user = Auth::user();
        
        $profileFields = ['name', 'email', 'phone', 'address', 'city', 'postal_code', 'country', 'birth_date'];
        $userArray = is_array($user) ? $user : (array) $user;
        $data = [
            'profile' => array_intersect_key($userArray, array_flip($profileFields)),
            'orders' => Order::with('orderItems.game')->where('user_id', $user->id)->get(),
            'wishlist' => WishlistItem::with('game')->where('user_id', $user->id)->get(),
            'exported_at' => now()->toISOString(),
        ];

        return response()->json($data)
            ->header('Content-Disposition', 'attachment; filename="user-data.json"')
            ->header('Content-Type', 'application/json');
    }

    /**
     * Eliminar cuenta del usuario
     */
    public function deleteAccount()
    {
        $user = User::find(Auth::id());
        
        DB::transaction(function () use ($user) {
            // Eliminar datos relacionados
            WishlistItem::where('user_id', $user->id)->delete();
            Order::where('user_id', $user->id)->delete();
            
            // Eliminar usuario
            $user->delete();
        });

        return response()->json(['message' => 'Cuenta eliminada correctamente']);
    }

    /**
     * Eliminar todos los datos del usuario (excepto la cuenta)
     */
    public function deleteUserData()
    {
        $user = User::find(Auth::id());
        
        DB::transaction(function () use ($user) {
            // Eliminar lista de deseos
            WishlistItem::where('user_id', $user->id)->delete();
            
            // Marcar pedidos como anónimos (opcional)
            Order::where('user_id', $user->id)->update(['user_id' => null]);
            
            // Limpiar datos personales
            $user->phone = null;
            $user->address = null;
            $user->city = null;
            $user->postal_code = null;
            $user->country = null;
            $user->birth_date = null;
            $user->save();
        });

        return response()->json(['message' => 'Datos personales eliminados correctamente']);
    }
}