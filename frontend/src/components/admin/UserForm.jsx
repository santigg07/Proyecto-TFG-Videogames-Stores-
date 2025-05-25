// src/components/admin/UserForm.jsx
import React, { useState, useEffect } from 'react';

export default function UserForm({ 
  user = null, 
  roles = [],
  onSubmit, 
  onCancel, 
  isLoading = false,
  currentUserId // Para evitar que el admin cambie su propio rol
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    email_verified_at: false
  });

  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role_id: user.role_id || '',
        email_verified_at: !!user.email_verified_at
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });

    // Limpiar errores del campo que se está editando
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Debe seleccionar un rol';
    }

    // Validaciones de contraseña (solo para nuevos usuarios o si se quiere cambiar)
    if (!user || formData.password) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Las contraseñas no coinciden';
      }
    }

    // Validación especial: no permitir que el admin actual cambie su propio rol
    if (user && user.id === currentUserId && formData.role_id !== user.role_id) {
      newErrors.role_id = 'No puedes cambiar tu propio rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para envío
    const submitData = { ...formData };
    
    // Si estamos editando y no se cambió la contraseña, no enviarla
    if (user && !formData.password) {
      delete submitData.password;
      delete submitData.password_confirmation;
    }

    onSubmit(submitData);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto  bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header fijo */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Preview del usuario */}
              {formData.name && (
                <div className="bg-gray-700 rounded-lg p-4 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {getInitials(formData.name)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{formData.name}</h4>
                    <p className="text-gray-400 text-sm">{formData.email}</p>
                  </div>
                </div>
              )}

              {/* Grid de campos principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Nombre */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="Ej: Juan Pérez"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="usuario@ejemplo.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>

                {/* Rol */}
                <div>
                  <label htmlFor="role_id" className="block text-sm font-medium text-gray-300 mb-2">
                    Rol *
                  </label>
                  <select
                    id="role_id"
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    disabled={user && user.id === currentUserId}
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.role_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name === 'admin' ? '👑 Administrador' : '👤 Cliente'}
                      </option>
                    ))}
                  </select>
                  {errors.role_id && <p className="mt-1 text-sm text-red-400">{errors.role_id}</p>}
                  {user && user.id === currentUserId && (
                    <p className="mt-1 text-xs text-yellow-400">No puedes cambiar tu propio rol</p>
                  )}
                </div>

                {/* Estado de verificación */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado del email
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="email_verified_at"
                      checked={formData.email_verified_at}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Email verificado</span>
                  </label>
                </div>
              </div>

              {/* Sección de contraseñas */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">
                    {user ? 'Cambiar Contraseña' : 'Contraseña'}
                  </h3>
                  {user && (
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {showPasswords ? 'Cancelar cambio' : 'Cambiar contraseña'}
                    </button>
                  )}
                </div>

                {(!user || showPasswords) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Contraseña */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                        {user ? 'Nueva contraseña' : 'Contraseña'} *
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                          errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                        }`}
                        placeholder="Mínimo 8 caracteres"
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                    </div>

                    {/* Confirmar contraseña */}
                    <div>
                      <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirmar contraseña *
                      </label>
                      <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                          errors.password_confirmation ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                        }`}
                        placeholder="Repetir contraseña"
                      />
                      {errors.password_confirmation && <p className="mt-1 text-sm text-red-400">{errors.password_confirmation}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">ℹ️ Información</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Los administradores tienen acceso completo al panel</li>
                  <li>• Los clientes solo pueden acceder a su perfil y compras</li>
                  <li>• La verificación de email permite funciones adicionales</li>
                  {user ? (
                    <li>• Si no cambias la contraseña, se mantendrá la actual</li>
                  ) : (
                    <li>• La contraseña debe tener al menos 8 caracteres</li>
                  )}
                </ul>
              </div>
            </form>
          </div>

          {/* Footer fijo con botones */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 border-t border-gray-700 bg-gray-800">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:border-gray-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Guardando...' : (user ? 'Actualizar' : 'Crear')} Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}