import React, { useState } from 'react';

const SimpleAddToCartButton = ({ gameId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevenir la navegación del enlace padre
    const link = e.target.closest('a');
    if (link) {
      e.preventDefault();
    }
    
    // Verificar si hay token de autenticación
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setMessage({ type: 'error', text: 'Debes iniciar sesión' });
      setTimeout(() => setMessage(null), 3000);
      
      // Redirigir al login después de 1 segundo
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          game_id: gameId, 
          quantity: 1 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '¡Añadido!' });
        
        // Disparar evento para actualizar el contador del carrito
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Actualizar el contador del header directamente
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          const currentCount = parseInt(cartCount.textContent) || 0;
          cartCount.textContent = currentCount + 1;
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Error al añadir' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setIsLoading(false);
      // Limpiar mensaje después de 2 segundos
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <>
      <button 
        onClick={handleAddToCart}
        disabled={isLoading}
        className={`
          bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-all
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          ${message?.type === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
          ${message?.type === 'error' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        `}
      >
        {isLoading ? (
          <span className="flex items-center">
            <span className="animate-spin mr-1">⌛</span>
            ...
          </span>
        ) : message ? (
          <span className="flex items-center">
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </span>
        ) : (
          'Añadir'
        )}
      </button>
    </>
  );
};

export default SimpleAddToCartButton;