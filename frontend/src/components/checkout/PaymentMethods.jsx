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
          <path d="M16 20.174c-2.184 0-4.026-.568-5.077-1.237l.799-2.444c.946.568 2.444 1.108 3.947 1.108 1.154 0 1.773-.463 1.773-1.16 0-.639-.505-1.006-1.871-1.436-1.944-.609-3.257-1.639-3.257-3.226 0-1.855 1.544-3.278 4.198-3.278 1.969 0 3.423.446 4.317 1.002l-.757 2.387c-.676-.412-1.725-.907-3.174-.907-1.084 0-1.593.463-1.593 1.014 0 .639.612.926 2.062 1.366 2.134.645 3.095 1.68 3.095 3.303 0 1.832-1.397 3.418-4.462 3.418z" fill="white"/>
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
          <path d="M13.313 24.973c-.116 0-.224-.079-.241-.194a.247.247 0 0 1 .241-.299h2.052c.37 0 .692-.268.755-.632l.387-2.473.023-.15.437-2.781a.308.308 0 0 1 .304-.254h1.303c2.483 0 4.435-1.01 5.003-3.935.236-1.217.095-2.234-.398-2.862-.511-.652-1.392-.982-2.618-.982h-3.816a.763.763 0 0 0-.755.632l-1.796 11.397a.247.247 0 0 0 .241.299h2.264l.568-3.604-.005.032c.055-.364.386-.632.755-.632h1.573c3.084 0 5.497-1.252 6.203-4.873.021-.107.039-.211.054-.313-.088-.046-.088-.046 0 0 .21-1.341-.001-2.252-.721-3.078-.793-.908-2.227-1.298-4.046-1.298h-5.599c-.37 0-.692.268-.755.632l-2.227 14.661a.247.247 0 0 0 .241.299h3.442z" fill="#139AD6"/>
          <path d="M21.967 10.973c-.039-.248-.119-.476-.236-.681-.793-.908-2.227-1.298-4.046-1.298h-5.599c-.37 0-.692.268-.755.632l-2.227 14.661a.247.247 0 0 0 .241.299h3.442l.864-5.484-.027.171c.063-.364.385-.632.755-.632h1.573c3.084 0 5.497-1.252 6.203-4.873.021-.107.039-.211.054-.313.167-1.067.099-1.82-.541-2.482z" fill="#253B80"/>
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