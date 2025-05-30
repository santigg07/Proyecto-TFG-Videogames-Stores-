// src/components/profile/WishlistGrid.jsx
import React, { useState, useEffect } from 'react';

export default function WishlistGrid() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadWishlist = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    throw new Error('No estás autenticado');
                }

                const response = await fetch('http://localhost:8000/api/wishlist', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Wishlist data received:', data);

                if (data.success) {
                    // Validar y limpiar datos antes de setear
                    const validItems = (data.data || []).filter(item => {
                        // Verificar que el item y game existen
                        if (!item || !item.game) {
                            console.warn('Item sin game encontrado:', item);
                            return false;
                        }
                        
                        // Verificar propiedades mínimas requeridas
                        if (!item.game.id || !item.game.name) {
                            console.warn('Game sin propiedades básicas:', item.game);
                            return false;
                        }
                        
                        return true;
                    });
                    
                    console.log(`Items válidos: ${validItems.length} de ${data.data?.length || 0}`);
                    setWishlistItems(validItems);
                } else {
                    throw new Error(data.message || 'Error al cargar la lista de deseos');
                }

            } catch (error) {
                console.error('Error al cargar wishlist:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        // Cargar datos iniciales
        loadWishlist();

        // Event listeners para los botones de la página
        const handleWishlistCleared = () => {
            setWishlistItems([]);
        };

        const handleAddAllToCart = () => {
            if (wishlistItems.length === 0) {
                return; // El modal ya maneja este caso
            }

            try {
                // Añadir todos los items al carrito con validación
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                let addedCount = 0;
                
                wishlistItems.forEach(item => {
                    if (!item.game || !item.game.id) return;
                    
                    const existingItem = cart.find(cartItem => cartItem.id === item.game.id.toString());

                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        cart.push({
                            id: item.game.id.toString(),
                            name: item.game.name || 'Juego sin nombre',
                            price: item.game.sale_price || item.game.price || 0,
                            quantity: 1,
                            image: item.game.image || ''
                        });
                    }
                    addedCount++;
                });
                
                localStorage.setItem('cart', JSON.stringify(cart));
                document.dispatchEvent(new CustomEvent('cartUpdated'));
                
                console.log(`Se añadieron ${addedCount} juegos al carrito`);
            } catch (error) {
                console.error('Error añadiendo todo al carrito:', error);
                
                // Mostrar toast de error
                document.dispatchEvent(new CustomEvent('show-toast', {
                    detail: {
                        title: 'Error al añadir',
                        message: 'No se pudieron añadir los juegos al carrito. Inténtalo de nuevo.',
                        type: 'error',
                        duration: 5000
                    }
                }));
            }
        };

        document.addEventListener('wishlistCleared', handleWishlistCleared);
        document.addEventListener('addAllToCart', handleAddAllToCart);

        return () => {
            document.removeEventListener('wishlistCleared', handleWishlistCleared);
            document.removeEventListener('addAllToCart', handleAddAllToCart);
        };
    }, []); // Solo se ejecuta una vez al montar

    const removeFromWishlist = async (gameId) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:8000/api/wishlist/${gameId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Obtener el nombre del juego antes de eliminarlo
                const removedGame = wishlistItems.find(item => item.game?.id === parseInt(gameId));
                const gameName = removedGame?.game?.name || 'Juego';
                
                setWishlistItems(prev => prev.filter(item => item.game?.id !== parseInt(gameId)));
                
                // Mostrar toast de éxito
                document.dispatchEvent(new CustomEvent('show-toast', {
                    detail: {
                        title: 'Juego eliminado',
                        message: `${gameName} ha sido eliminado de tu lista de deseos.`,
                        type: 'success',
                        duration: 3000
                    }
                }));
            } else {
                throw new Error('Error al eliminar el juego');
            }
        } catch (error) {
            console.error('Error:', error);
            
            // Mostrar toast de error
            document.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                    title: 'Error al eliminar',
                    message: 'No se pudo eliminar el juego de la lista de deseos.',
                    type: 'error',
                    duration: 4000
                }
            }));
        }
    };

    const addToCart = (game) => {
        try {
            if (!game || !game.id) {
                console.error('Game inválido para añadir al carrito');
                return;
            }
            
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(item => item.id === game.id.toString());

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: game.id.toString(),
                    name: game.name || 'Juego sin nombre',
                    price: game.sale_price || game.price || 0,
                    quantity: 1,
                    image: game.image || ''
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            document.dispatchEvent(new CustomEvent('cartUpdated'));
            
            // Mostrar toast de éxito
            document.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                    title: 'Añadido al carrito',
                    message: `${game.name} ha sido añadido al carrito.`,
                    type: 'success',
                    duration: 2500
                }
            }));
        } catch (error) {
            console.error('Error añadiendo al carrito:', error);
            
            // Mostrar toast de error
            document.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                    title: 'Error al añadir',
                    message: 'No se pudo añadir el juego al carrito.',
                    type: 'error',
                    duration: 3000
                }
            }));
        }
    };

    const formatPrice = (price) => {
        try {
            const numPrice = parseFloat(price);
            return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
        } catch (error) {
            return '0.00';
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('es-ES');
        } catch (error) {
            return 'Fecha no disponible';
        }
    };

    // Estados de carga y error
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-white text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
                    <p>Cargando lista de deseos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-4">
                <h3 className="font-bold mb-2">Error al cargar la lista de deseos</h3>
                <p className="mb-4">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition-colors"
                >
                    Recargar página
                </button>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 mb-6">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    <h3 className="text-xl font-bold text-white mb-2">Tu lista de deseos está vacía</h3>
                    <p className="text-gray-500 mb-6">Explora nuestro catálogo y añade tus juegos favoritos</p>
                    <a 
                        href="/catalog" 
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg inline-block transition-colors"
                    >
                        Explorar Catálogo
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-gray-400 mb-4">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'juego' : 'juegos'} en tu lista de deseos
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item, index) => {
                    // Validación extra por si acaso
                    if (!item || !item.game) {
                        console.warn(`Item ${index} inválido:`, item);
                        return null;
                    }
                    
                    const game = item.game;
                    const imageUrl = game.image ? `http://localhost:8000/storage/${game.image}` : '/assets/images/placeholder.png';
                    const gameUrl = `/games/${game.console?.slug || 'unknown'}/${game.slug || game.id}`;
                    
                    return (
                        <div key={`wishlist-${item.id || index}`} className="bg-gray-700 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform">
                            <a href={gameUrl} className="block">
                                <div className="aspect-square bg-gray-900 flex items-center justify-center">
                                    <img 
                                        src={imageUrl}
                                        alt={game.name || 'Juego'}
                                        className="max-w-full max-h-full object-contain p-4"
                                        loading="lazy"
                                        
                                    />
                                </div>
                            </a>
                            
                            <div className="p-4">
                                <h3 className="font-bold text-white mb-2 truncate">
                                    {game.name || 'Juego sin nombre'}
                                </h3>
                                <p className="text-gray-400 text-sm mb-2">
                                    {game.console?.name || 'Console desconocida'}
                                </p>
                                
                                <div className="flex justify-between items-center mb-3">
                                    {game.sale_price ? (
                                        <div>
                                            <span className="font-bold text-white">
                                                {formatPrice(game.sale_price)} €
                                            </span>
                                            <span className="text-gray-400 line-through text-sm ml-2">
                                                {formatPrice(game.price)} €
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="font-bold text-white">
                                            {formatPrice(game.price)} €
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => addToCart(game)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
                                    >
                                        <i className="fas fa-shopping-cart mr-1"></i>
                                        Añadir al Carrito
                                    </button>
                                    <button 
                                        onClick={() => {
                                            // MODAL DE CONFIRMACIÓN EN LUGAR DE ALERT
                                            document.dispatchEvent(new CustomEvent('show-modal', {
                                                detail: {
                                                    title: 'Eliminar de la lista',
                                                    message: `¿Estás seguro de que quieres eliminar "${game.name}" de tu lista de deseos?`,
                                                    confirmText: 'Eliminar',
                                                    cancelText: 'Cancelar',
                                                    type: 'danger',
                                                    onConfirm: () => {
                                                        removeFromWishlist(game.id);
                                                    }
                                                }
                                            }));
                                        }}
                                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition-colors"
                                        title="Eliminar de la lista de deseos"
                                    >
                                        <i className="fas fa-heart-broken"></i>
                                    </button>
                                </div>
                                
                                <div className="text-xs text-gray-500 mt-2">
                                    Añadido: {formatDate(item.created_at)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}