// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar el estado de autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token inválido o expirado
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
      }
    };

    checkAuth();
  }, []);

  // Función de login
  // Añade esto al inicio de tu función de login en useAuth.js para depurar
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

      // Guardar token y datos del usuario
      console.log("Guardando token y datos de usuario...");
      localStorage.setItem('token', data.token);
      console.log("Token guardado en localStorage");
      
      // IMPORTANTE: También guardar el usuario completo en localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log("Usuario guardado en localStorage:", data.user);
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Disparar evento de login
      console.log("Disparando evento user-logged-in");
      document.dispatchEvent(new CustomEvent('user-logged-in', { 
        detail: { user: data.user } 
      }));
      
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
      // Preparar datos para el backend
      // El backend espera password_confirmation
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
        // Si hay errores de validación
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('. ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Error al registrarse');
      }

      // Guardar token y datos del usuario
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
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
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }
      
      // Limpiar datos de autenticación
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Error durante logout:', err);
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