import React, { useState, useEffect } from 'react';
import { showToast } from '../../utils/toast';
import ShippingTracking from './ShippingTracking';

const OrderDetail = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pedido no encontrado');
        }
        throw new Error('Error al cargar el pedido');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = async () => {
    try {
      showToast('Generando factura...', 'info');
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/invoices/${orderId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al generar la factura');
      }
      
      // Crear un blob con la respuesta
      const blob = await response.blob();
      
      // Crear un enlace temporal para descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura_${orderId.toString().padStart(6, '0')}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('Factura descargada correctamente', 'success');
    } catch (err) {
      showToast('Error al generar la factura', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-800';
      case 'processing':
        return 'bg-blue-900/20 text-blue-400 border-blue-800';
      case 'completed':
        return 'bg-green-900/20 text-green-400 border-green-800';
      case 'cancelled':
        return 'bg-red-900/20 text-red-400 border-red-800';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'stripe':
        return (
            <svg className="w-8 h-6" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="4" fill="#635BFF"/>
                <path d="M16 20.174c-2.184 0-4.026-.568-5.077-1.237l.799-2.444c.946.568 2.444 1.108 3.947 1.108 1.154 0 1.773-.463 1.773-1.16 0-.639-.505-1.006-1.871-1.436-1.944-.609-3.257-1.639-3.257-3.226 0-1.855 1.544-3.278 4.198-3.278 1.969 0 3.423.446 4.317 1.002l-.757 2.387c-.676-.412-1.725-.907-3.174-.907-1.084 0-1.593.463-1.593 1.014 0 .639.612.926 2.062 1.366 2.134.645 3.095 1.68 3.095 3.303 0 1.832-1.397 3.418-4.462 3.418z" fill="white"/>
            </svg>
        );
      case 'paypal':
        return (
        <svg className="w-8 h-7" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="4" fill="#00457C"/>
            <path d="M13.313 24.973c-.116 0-.224-.079-.241-.194a.247.247 0 0 1 .241-.299h2.052c.37 0 .692-.268.755-.632l.387-2.473.023-.15.437-2.781a.308.308 0 0 1 .304-.254h1.303c2.483 0 4.435-1.01 5.003-3.935.236-1.217.095-2.234-.398-2.862-.511-.652-1.392-.982-2.618-.982h-3.816a.763.763 0 0 0-.755.632l-1.796 11.397a.247.247 0 0 0 .241.299h2.264l.568-3.604-.005.032c.055-.364.386-.632.755-.632h1.573c3.084 0 5.497-1.252 6.203-4.873.021-.107.039-.211.054-.313-.088-.046-.088-.046 0 0 .21-1.341-.001-2.252-.721-3.078-.793-.908-2.227-1.298-4.046-1.298h-5.599c-.37 0-.692.268-.755.632l-2.227 14.661a.247.247 0 0 0 .241.299h3.442z" fill="#139AD6"/>
            <path d="M21.967 10.973c-.039-.248-.119-.476-.236-.681-.793-.908-2.227-1.298-4.046-1.298h-5.599c-.37 0-.692.268-.755.632l-2.227 14.661a.247.247 0 0 0 .241.299h3.442l.864-5.484-.027.171c.063-.364.385-.632.755-.632h1.573c3.084 0 5.497-1.252 6.203-4.873.021-.107.039-.211.054-.313.167-1.067.099-1.82-.541-2.482z" fill="#253B80"/>
        </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">{error}</p>
        </div>
        <button
          onClick={() => window.location.href = '/profile/orders'}
          className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Volver a Mis Pedidos
        </button>
      </div>
    );
  }

  if (!order) return null;

  // Manejar shipping_address que puede venir como string JSON o como objeto
  let shippingAddress = {};
  try {
    if (order.shipping_address) {
      if (typeof order.shipping_address === 'string') {
        shippingAddress = JSON.parse(order.shipping_address);
      } else if (typeof order.shipping_address === 'object') {
        shippingAddress = order.shipping_address;
      }
    }
  } catch (err) {
    console.error('Error parsing shipping address:', err);
    shippingAddress = {};
  }

  return (
    <div className="space-y-6">
      {/* Header con información principal */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Pedido #{order.id}
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                {new Date(order.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Descargar Factura
            </button>
          </div>
        </div>

        {/* Información de pago */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-700">
          <div>
            <p className="text-gray-400 text-sm mb-1">Método de Pago</p>
            <div className="flex items-center gap-2">
              {getPaymentMethodIcon(order.payment_method)}
              <span className="text-white capitalize">{order.payment_method}</span>
            </div>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm mb-1">ID de Transacción</p>
            <p className="text-white font-mono text-sm">{order.payment_id || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm mb-1">Total</p>
            <p className="text-white text-2xl font-bold">{order.total} €</p>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Productos</h2>
        <div className="space-y-4">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
              <div className="w-20 h-20 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                {item.game?.image ? (
                  <img
                    src={`http://localhost:8000/storage/${item.game.image}`}
                    alt={item.game?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-game.png'; // Asegúrate de tener una imagen placeholder
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-medium">{item.game?.name}</h3>
                <p className="text-gray-400 text-sm">{item.game?.console?.name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-gray-400">Cantidad: {item.quantity}</span>
                  <span className="text-gray-400">Precio unitario: {item.price} €</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-white font-semibold">
                  {(item.quantity * item.price).toFixed(2)} €
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Resumen de totales */}
        <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span>{order.total} €</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Envío</span>
            <span>Gratis</span>
          </div>
          <div className="flex justify-between text-white text-lg font-semibold pt-2 border-t border-gray-700">
            <span>Total</span>
            <span>{order.total} €</span>
          </div>
        </div>
      </div>

      {/* Dirección de envío */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Dirección de Envío</h2>
        <div className="bg-gray-700/50 rounded-lg p-4">
          {shippingAddress.address || shippingAddress.city ? (
            <>
              <p className="text-white">{shippingAddress.address || 'Dirección no especificada'}</p>
              <p className="text-gray-400">
                {shippingAddress.city || 'Ciudad no especificada'}{shippingAddress.postal_code || shippingAddress.postalCode ? `, ${shippingAddress.postal_code || shippingAddress.postalCode}` : ''}
              </p>
              <p className="text-gray-400">{shippingAddress.country || 'País no especificado'}</p>
              {shippingAddress.phone && (
                <p className="text-gray-400 mt-2">
                  <span className="text-gray-500">Teléfono:</span> {shippingAddress.phone}
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-400 italic">No se ha especificado dirección de envío</p>
          )}
        </div>
      </div>

      {/* Estado del envío */}
      <ShippingTracking order={order} />

      {/* Timeline del pedido (opcional) */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Historial del Pedido</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-3 h-3 bg-green-400 rounded-full mt-1.5"></div>
            <div className="flex-1">
              <p className="text-white font-medium">Pedido creado</p>
              <p className="text-gray-400 text-sm">
                {new Date(order.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          {order.status === 'completed' && (
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-green-400 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Pedido completado</p>
                <p className="text-gray-400 text-sm">
                  {new Date(order.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;