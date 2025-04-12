// Este archivo contiene funciones para interactuar con la API de la aplicación
// y realizar operaciones como obtener consolas, juegos y detalles de juegos.
const API_URL = 'http://backend:8000/api';

// Obtener todas las consolas
export async function getConsoles() {
  try {
    const response = await fetch(`${API_URL}/consoles`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching consoles:', error);
    throw error;
  }
}

// Obtener una consola específica por su slug
export async function getConsole(slug) {
  try {
    console.log(`Fetching console with slug: ${slug}`);
    const response = await fetch(`${API_URL}/consoles/${slug}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
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
    console.log(`Fetching game details for: ${slug}`);
    const response = await fetch(`${API_URL}/games/${slug}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Game details received:", data);
    return data;
  } catch (error) {
    console.error('Error fetching game details:', error);
    throw error;
  }
}