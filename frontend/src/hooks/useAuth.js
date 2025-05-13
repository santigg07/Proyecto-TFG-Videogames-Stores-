// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Verificar estado de autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include' // Incluir cookies
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
      }
    };
    
    checkAuth();
  }, []);
  
  // Función de login
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Primero obtener el token CSRF si usas Laravel Sanctum
      await fetch('/sanctum/csrf-cookie', {
        credentials: 'include'
      });
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }
      
      setUser(data.user);
      return data.user;
    } catch (err) {
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
      // Primero obtener el token CSRF si usas Laravel Sanctum
      await fetch('/sanctum/csrf-cookie', {
        credentials: 'include'
      });
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse');
      }
      
      setUser(data.user);
      
      // Redirigir al usuario a la página de inicio
      window.location.href = '/';
      
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
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      
      // Redirigir al usuario a la página de inicio
      window.location.href = '/';
    } catch (err) {
      console.error('Error during logout:', err);
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
    isAuthenticated: !!user
  };
}