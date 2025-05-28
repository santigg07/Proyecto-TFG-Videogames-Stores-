import React, { createContext, useContext, useState, useEffect } from 'react';


const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart items from API
  const fetchCart = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      } else {
        setError('Error al cargar el carrito');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (gameId, quantity = 1) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // Redirigir al login
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ game_id: gameId, quantity })
      });

      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, message: data.message || 'Error al añadir al carrito' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`http://localhost:8000/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`http://localhost:8000/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Clear cart
  const clearCart = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch('http://localhost:8000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Calculate totals
  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Load cart on mount and when auth changes
  useEffect(() => {
    fetchCart();

    // Listen for auth changes
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        fetchCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
    getCartTotal,
    getItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};