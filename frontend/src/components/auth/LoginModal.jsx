// src/components/auth/LoginModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  useEffect(() => {
    function handleToggleModal() {
      setIsOpen(prev => !prev);
    }

    document.addEventListener('toggle-login-modal', handleToggleModal);
    
    return () => {
      document.removeEventListener('toggle-login-modal', handleToggleModal);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userData = await login(email, password);
      
      if (userData) {
        // ✅ AQUÍ AÑADIMOS EL TOAST DE ÉXITO
        document.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            title: `👋 ¡Bienvenido, ${userData.name}!`,
            message: 'Has iniciado sesión correctamente.',
            type: 'success',
            duration: 3000
          }
        }));

        // Cerrar modal
        setIsOpen(false);
        
        // Limpiar formulario
        setEmail('');
        setPassword('');

        // Redirigir si hay una URL pendiente (sin recargar página)
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
        if (redirectUrl) {
          setTimeout(() => {
            // Usar history.pushState en lugar de window.location.href
            window.history.pushState({}, '', decodeURIComponent(redirectUrl));
            
            // Disparar evento personalizado para que el componente se actualice
            window.dispatchEvent(new PopStateEvent('popstate'));
          }, 1500);
        }
      }
    } catch (err) {
      // Toast de error ya se maneja en useAuth, pero podemos añadir uno específico
      document.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          title: '❌ Error de inicio de sesión',
          message: error || 'No se pudo iniciar sesión. Verifica tus credenciales.',
          type: 'error',
          duration: 4000
        }
      }));
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
      onClick={handleOverlayClick}
    >
      {/* Modal sin fondo oscuro, con sombra más prominente */}
      <div className="bg-[#131a2d] border-2 border-[#131a2d] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl pointer-events-auto transform scale-105">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Iniciar sesión</h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-100 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 bg-gray-800 border-gray-600 focus:ring-red-500"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-300">
                Recordarme
              </label>
            </div>
            <div className="text-sm">
              <a href="/forgot-password" className="text-red-400 hover:text-red-300">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              ¿No tienes cuenta?
              <a href="/register" className="ml-1 text-red-400 hover:text-red-300 font-medium">
                Regístrate ahora
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}