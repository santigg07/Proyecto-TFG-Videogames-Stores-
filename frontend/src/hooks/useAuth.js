// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para limpiar la autenticación
  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires_at');
    setUser(null);
    setIsAuthenticated(false);
    
    // Disparar evento de cambio de estado
    document.dispatchEvent(new CustomEvent('auth-state-changed', {
      detail: { authenticated: false }
    }));
  };

  // Verificar el estado de autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const expiresAt = localStorage.getItem('auth_expires_at');
      
      // Si no hay token o ha expirado
      if (!token || (expiresAt && new Date().getTime() > parseInt(expiresAt))) {
        clearAuth();
        return;
      }

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
          setUser(userData);
          setIsAuthenticated(true);
          
          // Disparar evento de cambio de estado
          document.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { authenticated: true, user: userData }
          }));
        } else {
          clearAuth();
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
        clearAuth();
      }
    };

    checkAuth();
  }, []);

  // Función de login
  const login = async (email, password) => {
    console.log("Iniciando login con:", { email, password: "***" });
    setIsLoading(true);
    setError(null);

    try {
      console.log("Haciendo petición a la API...");
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log("Respuesta recibida:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log("Datos de respuesta:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar token y datos del usuario con nuevo formato
      console.log("Guardando token y datos de usuario...");
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      // Establecer expiración en 8 horas
      const expiresAt = new Date().getTime() + (8 * 60 * 60 * 1000);
      localStorage.setItem('auth_expires_at', expiresAt.toString());
      
      console.log("Token y usuario guardados en localStorage");
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Disparar eventos
      console.log("Disparando eventos de login exitoso");
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
      console.log("Proceso de login finalizado");
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

      // Guardar token y datos del usuario
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      const expiresAt = new Date().getTime() + (8 * 60 * 60 * 1000);
      localStorage.setItem('auth_expires_at', expiresAt.toString());
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Disparar eventos
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
      clearAuth(); // Limpiar datos localmente aunque falle la petición
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
    isAuthenticated
  };
}