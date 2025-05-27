import React, { useState, useEffect } from 'react';
import { useCheckout } from '../../hooks/useCheckout';

// Componente para simular Stripe Elements
const StripeCheckout = ({ 
  stripePublicKey, 
  total, 
  shippingData, 
  cartItems,
  onSuccess,
  onError,
  setLoading: setParentLoading
}) => {
  const { processStripePayment, confirmStripePayment, loading } = useCheckout();
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    cardholderName: ''
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setParentLoading(loading || processing);
  }, [loading, processing, setParentLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatear número de tarjeta
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    }

    // Validar mes
    if (name === 'expMonth') {
      if (value.length > 2) return;
      if (parseInt(value) > 12) return;
    }

    // Validar año
    if (name === 'expYear') {
      if (value.length > 2) return;
    }

    // Validar CVC
    if (name === 'cvc') {
      if (value.length > 3) return;
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }
    if (!cardData.expMonth || cardData.expMonth.length !== 2) {
      newErrors.expMonth = 'Mes inválido';
    }
    if (!cardData.expYear || cardData.expYear.length !== 2) {
      newErrors.expYear = 'Año inválido';
    }
    if (!cardData.cvc || cardData.cvc.length < 3) {
      newErrors.cvc = 'CVC inválido';
    }
    if (!cardData.cardholderName) {
      newErrors.cardholderName = 'Nombre del titular requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setProcessing(true);

    try {
      // Crear payment intent
      const { clientSecret, paymentIntentId } = await processStripePayment({
        total,
        shippingData,
        cartItems
      });

      // Simular confirmación del pago (en producción usarías Stripe.js)
      console.log('Procesando pago con Stripe...');
      
      // Esperar 2 segundos para simular el procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirmar el pago
      const result = await confirmStripePayment({
        paymentIntentId,
        shippingData
      });

      onSuccess(result.order.id);
    } catch (error) {
      onError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Modo de prueba:</strong> Usa la tarjeta 4242 4242 4242 4242 con cualquier fecha futura y CVC.
        </p>
      </div>

      <div className="space-y-4">
        {/* Nombre del titular */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del titular
          </label>
          <input
            type="text"
            name="cardholderName"
            value={cardData.cardholderName}
            onChange={handleInputChange}
            placeholder="John Doe"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
              errors.cardholderName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.cardholderName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
          )}
        </div>

        {/* Número de tarjeta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de tarjeta
          </label>
          <input
            type="text"
            name="cardNumber"
            value={cardData.cardNumber}
            onChange={handleInputChange}
            placeholder="4242 4242 4242 4242"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
        </div>

        {/* Fecha y CVC */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes
            </label>
            <input
              type="text"
              name="expMonth"
              value={cardData.expMonth}
              onChange={handleInputChange}
              placeholder="MM"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
                errors.expMonth ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.expMonth && (
              <p className="mt-1 text-sm text-red-600">{errors.expMonth}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <input
              type="text"
              name="expYear"
              value={cardData.expYear}
              onChange={handleInputChange}
              placeholder="YY"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
                errors.expYear ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.expYear && (
              <p className="mt-1 text-sm text-red-600">{errors.expYear}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVC
            </label>
            <input
              type="text"
              name="cvc"
              value={cardData.cvc}
              onChange={handleInputChange}
              placeholder="123"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
                errors.cvc ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cvc && (
              <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
            )}
          </div>
        </div>

        {/* Botón de pago */}
        <button
          onClick={handleSubmit}
          disabled={processing}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
            processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {processing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            `Pagar ${total.toFixed(2)} €`
          )}
        </button>
      </div>
    </div>
  );
};

export default StripeCheckout;