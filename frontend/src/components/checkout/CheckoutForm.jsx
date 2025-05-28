import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useUpdateUser } from '../../hooks/useUpdateUser';
import { showToast } from '../../utils/toast';
import OrderSummary from './OrderSummary';
import ShippingForm from './ShippingForm';
import PaymentMethods from './PaymentMethods';

const CheckoutForm = ({ stripePublicKey, paypalClientId }) => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const { cartItems, loading: cartLoading, getCartTotal } = useCart();
  const { updateUserAddress } = useUpdateUser();
  const [step, setStep] = useState(1);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [shippingData, setShippingData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'España',
    phone: ''
  });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Debug logs
  console.log('CheckoutForm - Estado:', {
    isAuthenticated,
    isInitialized,
    cartLoading,
    cartItemsLength: cartItems.length,
    user: user ? { id: user.id, name: user.name } : null
  });

  // Actualizar datos de envío cuando el usuario cargue
  useEffect(() => {
    if (user) {
      const hasShippingData = user.address || user.city || user.postal_code || user.phone;
      setShippingData({
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postal_code || '',
        country: user.country || 'España',
        phone: user.phone || ''
      });
      // Si no hay datos de envío, mostrar el formulario de edición automáticamente
      setIsEditingShipping(!hasShippingData);
    }
  }, [user]);

  // Redirigir si no está autenticado o no hay items
  useEffect(() => {
    // Esperar a que el hook de auth esté inicializado
    if (!isInitialized) {
      console.log('CheckoutForm - Esperando inicialización del auth...');
      return;
    }

    // Solo verificar autenticación después de que esté inicializado
    if (isInitialized && !isAuthenticated) {
      console.log('CheckoutForm - Usuario no autenticado, redirigiendo...');
      // Pequeño delay para evitar redirecciones instantáneas
      setTimeout(() => {
        window.location.href = '/?showLogin=true&redirect=/checkout';
      }, 100);
      return;
    }
    
    // Solo verificar carrito si está autenticado y no está cargando
    if (isAuthenticated && !cartLoading && cartItems.length === 0) {
      console.log('CheckoutForm - Carrito vacío, redirigiendo...');
      setTimeout(() => {
        window.location.href = '/cart';
      }, 100);
    }
  }, [isInitialized, isAuthenticated, cartItems, cartLoading]);

  // Calcular totales
  const subtotal = getCartTotal();
  const shipping = 0; // Envío gratis
  const total = subtotal + shipping;

  const handleShippingSubmit = async (data) => {
    setShippingData(data);
    
    // Si estamos editando, actualizar los datos del usuario en la base de datos
    if (isEditingShipping) {
      const result = await updateUserAddress({
        address: data.address,
        city: data.city,
        postal_code: data.postalCode,
        country: data.country,
        phone: data.phone
      });
      
      if (result.success) {
        showToast('Dirección actualizada correctamente', 'success', {
          title: 'Éxito'
        });
      } else {
        showToast(result.error || 'Error al actualizar la dirección', 'error', {
          title: 'Error'
        });
      }
    }
    
    setIsEditingShipping(false);
    setStep(2);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  // Mostrar loading mientras carga o no está inicializado
  if (!isInitialized || cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Si llegamos aquí pero no hay usuario, mostrar loading
  // (debería redirigir pronto)
  if (!user) {
    console.log('CheckoutForm - No hay usuario, mostrando loading...');
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Mostrar mensaje de sesión iniciada
  const sessionInfo = user && (
    <div className="flex items-center justify-center mt-2 text-sm text-green-600 mb-4">
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Sesión iniciada como {user.name}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Forms */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {step === 1 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Dirección de Envío</h2>
                {!isEditingShipping && (
                  <button
                    onClick={() => setIsEditingShipping(true)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                )}
              </div>

              <ShippingForm
                initialData={shippingData}
                onSubmit={handleShippingSubmit}
                errors={errors}
                isEditing={isEditingShipping}
                onCancel={() => setIsEditingShipping(false)}
              />
            </>
          ) : (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a Dirección
                </button>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-6">Método de Pago</h2>
              
              <PaymentMethods
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={handlePaymentMethodSelect}
                stripePublicKey={stripePublicKey}
                paypalClientId={paypalClientId}
                total={total}
                shippingData={shippingData}
                cartItems={cartItems}
              />
            </>
          )}
        </div>
      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:col-span-1">
        {sessionInfo}
        <OrderSummary
          items={cartItems}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          currentStep={step}
        />
      </div>
    </div>
  );
};

export default CheckoutForm;