// src/components/auth/LoginModal.jsx
import React, { useState, useEffect } from 'react';

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Escuchar eventos para abrir/cerrar el modal
  useEffect(() => {
    function handleToggleModal() {
      setIsOpen(prevState => !prevState);
      
      // Importante: manejar el overflow del body para evitar el scroll
      if (!isOpen) {
        document.body.style.overflow = "visible"; // Permitir scroll en el fondo
      } else {
        document.body.style.overflow = "visible"; // Permitir scroll en el fondo
      }
      
      if (!isOpen) setError(null);
    }

    document.addEventListener('toggle-login-modal', handleToggleModal);
    document.addEventListener('open-login-modal', () => {
      setIsOpen(true);
      document.body.style.overflow = "visible"; // Permitir scroll en el fondo
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('open-login') === 'true') {
      setIsOpen(true);
      document.body.style.overflow = "visible"; // Permitir scroll en el fondo
    }

    return () => {
      document.removeEventListener('toggle-login-modal', handleToggleModal);
      document.removeEventListener('open-login-modal', () => setIsOpen(true));
      document.body.style.overflow = "visible"; // Restaurar al desmontar
    };
  }, [isOpen]);

  // Cerrar modal al hacer clic fuera
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      document.body.style.overflow = "visible"; // Restaurar al cerrar
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

  // Estilo del modal como cadena para aplicarlo directamente como en el original
  const modalStyles = {
    modal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      width: '90%',
      maxWidth: '400px',
      backgroundColor: '#131a2d',
      border: '1px solid #222a45',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'all',
    }
  };

  return (
    <>
      {/* Overlay como un div separado con estilos inline */}
      <div 
        style={modalStyles.overlay} 
        onClick={handleOverlayClick} 
        aria-hidden="true"
      />
      
      {/* Modal como un div separado con estilos inline */}
      <div style={modalStyles.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Iniciar sesión</h2>
          <button 
            onClick={() => {
              setIsOpen(false);
              document.body.style.overflow = "visible";
            }}
            style={{ background: 'none', border: 'none', color: '#999', fontSize: '24px', cursor: 'pointer' }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: 'rgba(220, 38, 38, 0.2)', 
            border: '1px solid #dc2626', 
            color: '#fee2e2', 
            padding: '8px 16px', 
            borderRadius: '4px', 
            marginBottom: '16px' 
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label 
              htmlFor="email" 
              style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '14px' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                backgroundColor: '#0a1020', 
                border: '1px solid #222a45', 
                borderRadius: '4px', 
                color: 'white'
              }}
              required
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label 
              htmlFor="password" 
              style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '14px' }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                backgroundColor: '#0a1020', 
                border: '1px solid #222a45', 
                borderRadius: '4px', 
                color: 'white'
              }}
              required
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: '6px' }}
              />
              <label 
                htmlFor="remember_me" 
                style={{ color: '#ccc', fontSize: '14px' }}
              >
                Recordarme
              </label>
            </div>
            <a 
              href="/forgot-password" 
              style={{ color: '#a32b26', fontSize: '14px', textDecoration: 'none' }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#a32b26',
              color: 'white',
              padding: '10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '8px',
              opacity: isLoading ? '0.7' : '1'
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '8px', color: '#999', fontSize: '14px' }}>
            ¿No tienes una cuenta? 
            <a 
              href="/register" 
              style={{ color: '#a32b26', textDecoration: 'none', marginLeft: '4px' }}
            >
              Regístrate
            </a>
          </div>
        </form>
      </div>
    </>
  );
}