// src/components/profile/SettingsForm.jsx
import React, { useState, useEffect } from 'react';

export default function SettingsForm() {
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const response = await fetch('/api/user/security', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTwoFactorEnabled(data.two_factor_enabled || false);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validaciones
    if (passwordData.new_password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(passwordData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Contraseña actualizada correctamente');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        setShowPasswordForm(false);
      } else {
        setError(result.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTwoFactor = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = twoFactorEnabled ? '/api/user/2fa/disable' : '/api/user/2fa/enable';
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        setTwoFactorEnabled(!twoFactorEnabled);
        setSuccess(twoFactorEnabled ? 
          'Autenticación de dos factores deshabilitada' : 
          'Autenticación de dos factores habilitada'
        );
      } else {
        setError(result.message || 'Error al cambiar la configuración de 2FA');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    const confirmed = confirm(
      '¿Estás seguro de que quieres eliminar todos tus datos personales? Esto incluye tu historial de pedidos, lista de deseos y configuraciones.'
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch('/api/user/data', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Todos tus datos han sido eliminados correctamente');
        // Recargar la página después de unos segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError('Error al eliminar los datos');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-600 bg-opacity-20 border border-green-500 text-green-100 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Cambiar Contraseña */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-white font-medium text-lg">Contraseña</h3>
            <p className="text-gray-400 text-sm">Actualiza tu contraseña para mantener tu cuenta segura</p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            {showPasswordForm ? 'Cancelar' : 'Cambiar Contraseña'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="current_password" className="block text-gray-300 text-sm font-medium mb-2">
                Contraseña Actual
              </label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Tu contraseña actual"
              />
            </div>
            
            <div>
              <label htmlFor="new_password" className="block text-gray-300 text-sm font-medium mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            
            <div>
              <label htmlFor="new_password_confirmation" className="block text-gray-300 text-sm font-medium mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                id="new_password_confirmation"
                name="new_password_confirmation"
                value={passwordData.new_password_confirmation}
                onChange={handlePasswordChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Repite la nueva contraseña"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        )}
      </div>

      {/* Autenticación de Dos Factores */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-medium text-lg">Autenticación de Dos Factores</h3>
            <p className="text-gray-400 text-sm">
              Añade una capa extra de seguridad a tu cuenta
            </p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                twoFactorEnabled ? 'bg-green-600 text-green-100' : 'bg-gray-600 text-gray-300'
              }`}>
                <i className={`fas ${twoFactorEnabled ? 'fa-shield-alt' : 'fa-shield'} mr-2`}></i>
                {twoFactorEnabled ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </div>
          </div>
          <button
            onClick={toggleTwoFactor}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              twoFactorEnabled 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50`}
          >
            {isLoading ? 'Procesando...' : twoFactorEnabled ? 'Deshabilitar' : 'Habilitar'}
          </button>
        </div>
      </div>

      {/* Sesiones Activas */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-white font-medium text-lg">Sesiones Activas</h3>
            <p className="text-gray-400 text-sm">Gestiona donde has iniciado sesión</p>
          </div>
          <button
            onClick={() => handleLogoutAllDevices()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Cerrar Todas las Sesiones
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <i className="fas fa-desktop text-white"></i>
              </div>
              <div>
                <div className="text-white font-medium">Dispositivo Actual</div>
                <div className="text-gray-400 text-sm">Chrome en Windows • Activo ahora</div>
              </div>
            </div>
            <span className="bg-green-600 text-green-100 px-3 py-1 rounded-full text-sm">
              Actual
            </span>
          </div>
        </div>
      </div>

      {/* Datos Personales */}
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-medium text-lg">Datos Personales</h3>
            <p className="text-gray-400 text-sm">Elimina todos tus datos personales guardados</p>
          </div>
          <button
            onClick={handleDeleteAllData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Eliminar Todos los Datos
          </button>
        </div>
      </div>
    </div>
  );

  async function handleLogoutAllDevices() {
    const confirmed = confirm('¿Estás seguro de que quieres cerrar sesión en todos los dispositivos?');
    
    if (!confirmed) return;
    
    try {
      const response = await fetch('/api/user/logout-all', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Se ha cerrado sesión en todos los dispositivos. Serás redirigido al inicio de sesión.');
        window.location.href = '/login';
      } else {
        setError('Error al cerrar las sesiones');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    }
  }
}