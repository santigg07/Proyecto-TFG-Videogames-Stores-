// src/components/profile/OrdersList.jsx
import React, { useState, useEffect } from 'react';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    sort: 'desc'
  });

  useEffect(() => {
    loadOrders();
    
    // Escuchar cambios en filtros
    const handleFilterChange = (e) => {
      setFilters(e.detail);
    };
    
    document.addEventListener('ordersFilterChange', handleFilterChange);
    return () => document.removeEventListener('ordersFilterChange', handleFilterChange);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      params.append('sort', filters.sort);

      const response = await fetch(`/api/user/orders?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      } else {
        setError('Error al cargar los pedidos');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-600', text: 'Pendiente' },
      processing: { bg: 'bg-blue-600', text: 'Procesando' },
      completed: { bg: 'bg-green-600', text: 'Completado' },
      cancelled: { bg: 'bg-red-600', text: 'Cancelado' }
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-600', text: status };
    
    return (
      <span className={`${config.bg} text-white px-3 py-1 rounded-full text-sm`}>
        {config.text}
      </span>
    );
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded text-center">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-shopping-bag text-6xl text-gray-600 mb-4"></i>
        <h3 className="text-xl font-bold text-white mb-2">No tienes pedidos aún</h3>
        <p className="text-gray-400 mb-6">¡Explora nuestro catálogo y haz tu primera compra!</p>
        <a 
          href="/catalog" 
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
        >
          Ver Catálogo
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-gray-700 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Pedido #{order.id}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{new Date(order.created_at).toLocaleDateString('es-ES')}</span>
                  <span>•</span>
                  <span>{order.items_count} artículo{order.items_count !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span className="font-bold text-white">€{order.total}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(order.status)}
                <button
                  onClick={() => toggleOrderDetails(order.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className={`fas fa-chevron-${expandedOrder === order.id ? 'up' : 'down'}`}></i>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  Método de pago: <span className="text-white capitalize">{order.payment_method}</span>
                </span>
              </div>
              <div className="flex space-x-2">
                {order.status === 'completed' && (
                  <button
                    onClick={() => downloadInvoice(order.id)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                  >
                    <i className="fas fa-download mr-2"></i>
                    Factura
                  </button>
                )}
                <button
                  onClick={() => toggleOrderDetails(order.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>

          {expandedOrder === order.id && (
            <div className="border-t border-gray-600 p-6">
              <h4 className="text-white font-bold mb-4">Artículos del pedido</h4>
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden">
                        <img
                          src={item.game?.image ? `/storage/${item.game.image}` : '/placeholder.jpg'}
                          alt={item.game?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h5 className="text-white font-medium">{item.game?.name}</h5>
                        <p className="text-gray-400 text-sm">{item.game?.console?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">€{item.price}</div>
                      <div className="text-gray-400 text-sm">Cantidad: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {order.shipping_address && (
                <div className="mt-6">
                  <h4 className="text-white font-bold mb-2">Dirección de envío</h4>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-300">{order.shipping_address}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}