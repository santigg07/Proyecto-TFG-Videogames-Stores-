// src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    termsAccepted: false
  });
  
  const [errors, setErrors] = useState({});
  const { register, isLoading, error } = useAuth();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Limpiar error específico cuando el usuario edita un campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Las contraseñas no coinciden';
    }
    
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'Debes aceptar los términos y condiciones';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await register(formData);
      // El usuario será redirigido por el hook useAuth si el registro es exitoso
    } catch (err) {
      // Los errores de la API ya son manejados por el hook useAuth
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            className={`bg-gray-800 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 ${
              errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className={`bg-gray-800 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            className={`bg-gray-800 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 ${
              errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-300 mb-1">
            Confirmar contraseña
          </label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            value={formData.passwordConfirmation}
            onChange={handleChange}
            className={`bg-gray-800 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 ${
              errors.passwordConfirmation ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'
            }`}
          />
          {errors.passwordConfirmation && (
            <p className="mt-1 text-sm text-red-400">{errors.passwordConfirmation}</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={handleChange}
            className={`h-4 w-4 bg-gray-800 border-gray-600 rounded text-red-600 focus:ring-red-500 ${
              errors.termsAccepted ? 'border-red-500' : ''
            }`}
          />
          <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-300">
            Acepto los términos y condiciones
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="mt-1 text-sm text-red-400">{errors.termsAccepted}</p>
        )}
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70"
        >
          {isLoading ? 'Procesando...' : 'Crear cuenta'}
        </button>
      </div>
    </form>
  );
}