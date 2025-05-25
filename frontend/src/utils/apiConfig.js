// src/utils/apiConfig.js

// Configuración base de la API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  API_URL: 'http://localhost:8000/api',
  STORAGE_URL: 'http://localhost:8000/storage'
};

// Función para obtener URLs de imágenes
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.jpg';
  
  // Si ya incluye el dominio completo, devolverlo tal como está
  if (imagePath.startsWith('http')) return imagePath;
  
  // Si empieza con /storage/, usar la URL del backend
  if (imagePath.startsWith('/storage/')) {
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  }
  
  // Si no tiene /storage/, agregarlo
  return `${API_CONFIG.STORAGE_URL}/${imagePath}`;
};

// Función para construir URLs de API
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.API_URL}${endpoint}`;
};

// Headers por defecto para las peticiones
export const getApiHeaders = (includeAuth = true) => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (includeAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Headers para peticiones con archivos (FormData)
export const getFileUploadHeaders = (includeAuth = true) => {
  const headers = {
    'Accept': 'application/json'
    // No incluir Content-Type para FormData, el navegador lo establecerá automáticamente
  };

  if (includeAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};