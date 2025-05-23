// src/components/profile/WishlistGrid.jsx
import React, { useState, useEffect } from 'react';

export default function WishlistGrid() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWishlist();
    
    // Escuchar eventos
    const handleWishlistCleared = () => {
      setWishlistItems([]);
    };
    
    const handleAddAllToCart = () => {
      addAllToCart();
    };
    
    document.addEventListener('wishlistCleared', handleWishlistCleared);
    document.addEventListener('addAllToCart', handleAddAllToCart);
    
    return () => {
      document.removeEventListener('wishlistCleared', handleWishlistCleared);
      document.removeEventListener('addAllToCart', handleAddAllToCart);
    };
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/wishlist', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.data || []);
      } else {
        setError('Error al cargar la lista de deseos');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (gameId) => {
    try {
      const response = await fetch(`/api/user/wishlist/${gameId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.game.id !== gameId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (game) => {
    try {
      // Obtener carrito actual
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Verificar si el juego ya está en el carrito
      const existingItem = cart.find(item => item.id === game.id.toString());
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: game.id.toString(),
          name: game.name,
          price: game.sale_price || game.price,
          image: game.image,
          console: game.console?.name || '',
          quantity: 1
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Disparar evento para actualizar contador del carrito
      document.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Mostrar notificación
      showNotification(`${game.name} añadido al carrito`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const addAllToCart = async () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      let addedCount = 0;
      
      wishlistItems.forEach(item => {
        const game = item.game;
        const existingItem = cart.find(cartItem => cartItem.id === game.id.toString());
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            id: game.id.toString(),
            name: game.name,
            price: game.sale_price || game.price,
            image: game.image,
            console: game.console?.name || '',
            quantity: 1
          });
        }
        addedCount++;
      });
      
      localStorage.setItem('cart', JSON.stringify(cart));
      document.dispatchEvent(new CustomEvent('cartUpdated'));
      
      showNotification(`${addedCount} juegos añadidos al carrito`);
    } catch (error) {
      console.error('Error adding all to cart:', error);
    }
  };

  const showNotification = (message) => {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded text-center">
        {error}
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-heart text-6xl text-gray-600 mb-4"></i>
        <h3 className="text-xl font-bold text-white mb-2">Tu lista de deseos está vacía</h3>
        <p className="text-gray-400 mb-6">Añade juegos a tu lista de deseos para guardarlos para más tarde</p>
        <a 
          href="/catalog" 
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
        >
          Explorar Catálogo
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlistItems.map((item) => {
        const game = item.game;
        return (
          <div key={item.id} className="bg-gray-700 rounded-lg overflow-hidden group hover:transform hover:scale-105 transition-all duration-200">
            <div className="relative">
              <img
                src={game.image ? `/storage/${game.image}` : '/placeholder.jpg'}
                alt={game.name}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => removeFromWishlist(game.id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Eliminar de lista de deseos"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
              {game.sale_price && (
                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-sm">
                  Oferta
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-white font-bold text-lg mb-2 truncate">{game.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{game.console?.name}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {game.sale_price ? (
                    <>
                      <span className="text-red-400 font-bold text-lg">€{game.sale_price}</span>
                      <span className="text-gray-400 line-through text-sm">€{game.price}</span>
                    </>
                  ) : (
                    <span className="text-white font-bold text-lg">€{game.price}</span>
                  )}
                </div>
                
                <div className="flex items-center text-yellow-400">
                  <i className="fas fa-star mr-1"></i>
                  <span className="text-sm">4.5</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => addToCart(game)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                >
                  <i className="fas fa-shopping-cart mr-2"></i>
                  Añadir al Carrito
                </button>
                <a
                  href={`/games/${game.console?.slug}/${game.slug}`}
                  className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                >
                  <i className="fas fa-eye"></i>
                </a>
              </div>
              
              <div className="mt-3 text-xs text-gray-400">
                Añadido el {new Date(item.created_at).toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}