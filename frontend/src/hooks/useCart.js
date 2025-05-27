import { useState, useEffect, useCallback } from 'react';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener artículos del carrito desde la API
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
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
      } else if (response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setCartItems([]);
        window.location.href = '/login';
      } else {
        setError('Error al cargar el carrito');
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Error de conexión');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Añadir artículo a la cesta
  const addToCart = async (gameId, quantity = 1) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
      return { success: false, message: 'Debes iniciar sesión' };
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

      const data = await response.json();

      if (response.ok) {
        await fetchCart();
        
        // Disparar evento personalizado para actualizar otros componentes
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { items: data.items } 
        }));
        
        // Actualizar el contador del header directamente
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          // Obtener el nuevo total desde la respuesta
          await fetchCart(); // Asegurarse de tener los datos actualizados
          const totalItems = getItemCount();
          cartCount.textContent = totalItems;
        }
        
        return { success: true, message: 'Producto añadido al carrito' };
      } else {
        return { success: false, message: data.message || 'Error al añadir al carrito' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Actualizar la cantidad de artículos
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
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Eliminar artículo de la cesta
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
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Limpiar carrito
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
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Calcular el total del carrito y el número de artículos
  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Cargar el carrito 
  useEffect(() => {
    fetchCart();

    // Escuchar las actualizaciones del carro de otros componentes
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Escuchar los cambios de autenticación
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        fetchCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchCart]);

  return {
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
};