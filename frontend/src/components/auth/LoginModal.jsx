// src/components/auth/LoginModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isInitialized } = useAuth();

  useEffect(() => {
    // Manejar evento personalizado
    function handleToggleModal() {
      setIsOpen(prev => !prev);
    }

    // NUEVO: Detectar si hay que mostrar el modal por parámetro URL
    function checkShowLogin() {
      const urlParams = new URLSearchParams(window.location.search);
      const showLogin = urlParams.get('showLogin');
      const redirect = urlParams.get('redirect');
      
      if (showLogin === 'true') {
        setIsOpen(true);
        
        // Guardar redirect para después del login
        if (redirect) {
          sessionStorage.setItem('redirectAfterLogin', redirect);
        }
        
        // Limpiar los parámetros de la URL
        const url = new URL(window.location);
        url.searchParams.delete('showLogin');
        url.searchParams.delete('redirect');
        window.history.replaceState({}, document.title, url);
      }
    }

    // Verificar al cargar
    checkShowLogin();

    // También verificar cuando cambie la URL
    window.addEventListener('popstate', checkShowLogin);
    document.addEventListener('toggle-login-modal', handleToggleModal);
    
    return () => {
      window.removeEventListener('popstate', checkShowLogin);
      document.removeEventListener('toggle-login-modal', handleToggleModal);
    };
  }, []);

  // Solo procesar submit si el hook está inicializado
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isInitialized) {
      console.log('Auth hook no inicializado aún');
      return;
    }
    
    try {
      const userData = await login(email, password);
      
      if (userData) {
        // Toast de éxito
        document.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            title: `👋 ¡Bienvenido, ${userData.name}!`,
            message: 'Has iniciado sesión correctamente.',
            type: 'success',
            duration: 3000
          }
        }));

        // Cerrar modal y limpiar formulario
        setIsOpen(false);
        setEmail('');
        setPassword('');

        // ACTUALIZADO: Manejar redirección
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          // Usar location.href para forzar recarga completa
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1500);
        } else {
          // Recargar componentes que dependen del estado de autenticación
          window.dispatchEvent(new CustomEvent('auth-changed'));
          // También recargar la página para actualizar el estado
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error en login:', err);
      // Toast de error
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

  const handleModalClose = () => {
    setIsOpen(false);
    setEmail('');
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto  bg-opacity-50"
      onClick={handleOverlayClick}
    >
      {/* Modal con mejor contraste y diseño */}
      <div className="bg-[#1a1f2e] border-2 border-[#2a3441] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl pointer-events-auto transform scale-105">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Iniciar sesión</h2>
          <button 
            onClick={handleModalClose} 
            className="text-gray-400 hover:text-white transition-colors p-1"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-100 px-4 py-3 rounded mb-4 animate-pulse">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 bg-gray-800 border-gray-600 rounded focus:ring-red-500 text-red-600"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-300">
                Recordarme
              </label>
            </div>
            <div className="text-sm">
              <a href="/forgot-password" className="text-red-400 hover:text-red-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isInitialized}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </>
            ) : !isInitialized ? (
              'Cargando...'
            ) : (
              'Iniciar sesión'
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              ¿No tienes cuenta?
              <a href="/register" className="ml-1 text-red-400 hover:text-red-300 font-medium transition-colors">
                Regístrate ahora
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}