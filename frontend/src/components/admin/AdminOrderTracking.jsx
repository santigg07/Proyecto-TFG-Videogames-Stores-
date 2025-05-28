// src/components/admin/AdminOrderTracking.jsx
import React, { useState, useEffect } from 'react';
import { showToast } from '../../utils/toast';

const AdminOrderTracking = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    tracking_number: '',
    shipping_carrier: '',
    shipping_status: 'pending',
    shipping_notes: ''
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el pedido');
      }

      const data = await response.json();
      setOrder(data.order);
      
      // Actualizar el formulario con los datos existentes
      setFormData({
        tracking_number: data.order.tracking_number || '',
        shipping_carrier: data.order.shipping_carrier || '',
        shipping_status: data.order.shipping_status || 'pending',
        shipping_notes: data.order.shipping_notes || ''
      });
    } catch (err) {
      showToast('Error al cargar el pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para realizar esta acción');
        }
        throw new Error('Error al actualizar el tracking');
      }

      showToast('Información de tracking actualizada correctamente', 'success');
      await fetchOrder(); // Recargar datos
    } catch (err) {
      showToast(err.message || 'Error al actualizar', 'error');
    } finally {
      setSaving(false);
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

  if (!order) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-red-400">Pedido no encontrado</p>
      </div>
    );
  }

  const shippingAddress = order.shipping_address ? 
    (typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address) : {};

  return (
    <div className="space-y-6">
      {/* Información del pedido */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Información del Pedido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Cliente:</p>
            <p className="text-white">
              {order.user?.name}<br/>
              <span className="text-gray-400">{order.user?.email}</span>
            </p>
          </div>
          <div>
            <p className="text-gray-400">Total:</p>
            <p className="text-white text-xl font-bold">{order.total} €</p>
          </div>
          <div>
            <p className="text-gray-400">Dirección de envío:</p>
            <p className="text-white">
              {shippingAddress.address}<br/>
              {shippingAddress.city}, {shippingAddress.postal_code || shippingAddress.postalCode}<br/>
              {shippingAddress.phone && `Tel: ${shippingAddress.phone}`}
            </p>
          </div>
        </div>
      </div>

      {/* Productos del pedido */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Productos</h3>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
              <div>
                <p className="text-white">{item.game?.name}</p>
                <p className="text-gray-400 text-sm">{item.game?.console?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-white">Cantidad: {item.quantity}</p>
                <p className="text-gray-400">{item.price} € c/u</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario de tracking */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Gestionar Tracking</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Número de tracking */}
          <div>
            <label htmlFor="tracking_number" className="block text-sm font-medium text-gray-300 mb-2">
              Número de Tracking
            </label>
            <input
              type="text"
              id="tracking_number"
              name="tracking_number"
              value={formData.tracking_number}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Ej: RR123456789ES"
            />
          </div>

          {/* Transportista */}
          <div>
            <label htmlFor="shipping_carrier" className="block text-sm font-medium text-gray-300 mb-2">
              Transportista
            </label>
            <select
              id="shipping_carrier"
              name="shipping_carrier"
              value={formData.shipping_carrier}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Seleccionar transportista</option>
              <option value="Correos">Correos</option>
              <option value="SEUR">SEUR</option>
              <option value="MRW">MRW</option>
              <option value="UPS">UPS</option>
              <option value="FedEx">FedEx</option>
              <option value="DHL">DHL</option>
              <option value="Envialia">Envialia</option>
              <option value="GLS">GLS</option>
            </select>
          </div>

          {/* Estado del envío */}
          <div>
            <label htmlFor="shipping_status" className="block text-sm font-medium text-gray-300 mb-2">
              Estado del Envío
            </label>
            <select
              id="shipping_status"
              name="shipping_status"
              value={formData.shipping_status}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="pending">Pendiente</option>
              <option value="preparing">Preparando</option>
              <option value="shipped">Enviado</option>
              <option value="in_transit">En tránsito</option>
              <option value="delivered">Entregado</option>
              <option value="returned">Devuelto</option>
            </select>
          </div>

          {/* Fechas automáticas */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Fechas automáticas:</p>
            <div className="space-y-1 text-sm">
              {order.shipped_at && (
                <p className="text-gray-300">
                  Enviado: {new Date(order.shipped_at).toLocaleString('es-ES')}
                </p>
              )}
              {order.delivered_at && (
                <p className="text-gray-300">
                  Entregado: {new Date(order.delivered_at).toLocaleString('es-ES')}
                </p>
              )}
              {!order.shipped_at && !order.delivered_at && (
                <p className="text-gray-500 italic">Las fechas se actualizarán automáticamente</p>
              )}
            </div>
          </div>

          {/* Notas del envío */}
          <div className="md:col-span-2">
            <label htmlFor="shipping_notes" className="block text-sm font-medium text-gray-300 mb-2">
              Notas del Envío
            </label>
            <textarea
              id="shipping_notes"
              name="shipping_notes"
              value={formData.shipping_notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Notas opcionales sobre el envío..."
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center mt-6">
          <a
            href="/admin/orders"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Volver a pedidos
          </a>
          
          <div className="flex gap-3">
            <a
              href={`/profile/orders/${orderId}`}
              target="_blank"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Ver como cliente
            </a>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminOrderTracking;