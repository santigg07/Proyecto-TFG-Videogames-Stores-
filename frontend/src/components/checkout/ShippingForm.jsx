import React, { useState, useEffect } from 'react';

const ShippingForm = ({ initialData, onSubmit, errors, isEditing, onCancel }) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = () => {
    // Validar antes de enviar
    const newErrors = {};
    if (!formData.address) newErrors.address = 'La dirección es requerida';
    if (!formData.city) newErrors.city = 'La ciudad es requerida';
    if (!formData.postalCode) newErrors.postalCode = 'El código postal es requerido';
    if (!formData.phone) newErrors.phone = 'El teléfono es requerido';
    if (!formData.country) newErrors.country = 'El país es requerido';
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
      setFormErrors({});
    } else {
      setFormErrors(newErrors);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setFormErrors({});
    onCancel();
  };

  // Vista de solo lectura
  if (!isEditing) {
    const hasCompleteData = formData.address && formData.city && formData.postalCode && formData.phone;
    
    if (!hasCompleteData) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            No tienes una dirección de envío guardada. Haz clic en "Editar" para añadir una.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Dirección:</p>
              <p className="text-gray-900 font-medium">{formData.address}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Ciudad:</p>
                <p className="text-gray-900">{formData.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Código Postal:</p>
                <p className="text-gray-900">{formData.postalCode}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">País:</p>
                <p className="text-gray-900">{formData.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Teléfono:</p>
                <p className="text-gray-900">{formData.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón separado de la caja */}
        <button
          onClick={() => onSubmit(formData)}
          className="w-full mt-6 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
        >
          Continuar al Pago
        </button>
      </>
    );
  }

  // Vista de edición
  return (
    <div className="space-y-4">
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
            formErrors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Calle, número, piso..."
        />
        {formErrors.address && (
          <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
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
              formErrors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Madrid, Barcelona..."
          />
          {formErrors.city && (
            <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
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
              formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="28001"
          />
          {formErrors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Country */}
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
            formErrors.country ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="España"
        />
        {formErrors.country && (
          <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>
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
            formErrors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+34 600 000 000"
        />
        {formErrors.phone && (
          <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
        )}
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="pt-4 flex gap-3">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
        >
          Guardar y Continuar
        </button>
        {onCancel && (
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default ShippingForm;