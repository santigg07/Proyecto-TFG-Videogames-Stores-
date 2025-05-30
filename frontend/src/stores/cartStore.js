import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  // Cargar items del carrito desde el backend
  fetchCart: async () => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ items: [], loading: false });
        return;
      }

      const response = await fetch('http://localhost:8000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        set({ items: data.items || [], loading: false });
      } else {
        set({ error: 'Error al cargar el carrito', loading: false });
      }
    } catch (error) {
      set({ error: 'Error de conexión', loading: false });
      console.error('Error al cargar el carrito:', error);
    }
  },

  // Añadir item al carrito
  addItem: async (gameId, quantity = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login?redirect=' + window.location.pathname;
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/cart/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ game_id: gameId, quantity })
      });

      if (response.ok) {
        const newItem = await response.json();
        const currentItems = get().items;
        
        // Verificar si el item ya existe
        const existingItem = currentItems.find(item => item.game_id === gameId);
        
        if (existingItem) {
          // Actualizar cantidad
          set({
            items: currentItems.map(item =>
              item.game_id === gameId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          // Añadir nuevo item
          set({ items: [...currentItems, newItem] });
        }
        
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  // Actualizar cantidad de un item
  updateQuantity: async (itemId, quantity) => {
    if (quantity < 1) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        set({
          items: get().items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        });
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  },

  // Eliminar item del carrito
  removeItem: async (itemId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        set({
          items: get().items.filter(item => item.id !== itemId)
        });
      }
    } catch (error) {
      console.error('Error al eliminar item:', error);
    }
  },

  // Vaciar carrito
  clearCart: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        set({ items: [] });
      }
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
    }
  },

  // Obtener el total de items
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  // Obtener el subtotal
  getSubtotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  // Obtener el total (con envío si aplica)
  getTotal: () => {
    return get().getSubtotal(); // Por ahora envío gratis
  }
}));

export default useCartStore;