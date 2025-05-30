import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const OrdersList = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedOrders, setExpandedOrders] = useState([]);

  // Fetch orders
  const fetchOrders = async (page = 1) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page,
        sort: sortOrder,
        ...(filter && { status: filter })
      });

      const response = await fetch(`http://localhost:8000/api/user/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
      } else {
        setError('Error al cargar los pedidos');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Listen for filter changes from Astro
  useEffect(() => {
    const handleFilterChange = (event) => {
      const { status, sort } = event.detail;
      setFilter(status);
      setSortOrder(sort);
      setCurrentPage(1);
    };

    const handleRefresh = () => {
      fetchOrders(currentPage);
    };

    document.addEventListener('ordersFilterChange', handleFilterChange);
    document.addEventListener('ordersRefresh', handleRefresh);
    
    return () => {
      document.removeEventListener('ordersFilterChange', handleFilterChange);
      document.removeEventListener('ordersRefresh', handleRefresh);
    };
  }, [currentPage]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isInitialized) return;

    if (isInitialized && !isAuthenticated) {
      window.location.href = '/?showLogin=true&redirect=/profile/orders';
    }
  }, [isInitialized, isAuthenticated]);

  // Fetch orders when component mounts or filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(currentPage);
    }
  }, [isAuthenticated, currentPage, filter, sortOrder]);

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Loading state
  if (!isInitialized || loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600 text-red-400 px-6 py-4 rounded-lg text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg mb-2">{error}</p>
        <button 
          onClick={() => fetchOrders(currentPage)}
          className="text-red-400 hover:text-red-300 underline"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-600',
      processing: 'bg-blue-900/20 text-blue-400 border-blue-600',
      completed: 'bg-green-900/20 text-green-400 border-green-600',
      cancelled: 'bg-red-900/20 text-red-400 border-red-600'
    };
    return colors[status] || 'bg-gray-700 text-gray-300 border-gray-600';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="bg-gray-700 rounded-lg p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 className="text-lg font-medium text-white mb-2">No tienes pedidos</h3>
        <p className="text-gray-400 mb-6">Empieza a comprar para ver tus pedidos aquí.</p>
        <a
          href="/games"
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Ir a la tienda
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrders.includes(order.id);
          const shippingAddress = typeof order.shipping_address === 'string' 
            ? JSON.parse(order.shipping_address) 
            : order.shipping_address;
          const items = order.orderItems || order.items || [];

          return (
            <div key={order.id} className="bg-gray-700 rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Pedido #{order.id}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-xl font-bold text-white">{order.total} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Método de pago</p>
                    <p className="text-sm text-gray-200">
                      {order.payment_method === 'stripe' ? 'Tarjeta de Crédito' : 'PayPal'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Artículos</p>
                    <p className="text-sm text-gray-200">{order.items_count || items.length} productos</p>
                  </div>
                </div>

                {/* Toggle Details Button */}
                <button
                  onClick={() => toggleOrderExpansion(order.id)}
                  className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center transition-colors"
                >
                  {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                  <svg
                    className={`w-4 h-4 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-600">
                  {/* Items */}
                  <div className="p-6 bg-gray-800/50">
                    <h4 className="font-medium text-white mb-4">Productos</h4>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 bg-gray-700/50 p-3 rounded-lg">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-600 rounded-lg overflow-hidden">
                            <img
                              src={`http://localhost:8000/storage/${item.game?.image}`}
                              alt={item.game?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {item.game?.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {item.game?.console?.name} • Cantidad: {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-green-400">
                            {(item.price * item.quantity).toFixed(2)} €
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t border-gray-600 p-6 bg-gray-800/30">
                    <h4 className="font-medium text-white mb-2">Dirección de envío</h4>
                    <div className="text-sm text-gray-300">
                      <p>{shippingAddress.address}</p>
                      <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                      <p>{shippingAddress.country}</p>
                      <p>Tel: {shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status === 'completed' && (
                    <div className="border-t border-gray-600 p-6 bg-gray-800/30">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-300">
                          <svg className="w-5 h-5 inline mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Pedido completado con éxito
                        </p>
                        <a
                          href={`/profile/orders/${order.id}`}
                          className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
                        >
                          Ver factura
                        </a>
                      </div>
                    </div>
                  )}

                  {order.status === 'pending' && (
                    <div className="border-t border-gray-600 p-6 bg-gray-800/30">
                      <p className="text-sm text-yellow-400">
                        <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Este pedido está pendiente de confirmación
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="px-4 py-2 text-gray-300">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default OrdersList;