import React, { useState } from 'react';
import StripeCheckout from './StripeCheckout';
import PayPalButton from './PayPalButton';

const PaymentMethods = ({ 
  selectedMethod, 
  onSelectMethod, 
  stripePublicKey, 
  paypalClientId,
  total,
  shippingData,
  cartItems 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Tarjeta de Crédito/Débito',
      description: 'Paga de forma segura con tu tarjeta',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="4" fill="#635BFF"/>
          <path d="M16.5 11.5v4.7c0 .8.6 1.3 1.5 1.3s1.5-.5 1.5-1.3v-.2c0-.6-.4-1-1-1h-.5v-1h.5c.6 0 1-.4 1-1v-.2c0-.8-.6-1.3-1.5-1.3s-1.5.5-1.5 1.3zm-3.5 0v4.7c0 .8.6 1.3 1.5 1.3s1.5-.5 1.5-1.3v-4.7h-1v4.7c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-4.7h-1zm-3.5 0v6h1v-2h.5c1.1 0 2-.9 2-2s-.9-2-2-2h-1.5zm1 1h.5c.6 0 1 .4 1 1s-.4 1-1 1h-.5v-2zm12 2.5h2v1h-2v1h2.5v1h-3.5v-6h3.5v1H22v1h2v1h-2v1z" fill="white"/>
        </svg>
      ),
      brands: ['Visa', 'Mastercard', 'American Express']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Paga con tu cuenta PayPal',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="4" fill="#00457C"/>
          <path d="M21.5 9.5c1.5 0 2.7.5 3.5 1.5.8 1 1 2.3.7 3.8-.5 2.5-2.5 4.2-5 4.2h-.7c-.3 0-.6.2-.7.5l-.5 3c-.1.3-.3.5-.7.5h-2.1c-.3 0-.5-.3-.4-.6l.1-.4h1.4c.3 0 .6-.2.7-.5l.5-3c.1-.3.3-.5.7-.5h.7c2.5 0 4.5-1.7 5-4.2.3-1.5.1-2.8-.7-3.8-.5-.6-1.2-1-2-1.2.3.2.5.4.7.7.4.7.5 1.5.3 2.4-.4 2-1.9 3.4-3.8 3.4h-2.4c-.3 0-.6.2-.7.5l-1.5 9.1c-.1.3.1.6.4.6h2.1c.3 0 .6-.2.7-.5l.5-3c.1-.3.3-.5.7-.5h.7c2.5 0 4.5-1.7 5-4.2.3-1.5.1-2.8-.7-3.8-.8-1-2-1.5-3.5-1.5h-4.8c-.3 0-.6.2-.7.5l-2 12.1c-.1.3.1.6.4.6h2.7c.3 0 .6-.2.7-.5l.5-3.1.5-3c.1-.3.3-.5.7-.5h2.4c1.9 0 3.4-1.4 3.8-3.4.2-.9.1-1.7-.3-2.4-.4-.7-1.1-1-2-1h-.3c.1-.3.3-.5.7-.5h1.3z" fill="white"/>
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {method.icon}
                <div>
                  <h3 className="font-medium text-gray-900">{method.name}</h3>
                  <p className="text-sm text-gray-500">{method.description}</p>
                  {method.brands && (
                    <div className="flex items-center space-x-2 mt-2">
                      {method.brands.map((brand) => (
                        <span key={brand} className="text-xs text-gray-500">
                          {brand}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                selectedMethod === method.id
                  ? 'border-red-500 bg-red-500'
                  : 'border-gray-300'
              }`}>
                {selectedMethod === method.id && (
                  <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Payment Form */}
      {selectedMethod && (
        <div className="mt-6">
          {selectedMethod === 'stripe' && (
            <StripeCheckout
              stripePublicKey={stripePublicKey}
              total={total}
              shippingData={shippingData}
              cartItems={cartItems}
              onSuccess={(paymentId) => {
                window.location.href = `/checkout/success?payment_id=${paymentId}&method=stripe`;
              }}
              onError={(error) => setError(error)}
              setLoading={setLoading}
            />
          )}

          {selectedMethod === 'paypal' && (
            <PayPalButton
              paypalClientId={paypalClientId}
              total={total}
              shippingData={shippingData}
              cartItems={cartItems}
              onSuccess={(paymentId) => {
                window.location.href = `/checkout/success?payment_id=${paymentId}&method=paypal`;
              }}
              onError={(error) => setError(error)}
              setLoading={setLoading}
            />
          )}
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="text-xs text-gray-500 text-center mt-6">
        Al realizar el pago, aceptas nuestros{' '}
        <a href="/terms" className="text-red-600 hover:underline">
          términos y condiciones
        </a>{' '}
        y{' '}
        <a href="/privacy" className="text-red-600 hover:underline">
          política de privacidad
        </a>
      </div>
    </div>
  );
};

export default PaymentMethods;