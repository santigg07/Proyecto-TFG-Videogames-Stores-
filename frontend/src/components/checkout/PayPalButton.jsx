import React, { useState, useEffect } from 'react';
import { useCheckout } from '../../hooks/useCheckout';

const PayPalButton = ({ 
  paypalClientId, 
  total, 
  shippingData, 
  cartItems,
  onSuccess,
  onError,
  setLoading: setParentLoading
}) => {
  const { processPayPalPayment, capturePayPalPayment, loading } = useCheckout();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setParentLoading(loading || processing);
  }, [loading, processing, setParentLoading]);

  const handlePayPalClick = async () => {
    setProcessing(true);

    try {
      // Crear orden de PayPal
      const orderId = await processPayPalPayment({
        shippingData
      });

      // Simular ventana de PayPal (en producción usarías el SDK de PayPal)
      console.log('Abriendo ventana de PayPal...');
      
      // Simular aprobación del usuario después de 3 segundos
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Capturar el pago
      const result = await capturePayPalPayment(orderId);

      onSuccess(result.order.id);
    } catch (error) {
      onError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Modo sandbox:</strong> Serás redirigido a PayPal para completar el pago de forma segura.
        </p>
      </div>

      <button
        onClick={handlePayPalClick}
        disabled={processing}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
          processing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#FFC439] hover:bg-[#f0b429] text-[#003087]'
        }`}
      >
        {processing ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </span>
        ) : (
          <>
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.03.17a.804.804 0 0 1-.794.679H7.72a.483.483 0 0 1-.477-.558L7.418 21h1.518l.95-6.02h1.385c4.678 0 7.75-2.203 8.796-6.502zm-2.96-5.09c.762.868.983 1.81.752 3.285-.019.123-.04.24-.062.36-.735 3.773-3.089 5.446-6.956 5.446H8.957c-.481 0-.894.356-.969.835l-.03.156-.966 6.123-.028.156a.44.44 0 0 1-.435.369H3.487a.209.209 0 0 1-.206-.24l.538-3.406.002-.013L5.7 4.642a.996.996 0 0 1 .984-.835h5.114c2.49 0 4.497.535 5.71 1.582z"/>
            </svg>
            Pagar con PayPal
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Serás redirigido a PayPal para completar tu pago de <strong>{total.toFixed(2)} €</strong>
      </p>
    </div>
  );
};

export default PayPalButton;