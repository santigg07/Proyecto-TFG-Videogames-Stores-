// src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms_accepted: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const { register, isLoading, error } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Las contraseñas no coinciden';
    }
    
    if (!formData.terms_accepted) {
      errors.terms_accepted = 'Debes aceptar los términos y condiciones';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const success = await register(formData);
    
    if (success) {
      // Redirigir a la página principal o mostrar mensaje de éxito
      window.location.href = '/';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mostrar error global del hook */}
      {error && (
        <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Campo de nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className={`bg-gray-800 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500 ${
            formErrors.name ? 'border border-red-500' : ''
          }`}
        />
        {formErrors.name && (
          <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>
        )}
      </div>
      
      {/* Campo de email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`bg-gray-800 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500 ${
            formErrors.email ? 'border border-red-500' : ''
          }`}
        />
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
        )}
      </div>
      
      {/* Campo de contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={`bg-gray-800 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500 ${
            formErrors.password ? 'border border-red-500' : ''
          }`}
        />
        {formErrors.password ? (
          <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">
            La contraseña debe tener al menos 8 caracteres
          </p>
        )}
      </div>
      
      {/* Campo de confirmación de contraseña */}
      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-300 mb-1">
          Confirmar contraseña
        </label>
        <input
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          value={formData.password_confirmation}
          onChange={handleChange}
          className={`bg-gray-800 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500 ${
            formErrors.password_confirmation ? 'border border-red-500' : ''
          }`}
        />
        {formErrors.password_confirmation && (
          <p className="mt-1 text-sm text-red-400">{formErrors.password_confirmation}</p>
        )}
      </div>
      
      {/* Aceptación de términos */}
      <div className="flex items-start">
        <input
          id="terms_accepted"
          name="terms_accepted"
          type="checkbox"
          checked={formData.terms_accepted}
          onChange={handleChange}
          className={`h-4 w-4 mt-1 bg-gray-800 border-gray-600 focus:ring-red-500 ${
            formErrors.terms_accepted ? 'border-red-500' : ''
          }`}
        />
        <label htmlFor="terms_accepted" className="ml-2 block text-sm text-gray-300">
          Acepto los <a href="/terms" className="text-red-400 hover:text-red-300">Términos y Condiciones</a> y la <a href="/privacy" className="text-red-400 hover:text-red-300">Política de Privacidad</a>
        </label>
      </div>
      {formErrors.terms_accepted && (
        <p className="mt-1 text-sm text-red-400">{formErrors.terms_accepted}</p>
      )}
      
      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md transition-colors disabled:opacity-70"
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  );
}