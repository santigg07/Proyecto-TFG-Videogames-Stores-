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

// NUEVAS FUNCIONES PARA EL CATÁLOGO

// Obtener todos los juegos con filtros y ordenación
export async function getCatalog({
  page = 1,
  perPage = 12,
  consoleId = null,
  categoryId = null,
  minPrice = null,
  maxPrice = null,
  condition = null,
  inStock = null,
  releaseYear = null,
  sortBy = 'created_at',
  sortOrder = 'desc',
  search = null
} = {}) {
  try {
    let url = new URL(`${API_URL}/games`);
    
    // Añadir parámetros de paginación
    url.searchParams.append('page', page);
    url.searchParams.append('per_page', perPage);
    
    // Añadir parámetros de filtro si están definidos
    if (consoleId) url.searchParams.append('console_id', consoleId);
    if (categoryId) url.searchParams.append('category_id', categoryId);
    if (minPrice) url.searchParams.append('min_price', minPrice);
    if (maxPrice) url.searchParams.append('max_price', maxPrice);
    if (condition) url.searchParams.append('condition', condition);
    if (inStock !== null) url.searchParams.append('in_stock', inStock ? '1' : '0');
    if (releaseYear) url.searchParams.append('release_year', releaseYear);
    if (search) url.searchParams.append('search', search);
    
    // Añadir parámetros de ordenación
    url.searchParams.append('sort_by', sortBy);
    url.searchParams.append('sort_order', sortOrder);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching catalog:', error);
    throw error;
  }
}

// Obtener todas las categorías
export async function getCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Obtener datos para los filtros (rango de precios, años, etc.)
export async function getFilterData() {
  try {
    const response = await fetch(`${API_URL}/games/filter-data`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching filter data:', error);
    throw error;
  }
}

// Buscar juegos con autocompletado
export async function searchGames(query) {
  try {
    const response = await fetch(`${API_URL}/games/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
}

// Obtener juegos recomendados
export async function getRecommendedGames(limit = 4) {
  try {
    const response = await fetch(`${API_URL}/games/recommended?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommended games:', error);
    throw error;
  }
}

// Obtener los juegos más vendidos
export async function getBestSellingGames(limit = 4) {
  try {
    const response = await fetch(`${API_URL}/games/best-selling?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching best selling games:', error);
    throw error;
  }
}