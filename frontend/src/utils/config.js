// src/utils/config.js
export const API_CONFIG = {
  BASE_URL: 'http://backend:8000/api',
  ENDPOINTS: {
    GAMES: '/admin/games',
    CONSOLES: '/consoles',
    CATEGORIES: '/categories',
    IMAGES: '/admin/games/:gameId/images/:imageId'
  }
};

export const getApiUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Reemplazar parámetros en la URL
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};