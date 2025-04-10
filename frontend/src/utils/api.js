// src/utils/api.js

const API_URL = 'http://localhost:8000/api'; // Ajusta a la URL de tu backend Laravel

// Obtener información de una consola específica
export async function getConsole(slug) {
  try {
    const response = await fetch(`${API_URL}/consoles/${slug}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching console:', error);
    throw error;
  }
}

// Obtener juegos por consola
export async function getGamesByConsole(consoleSlug, page = 1) {
  try {
    const response = await fetch(`${API_URL}/games/console/${consoleSlug}?page=${page}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching games by console:', error);
    throw error;
  }
}

// Obtener detalles de un juego específico
export async function getGameDetails(slug) {
  try {
    const response = await fetch(`${API_URL}/games/${slug}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching game details:', error);
    throw error;
  }
}

// Más funciones según necesidades...