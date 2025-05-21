// src/components/auth/LoginModal.jsx
import React, { useState, useEffect } from 'react';

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Escuchar el evento para abrir/cerrar el modal
  useEffect(() => {
    function handleToggleModal() {
      setIsOpen(prevState => !prevState);
      if (!isOpen) setError(null);
    }

    document.addEventListener('toggle-login-modal', handleToggleModal);
    document.addEventListener('open-login-modal', () => setIsOpen(true));
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('open-login') === 'true') {
      setIsOpen(true);
    }

    return () => {
      document.removeEventListener('toggle-login-modal', handleToggleModal);
      document.removeEventListener('open-login-modal', () => setIsOpen(true));
    };
  }, [isOpen]);

  // Cerrar modal al hacer clic fuera
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulación de autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('user', JSON.stringify({ email }));
      window.location.reload();
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      {/* Overlay semitransparente */}
      <div className="fixed inset-0 bg-black bg-opacity-500" aria-hidden="true"></div>
      
      {/* Modal */}
      <div className="bg-[#131a2d] border border-[#222a45] rounded-lg shadow-xl w-full max-w-md p-6 z-10 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Iniciar sesión</h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-gray-400 hover:text-white"
            aria-label="Cerrar"
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
              className="bg-[#0a1020] text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500"
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
              className="bg-[#0a1020] text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 bg-[#0a1020] border-gray-600 focus:ring-red-500"
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