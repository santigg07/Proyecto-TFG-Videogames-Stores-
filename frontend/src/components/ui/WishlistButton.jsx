// src/components/ui/WishlistButton.jsx
import React, { useState, useEffect } from 'react';

export default function WishlistButton({ 
  gameId, 
  size = 'md', 
  showText = false,
  onWishlistChange = null 
}) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación y estado de wishlist al cargar
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
    
    if (token && gameId) {
      checkWishlistStatus();
    }
  }, [gameId]);

  const checkWishlistStatus = async () => {
    try {
      const API_URL = 'http://localhost:8000/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_URL}/wishlist/check/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.in_wishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Mostrar modal de login
      document.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = 'http://localhost:8000/api';
      const token = localStorage.getItem('auth_token');

      if (isInWishlist) {
        // Eliminar de wishlist
        const response = await fetch(`${API_URL}/wishlist/${gameId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          setIsInWishlist(false);
          if (onWishlistChange) onWishlistChange(false);
        }
      } else {
        // Añadir a wishlist
        const response = await fetch(`${API_URL}/wishlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ game_id: gameId })
        });

        if (response.ok) {
          setIsInWishlist(true);
          if (onWishlistChange) onWishlistChange(true);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "transition-all duration-200 flex items-center justify-center";
    const sizeClasses = {
      sm: "w-6 h-6 text-sm",
      md: "w-8 h-8 text-base", 
      lg: "w-10 h-10 text-lg"
    };
    
    const colorClasses = isInWishlist 
      ? "text-red-500 hover:text-red-600" 
      : "text-gray-400 hover:text-red-500";
    
    return `${baseClasses} ${sizeClasses[size]} ${colorClasses}`;
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      className={getButtonClasses()}
      title={isInWishlist ? "Eliminar de lista de deseos" : "Añadir a lista de deseos"}
    >
      {isLoading ? (
        <svg className="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <svg 
          fill={isInWishlist ? "currentColor" : "none"} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      )}
      {showText && (
        <span className="ml-1 text-xs">
          {isInWishlist ? "En deseos" : "Desear"}
        </span>
      )}
    </button>
  );
}