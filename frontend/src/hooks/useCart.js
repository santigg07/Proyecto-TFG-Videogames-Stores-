import { useState, useEffect, useCallback } from 'react';
import { showToast } from '../utils/toast';

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
        showToast('Sesión expirada. Por favor, inicia sesión nuevamente.', 'warning');
        setTimeout(() => {
          window.location.href = '/?showLogin=true';
        }, 1500);
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
      showToast('Debes iniciar sesión para añadir productos', 'warning', {
        title: 'Sesión requerida'
      });
      setTimeout(() => {
        window.location.href = '/?showLogin=true&redirect=' + window.location.pathname;
      }, 1000);
      return { success: false, message: 'Debes iniciar sesión' };
    }

    try {
      // Primero intentar obtener info del juego para mostrar el nombre
      let gameName = 'Producto';
      try {
        const gameResponse = await fetch(`http://localhost:8000/api/games/${gameId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (gameResponse.ok) {
          const gameData = await gameResponse.json();
          gameName = gameData.game?.name || gameData.data?.name || 'Producto';
        }
      } catch (err) {
        // Si falla obtener el nombre, continuamos con "Producto"
        console.log('No se pudo obtener el nombre del juego');
      }

      // Añadir al carrito
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
        
        // Mostrar toast de éxito
        showToast(`${gameName} añadido al carrito`, 'success', {
          title: '¡Producto añadido!',
          duration: 3000
        });
        
        // Disparar evento personalizado para actualizar otros componentes
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { items: data.items } 
        }));
        
        // Actualizar el contador del header directamente
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          await fetchCart(); // Asegurarse de tener los datos actualizados
          const totalItems = getItemCount();
          cartCount.textContent = totalItems;
        }
        
        return { success: true, message: 'Producto añadido al carrito' };
      } else {
        // Manejar diferentes tipos de errores
        if (data.message?.toLowerCase().includes('ya está en el carrito') || 
            data.message?.toLowerCase().includes('already in cart')) {
          showToast('Este producto ya está en tu carrito', 'info', {
            title: 'Ya añadido'
          });
        } else if (data.message?.toLowerCase().includes('stock')) {
          showToast('No hay suficiente stock disponible', 'warning', {
            title: 'Stock limitado'
          });
        } else {
          showToast(data.message || 'Error al añadir al carrito', 'error', {
            title: 'Error'
          });
        }
        return { success: false, message: data.message || 'Error al añadir al carrito' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Error de conexión. Por favor, intenta de nuevo.', 'error', {
        title: 'Error de conexión'
      });
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
        showToast('Cantidad actualizada', 'success', {
          duration: 2000
        });
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        showToast('Error al actualizar cantidad', 'error');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast('Error de conexión', 'error');
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
        showToast('Producto eliminado del carrito', 'info');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        showToast('Error al eliminar el producto', 'error');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      showToast('Error de conexión', 'error');
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
        showToast('Carrito vaciado', 'info');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        showToast('Error al vaciar el carrito', 'error');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      showToast('Error de conexión', 'error');
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