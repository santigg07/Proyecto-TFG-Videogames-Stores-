import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';

// Íconos SVG como componentes
const ShoppingCartIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7.5H19"></path>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
  </svg>
);

const MinusIcon = () => (
  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
  </svg>
);

const CartComponent = () => {
  const { 
    cartItems, 
    loading, 
    error,
    updateQuantity, 
    removeItem, 
    clearCart, 
    getCartTotal,
    getItemCount 
  } = useCart();
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUserSession();
    
    // Verificar si hay token de autenticación
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const checkUserSession = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUser(null);
      }
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-600">Cargando carrito...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">Error al cargar el carrito</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <a 
              href="/games" 
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Volver a la tienda
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Carrito vacío
  if (!cartItems?.length) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Agrega algunos juegos retro a tu carrito para comenzar</p>
            <a 
              href="/games" 
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Explorar juegos
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCartIcon className="mr-3 w-8 h-8" />
              Carrito de compras
            </h1>
            <p className="text-gray-600 mt-2">
              {getItemCount()} artículo{getItemCount() !== 1 ? 's' : ''} en tu carrito
            </p>

            {/* Mensaje de usuario autenticado */}
            {user && (
              <div className="mt-4 p-3 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-center space-x-2">
                  <UserIcon />
                  <span className="text-sm text-green-600 font-medium">
                    ✓ Sesión iniciada como {user.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
                    <button
                      onClick={clearCart}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 bg-white">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Imagen del producto */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.game?.image ? `http://localhost:8000/storage/${item.game.image}` : `https://via.placeholder.com/80x80/dc2626/white?text=${item.game?.name?.split(' ')[0] || 'Game'}`}
                            alt={item.game?.name || 'Juego'}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80x80/dc2626/white?text=Game';
                            }}
                          />
                        </div>

                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.game?.name || 'Producto sin nombre'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.game?.console?.name || 'Consola retro'}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                          
                          {/* Stock disponible */}
                          {item.game?.stock && (
                            <p className="text-xs text-gray-500 mt-1">
                              Stock disponible: {item.game.stock}
                            </p>
                          )}
                        </div>

                        {/* Controles de cantidad y precio */}
                        <div className="flex flex-col items-end space-y-4">
                          {/* Precio total */}
                          <div className="text-lg font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </div>

                          {/* Controles de cantidad */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={loading || item.quantity <= 1}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <MinusIcon />
                            </button>
                            <span className="w-12 text-center font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={loading || (item.game?.stock && item.quantity >= item.game.stock)}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <PlusIcon />
                            </button>
                          </div>

                          {/* Botón eliminar */}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <TrashIcon />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen del pedido</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getItemCount()} artículos)</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => window.location.href = '/checkout'}
                    disabled={loading || !cartItems.length}
                    className="w-full py-3 px-4 rounded-lg font-medium text-center flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 text-white hover:bg-red-700"
                  >
                    <LockIcon />
                    <span className="ml-2">Proceder al pago</span>
                  </button>

                  <div className="text-center pt-2">
                    <a
                      href="/games"
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Continuar comprando
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 bg-gray-50 rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Envío gratuito</h3>
                  <p className="text-sm text-gray-500">En pedidos superiores a 50€</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Garantía</h3>
                  <p className="text-sm text-gray-500">30 días de devolución</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Pago Seguro</h3>
                  <p className="text-sm text-gray-500">Stripe y PayPal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartComponent;