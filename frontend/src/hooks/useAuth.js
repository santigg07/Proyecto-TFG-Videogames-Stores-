// src/hooks/useAuth.js
import { useState, useEffect, useRef } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Referencias para controlar las peticiones
  const isCheckingRef = useRef(false);
  const lastCheckTime = useRef(0);
  const pendingCheck = useRef(null);
  
  // Duración mínima entre verificaciones: 30 segundos
  const MIN_CHECK_INTERVAL = 30 * 1000;

  // Función para limpiar la autenticación
  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_last_check');
    setUser(null);
    setIsAuthenticated(false);
    
    document.dispatchEvent(new CustomEvent('auth-state-changed', {
      detail: { authenticated: false }
    }));
  };

  // Verificar autenticación solo localmente (sin peticiones)
  const checkAuthLocal = () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');
    
    if (!token || !userData) {
      clearAuth();
      return false;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAuthenticated(true);
      
      document.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { authenticated: true, user: parsedUser }
      }));
      return true;
    } catch (err) {
      console.error('Error parsing user data:', err);
      clearAuth();
      return false;
    }
  };

  // Verificar con servidor con throttling agresivo
  const verifyWithServer = async (force = false) => {
    const now = Date.now();
    const lastCheck = parseInt(localStorage.getItem('auth_last_check') || '0');
    
    // REGLA ESTRICTA: Solo verificar si han pasado más de 30 segundos O si es forzado
    if (!force && (now - lastCheck) < MIN_CHECK_INTERVAL) {
      console.log('Verificación omitida - muy pronto desde la última');
      return;
    }
    
    // Solo permitir una verificación a la vez
    if (isCheckingRef.current) {
      console.log('Verificación ya en progreso');
      return;
    }
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      clearAuth();
      return;
    }

    isCheckingRef.current = true;
    console.log('Verificando con servidor...');

    try {
      const response = await fetch('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('auth_last_check', now.toString());
        
        setUser(userData);
        setIsAuthenticated(true);
        
        document.dispatchEvent(new CustomEvent('auth-state-changed', {
          detail: { authenticated: true, user: userData }
        }));
        
        console.log('Verificación exitosa');
      } else if (response.status === 401) {
        console.log('Token inválido, limpiando sesión');
        clearAuth();
      }
    } catch (err) {
      console.error('Error verificando con servidor:', err);
      // Mantener estado local en caso de error de red
    } finally {
      isCheckingRef.current = false;
    }
  };

  // Inicialización - solo verificar localmente
  useEffect(() => {
    if (checkAuthLocal()) {
      setIsInitialized(true);
      
      // Verificar con servidor solo si han pasado más de 30 segundos
      const lastCheck = parseInt(localStorage.getItem('auth_last_check') || '0');
      const now = Date.now();
      
      if ((now - lastCheck) > MIN_CHECK_INTERVAL) {
        setTimeout(() => verifyWithServer(), 2000); // Delay de 2 segundos
      }
    } else {
      setIsInitialized(true);
    }

    // Limpiar cualquier verificación pendiente al desmontar
    return () => {
      if (pendingCheck.current) {
        clearTimeout(pendingCheck.current);
      }
    };
  }, []);

  // Función de login
  const login = async (email, password) => {
    console.log("Iniciando login...");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar datos y marcar última verificación
      const now = Date.now();
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_last_check', now.toString());
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Disparar eventos
      document.dispatchEvent(new CustomEvent('user-logged-in', { 
        detail: { user: data.user } 
      }));
      
      document.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { authenticated: true, user: data.user }
      }));
      
      document.dispatchEvent(new CustomEvent('login-success'));
      
      return data.user;
    } catch (err) {
      console.error("Error durante login:", err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de registro
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const registerData = {
        ...userData,
        password_confirmation: userData.password_confirmation || userData.passwordConfirmation
      };

      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('. ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Error al registrarse');
      }

      // Guardar datos
      const now = Date.now();
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_last_check', now.toString());
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      document.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { authenticated: true, user: data.user }
      }));
      
      return data.user;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }
      
      clearAuth();
    } catch (err) {
      console.error('Error durante logout:', err);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    isInitialized
  };
}