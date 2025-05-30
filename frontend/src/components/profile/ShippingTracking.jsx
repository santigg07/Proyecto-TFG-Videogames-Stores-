import React from 'react';

const ShippingTracking = ({ order }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'preparing':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'shipped':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      case 'in_transit':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'returned':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-gray-400';
      case 'preparing': return 'text-yellow-400';
      case 'shipped': return 'text-blue-400';
      case 'in_transit': return 'text-purple-400';
      case 'delivered': return 'text-green-400';
      case 'returned': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCarrierLogo = (carrier) => {
    switch (carrier?.toLowerCase()) {
      case 'correos':
        return '📮';
      case 'seur':
        return '📦';
      case 'mrw':
        return '🚚';
      case 'ups':
        return '🟫';
      case 'fedex':
        return '✈️';
      default:
        return '📦';
    }
  };

  const trackingSteps = [
    { status: 'pending', label: 'Pedido Recibido', description: 'Tu pedido ha sido recibido y está siendo procesado' },
    { status: 'preparing', label: 'Preparando', description: 'Estamos preparando tu pedido para el envío' },
    { status: 'shipped', label: 'Enviado', description: 'Tu pedido ha sido enviado' },
    { status: 'in_transit', label: 'En Tránsito', description: 'Tu pedido está en camino' },
    { status: 'delivered', label: 'Entregado', description: 'Tu pedido ha sido entregado' }
  ];

  const currentStepIndex = trackingSteps.findIndex(step => step.status === order.shipping_status);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Estado del Envío</h2>
        {order.tracking_number && (
          <div className="text-right">
            <p className="text-sm text-gray-400">Número de seguimiento</p>
            <p className="text-white font-mono">{order.tracking_number}</p>
            {order.shipping_carrier && (
              <p className="text-sm text-gray-400 mt-1">
                {getCarrierLogo(order.shipping_carrier)} {order.shipping_carrier}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Timeline del envío */}
      <div className="relative">
        {trackingSteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div key={step.status} className="flex items-start mb-8 last:mb-0">
              {/* Línea conectora */}
              {index < trackingSteps.length - 1 && (
                <div className={`absolute left-6 top-12 w-0.5 h-16 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-600'
                }`} />
              )}
              
              {/* Icono */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                isCompleted 
                  ? 'bg-gray-700 border-green-500' 
                  : 'bg-gray-800 border-gray-600'
              } ${isCurrent ? 'ring-4 ring-green-500/20' : ''}`}>
                <div className={getStatusColor(step.status)}>
                  {getStatusIcon(step.status)}
                </div>
              </div>
              
              {/* Contenido */}
              <div className="ml-4 flex-1">
                <h3 className={`font-medium ${
                  isCompleted ? 'text-white' : 'text-gray-500'
                }`}>
                  {step.label}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {step.description}
                </p>
                
                {/* Mostrar fecha si corresponde */}
                {step.status === 'shipped' && order.shipped_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(order.shipped_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                {step.status === 'delivered' && order.delivered_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(order.delivered_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notas de envío */}
      {order.shipping_notes && (
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Notas del envío:</p>
          <p className="text-white text-sm">{order.shipping_notes}</p>
        </div>
      )}

      {/* Botón de tracking externo */}
      {order.tracking_number && order.shipping_carrier && (
        <div className="mt-6">
          <button
            onClick={() => {
              // Aquí puedes agregar la lógica para abrir el tracking externo
              const trackingUrls = {
                'correos': `https://www.correos.es/ss/Satellite/site/aplicacion-4000003385017-localiza_busca_tu_envio/detalle_app-sidisp-1363190547558-ciudadano?numero=${order.tracking_number}`,
                'seur': `https://www.seur.com/livetracking/?segOnlineIdentificador=${order.tracking_number}`,
                'mrw': `https://www.mrw.es/seguimiento_envios/MRW_resultados_consultas.asp?modo=nacional&envio=${order.tracking_number}`,
                'ups': `https://www.ups.com/track?loc=es_ES&tracknum=${order.tracking_number}`,
                'fedex': `https://www.fedex.com/fedextrack/?trknbr=${order.tracking_number}`
              };
              
              const url = trackingUrls[order.shipping_carrier.toLowerCase()];
              if (url) {
                window.open(url, '_blank');
              }
            }}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver en {order.shipping_carrier}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShippingTracking;