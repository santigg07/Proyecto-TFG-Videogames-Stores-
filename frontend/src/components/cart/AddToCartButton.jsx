import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';

const SimpleAddToCartButton = ({ gameId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevenir la navegación del enlace padre
    const link = e.target.closest('a');
    if (link) {
      e.preventDefault();
    }
    
    setIsLoading(true);
    
    try {
      // El hook useCart se encarga de todo, incluidos los toasts
      await addToCart(gameId, 1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`
        bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-105
      `}
    >
      {isLoading ? (
        <span className="flex items-center gap-1">
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>...</span>
        </span>
      ) : (
        'Añadir'
      )}
    </button>
  );
};

export default SimpleAddToCartButton;