// src/utils/cartConfig.js

// URL específica para peticiones del carrito
export const CART_API_URL = 'http://localhost:8000/api';

// Helper para obtener headers de autenticación consistentes
export const getCartHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Función helper para hacer peticiones a la API del carrito
export const cartApiRequest = async (endpoint, options = {}) => {
  const url = `${CART_API_URL}${endpoint}`;
  const config = {
    headers: getCartHeaders(),
    ...options,
  };
  
  try {
    console.log(`Enviando petición carrito a: ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Cart API Error (${endpoint}):`, error);
    throw error;
  }
};

// Funciones específicas para el carrito que reemplazan las de api.js
export const cartFunctions = {
  // Obtener carrito del usuario
  getCart: async () => {
    try {
      const response = await cartApiRequest('/cart');
      if (response && response.success) {
        return response.data;
      }
      throw new Error('Invalid cart response');
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },
  
  // Agregar producto al carrito
  addToCart: async (gameId, quantity = 1) => {
    try {
      const response = await cartApiRequest('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ game_id: gameId, quantity })
      });
      
      if (response && response.success) {
        return response.data;
      }
      throw new Error(response?.message || 'Error adding to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },
  
  // Actualizar cantidad de un producto en el carrito
  updateCartItem: async (gameId, quantity) => {
    try {
      const response = await cartApiRequest('/cart/update', {
        method: 'PUT', 
        body: JSON.stringify({ game_id: gameId, quantity })
      });
      
      if (response && response.success) {
        return response.data;
      }
      throw new Error(response?.message || 'Error updating cart item');
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },
  
  // Eliminar producto del carrito
  removeFromCart: async (gameId) => {
    try {
      const response = await cartApiRequest('/cart/remove', {
        method: 'DELETE',
        body: JSON.stringify({ game_id: gameId })
      });
      
      if (response && response.success) {
        return response.data;
      }
      throw new Error(response?.message || 'Error removing from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },
  
  // Vaciar carrito
  clearCart: async () => {
    try {
      const response = await cartApiRequest('/cart/clear', { method: 'DELETE' });
      
      if (response && response.success) {
        return response.data;
      }
      throw new Error(response?.message || 'Error clearing cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
  
  // Migrar carrito desde localStorage
  migrateCart: async (items) => {
    try {
      const response = await cartApiRequest('/cart/migrate', {
        method: 'POST',
        body: JSON.stringify({ items })
      });
      
      if (response && response.success) {
        return response.data;
      }
      throw new Error(response?.message || 'Error migrating cart');
    } catch (error) {
      console.error('Error migrating cart:', error);
      throw error;
    }
  }
};