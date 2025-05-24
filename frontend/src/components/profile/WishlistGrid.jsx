// src/components/profile/WishlistGrid.jsx
import React, { useState, useEffect } from 'react';

export default function WishlistGrid() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar lista de deseos - SIN useCallback
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
            console.log('Datos de wishlist recibidos:', data);

            if (data.success) {
                setWishlistItems(data.data || []);
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

    // Eliminar item de la wishlist
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
                setWishlistItems(prev => prev.filter(item => item.game.id !== parseInt(gameId)));
                console.log('Juego eliminado de la lista de deseos');
            } else {
                throw new Error('Error al eliminar el juego');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el juego de la lista de deseos');
        }
    };

    // Añadir al carrito
    const addToCart = (game) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === game.id.toString());

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: game.id.toString(),
                name: game.name,
                price: game.sale_price || game.price,
                quantity: 1,
                image: game.image
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        document.dispatchEvent(new CustomEvent('cartUpdated'));
        console.log(`${game.name} añadido al carrito`);
    };

    // SOLO UN useEffect - sin dependencias
    useEffect(() => {
        console.log('🔄 WishlistGrid montado - cargando datos...');
        
        // Cargar datos una sola vez
        loadWishlist();

        // Event listeners sin referencias a funciones internas
        const handleWishlistCleared = () => {
            console.log('🗑️ Limpiando wishlist...');
            setWishlistItems([]);
        };

        const handleAddAllToCart = () => {
            console.log('🛒 Añadiendo todo al carrito...');
            // Obtener items del DOM o del estado actual
            const currentItems = JSON.parse(sessionStorage.getItem('currentWishlist') || '[]');
            
            if (currentItems.length === 0) {
                alert('No hay juegos en tu lista de deseos');
                return;
            }

            currentItems.forEach(item => {
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                const existingItem = cart.find(cartItem => cartItem.id === item.game.id.toString());

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        id: item.game.id.toString(),
                        name: item.game.name,
                        price: item.game.sale_price || item.game.price,
                        quantity: 1,
                        image: item.game.image
                    });
                }

                localStorage.setItem('cart', JSON.stringify(cart));
            });
            
            document.dispatchEvent(new CustomEvent('cartUpdated'));
            alert(`Se añadieron ${currentItems.length} juegos al carrito`);
        };

        document.addEventListener('wishlistCleared', handleWishlistCleared);
        document.addEventListener('addAllToCart', handleAddAllToCart);

        return () => {
            console.log('🧹 Limpiando event listeners...');
            document.removeEventListener('wishlistCleared', handleWishlistCleared);
            document.removeEventListener('addAllToCart', handleAddAllToCart);
        };
    }, []); // ← ARRAY VACÍO - NUNCA CAMBIA

    // Actualizar sessionStorage cuando cambien los items (para el botón "añadir todo")
    useEffect(() => {
        if (wishlistItems.length > 0) {
            sessionStorage.setItem('currentWishlist', JSON.stringify(wishlistItems));
        }
    }, [wishlistItems]);

    // Estados de carga
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-white">
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
                    onClick={() => {
                        console.log('🔄 Reintentando cargar wishlist...');
                        loadWishlist();
                    }}
                    className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition-colors"
                >
                    Reintentar
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
                {wishlistItems.map((item) => (
                    <div key={item.id} className="bg-gray-700 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform">
                        <a href={`/games/${item.game.console?.slug || 'unknown'}/${item.game.slug}`} className="block">
                            <div className="aspect-square bg-gray-900 flex items-center justify-center">
                                <img 
                                    src={item.game.image ? `http://localhost:8000/storage/${item.game.image}` : '/assets/images/placeholder.png'} 
                                    alt={item.game.name}
                                    className="max-w-full max-h-full object-contain p-4"
                                    
                                />
                            </div>
                        </a>
                        
                        <div className="p-4">
                            <h3 className="font-bold text-white mb-2 truncate">{item.game.name}</h3>
                            <p className="text-gray-400 text-sm mb-2">{item.game.console?.name || 'Console desconocida'}</p>
                            
                            <div className="flex justify-between items-center mb-3">
                                {item.game.sale_price ? (
                                    <div>
                                        <span className="font-bold text-white">{parseFloat(item.game.sale_price).toFixed(2)} €</span>
                                        <span className="text-gray-400 line-through text-sm ml-2">{parseFloat(item.game.price).toFixed(2)} €</span>
                                    </div>
                                ) : (
                                    <span className="font-bold text-white">{parseFloat(item.game.price).toFixed(2)} €</span>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => addToCart(item.game)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
                                >
                                    <i className="fas fa-shopping-cart mr-1"></i>
                                    Añadir al Carrito
                                </button>
                                <button 
                                    onClick={() => {
                                        if (confirm('¿Eliminar este juego de tu lista de deseos?')) {
                                            removeFromWishlist(item.game.id);
                                        }
                                    }}
                                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition-colors"
                                    title="Eliminar de la lista de deseos"
                                >
                                    <i className="fas fa-heart-broken"></i>
                                </button>
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-2">
                                Añadido: {new Date(item.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}