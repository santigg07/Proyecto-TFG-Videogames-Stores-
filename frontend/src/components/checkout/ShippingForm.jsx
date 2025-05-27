import React, { useState } from 'react';

const ShippingForm = ({ initialData, onSubmit, errors }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validar antes de enviar
    const newErrors = {};
    if (!formData.address) newErrors.address = 'La dirección es requerida';
    if (!formData.city) newErrors.city = 'La ciudad es requerida';
    if (!formData.postalCode) newErrors.postalCode = 'El código postal es requerido';
    if (!formData.phone) newErrors.phone = 'El teléfono es requerido';
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <div className="space-y-4">
      {/* Display current shipping info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-gray-600 mb-1">Dirección de envío actual:</p>
        <div className="text-gray-900">
          <p className="font-medium">{initialData.address || 'No especificada'}</p>
          {initialData.city && <p>{initialData.city}, {initialData.postalCode}</p>}
          {initialData.country && <p>{initialData.country}</p>}
          {initialData.phone && <p>Tel: {initialData.phone}</p>}
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Dirección completa
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Calle, número, piso..."
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      {/* City and Postal Code */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Código Postal
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
              errors.postalCode ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Country - Cambiado a input */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          País
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
            errors.country ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="España"
        />
        {errors.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+34 600 000 000"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
        >
          Continuar al Pago
        </button>
      </div>
    </div>
  );
};

export default ShippingForm;