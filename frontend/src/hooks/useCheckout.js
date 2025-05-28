// frontend/src/hooks/useCheckout.js
import { useState } from 'react';
import { useCart } from './useCart';

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { clearCart } = useCart();

  // Crear orden en el backend
  const createOrder = async (orderData) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No autorizado');
    }

    try {
      const response = await fetch('http://localhost:8000/api/orders/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al crear la orden');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Procesar pago con Stripe
  const processStripePayment = async ({ paymentIntentId, shippingData, cartItems, total }) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Primero crear el payment intent en el backend
      const intentResponse = await fetch('http://localhost:8000/api/payment/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: total,
          shipping_address: shippingData
        })
      });

      if (!intentResponse.ok) {
        throw new Error('Error al crear el pago');
      }

      const { client_secret, payment_intent_id } = await intentResponse.json();

      // Retornar los datos necesarios para el frontend de Stripe
      return {
        clientSecret: client_secret,
        paymentIntentId: payment_intent_id
      };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Confirmar pago con Stripe
  const confirmStripePayment = async ({ paymentIntentId, shippingData }) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Confirmar el pago en el backend
      const response = await fetch('http://localhost:8000/api/payment/stripe/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          shipping_address: shippingData
        })
      });

      if (!response.ok) {
        throw new Error('Error al confirmar el pago');
      }

      const result = await response.json();
      
      // Limpiar el carrito después del pago exitoso
      await clearCart();
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Procesar pago con PayPal
  const processPayPalPayment = async ({ orderId, shippingData }) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Crear orden de PayPal
      const response = await fetch('http://localhost:8000/api/payment/paypal/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shipping_address: shippingData
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear orden de PayPal');
      }

      const { order_id } = await response.json();
      return order_id;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Capturar pago de PayPal
  const capturePayPalPayment = async (orderId) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8000/api/payment/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: orderId
        })
      });

      if (!response.ok) {
        throw new Error('Error al capturar el pago de PayPal');
      }

      const result = await response.json();
      
      // Limpiar el carrito después del pago exitoso
      await clearCart();
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createOrder,
    processStripePayment,
    confirmStripePayment,
    processPayPalPayment,
    capturePayPalPayment
  };
};