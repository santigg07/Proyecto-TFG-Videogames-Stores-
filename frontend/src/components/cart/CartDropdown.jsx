import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { 
    cartItems, 
    loading,
    updateQuantity, 
    removeItem, 
    getCartTotal, 
    getItemCount 
  } = useCart();

  useEffect(() => {
    checkAuthStatus();
    
    // Escuchar eventos para toggle del dropdown
    const handleToggleCart = () => {
      setIsOpen(prev => !prev);
    };

    document.addEventListener('toggle-cart-dropdown', handleToggleCart);
    
    return () => {
      document.removeEventListener('toggle-cart-dropdown', handleToggleCart);
    };
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    await removeItem(itemId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="relative">
      {/* Botón del carrito */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Abrir carrito"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0h9.1M6 13v6a2 2 0 002 2h8a2 2 0 002-2v-6" 
          />
        </svg>
        
        {/* Badge con número de items */}
        {getItemCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {getItemCount()}
          </span>
        )}
      </button>

      {/* Panel del carrito */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Carrito de Compras
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Estado de autenticación */}
            <div className="mb-4 p-3 rounded-lg bg-gray-50 border">
              <div className="flex items-center space-x-2">
                <svg 
                  className="w-5 h-5 text-gray-600" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                
                <span className="text-sm">
                  {isAuthenticated ? (
                    <span className="text-green-600 font-medium">
                      ✓ Sesión iniciada
                    </span>
                  ) : (
                    <span className="text-orange-600">
                      <a href="/login" className="underline font-medium hover:text-orange-700">
                        Inicia sesión
                      </a> para finalizar tu compra
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Contenido del carrito */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando carrito...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0h9.1" />
                </svg>
                <p className="text-gray-600">Tu carrito está vacío</p>
                <p className="text-sm text-gray-400 mt-1">¡Agrega algunos juegos retro!</p>
              </div>
            ) : (
              <>
                {/* Lista de items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.game?.image ? `http://localhost:8000/storage/${item.game.image}` : `https://via.placeholder.com/48x48/dc2626/white?text=${item.game?.name?.split(' ')[0] || 'Game'}`}
                        alt={item.game?.name || 'Juego'}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48x48/dc2626/white?text=Game';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.game?.name || 'Producto sin nombre'}
                        </h4>
                        <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-sm ml-2"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total y botones */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-gray-900">{formatPrice(getCartTotal())}</span>
                  </div>
                  
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          window.location.href = '/checkout';
                        }}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Proceder al Checkout
                      </button>
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          window.location.href = '/cart';
                        }}
                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Ver Carrito Completo
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          window.location.href = '/login';
                        }}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Iniciar Sesión para Comprar
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay para cerrar el carrito */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CartDropdown;