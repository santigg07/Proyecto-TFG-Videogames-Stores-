import React, { useState } from 'react';

const OrderCard = ({ order, getStatusColor, getStatusText }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parsear dirección si es string
  const shippingAddress = typeof order.shipping_address === 'string' 
    ? JSON.parse(order.shipping_address) 
    : order.shipping_address;

  // Usar orderItems o items según lo que venga del backend
  const items = order.orderItems || order.items || [];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Order Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Pedido #{order.id}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">{order.total} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Método de pago</p>
            <p className="text-sm text-gray-900">
              {order.payment_method === 'stripe' ? 'Tarjeta de Crédito' : 'PayPal'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Artículos</p>
            <p className="text-sm text-gray-900">{order.items_count || items.length} productos</p>
          </div>
        </div>

        {/* Toggle Details Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
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
        <div className="border-t border-gray-200">
          {/* Items */}
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Productos</h4>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`http://localhost:8000/storage/${item.game?.image}`}
                      alt={item.game?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.game?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.game?.console?.name} • Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {(item.price * item.quantity).toFixed(2)} €
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-t border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-2">Dirección de envío</h4>
            <div className="text-sm text-gray-600">
              <p>{shippingAddress.address}</p>
              <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
              <p>{shippingAddress.country}</p>
              <p>Tel: {shippingAddress.phone}</p>
            </div>
          </div>

          {/* Actions */}
          {order.status === 'completed' && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  <svg className="w-5 h-5 inline mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pedido completado con éxito
                </p>
                <a
                  href={`/profile/orders/${order.id}`}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Ver factura
                </a>
              </div>
            </div>
          )}

          {order.status === 'pending' && (
            <div className="border-t border-gray-200 p-6">
              <p className="text-sm text-yellow-600">
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
};

export default OrderCard;