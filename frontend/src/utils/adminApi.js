// src/utils/adminApi.js
const API_URL = 'http://localhost:8000/api';

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        throw new Error('No hay token de autenticación');
    }
    
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    };
};

// FUNCIONES DE ADMINISTRACIÓN DE JUEGOS

// Obtener datos para formularios (consolas y categorías)
export async function getFormData() {
    try {
        console.log('Solicitando datos del formulario...');
        const response = await fetch(`${API_URL}/admin/games/form-data`, {
            headers: getAuthHeaders()
        });
        
        console.log('Respuesta del servidor:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Datos del formulario recibidos:', data);
        return data;
    } catch (error) {
        console.error('Error fetching form data:', error);
        throw error;
    }
}

// Obtener todos los juegos para administración
export async function getAdminGames(params = {}) {
    try {
        const searchParams = new URLSearchParams();
        
        // Añadir parámetros de búsqueda
        if (params.page) searchParams.append('page', params.page);
        if (params.per_page) searchParams.append('per_page', params.per_page);
        if (params.search) searchParams.append('search', params.search);
        if (params.console_id) searchParams.append('console_id', params.console_id);
        if (params.sort_by) searchParams.append('sort_by', params.sort_by);
        if (params.sort_order) searchParams.append('sort_order', params.sort_order);
        
        const url = `${API_URL}/admin/games?${searchParams.toString()}`;
        console.log('Fetching games from:', url);
        
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching admin games:', error);
        throw error;
    }
}

// Crear nuevo juego
export async function createGame(formData) {
    try {
        console.log('Creando juego...');
        const response = await fetch(`${API_URL}/admin/games`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Accept': 'application/json'
                // NO incluir Content-Type para FormData
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating game:', errorData);
            throw new Error(errorData.message || 'Error al crear el juego');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating game:', error);
        throw error;
    }
}

// Actualizar juego existente
export async function updateGame(gameId, formData) {
    try {
        console.log('Actualizando juego:', gameId);
        
        // Añadir _method para simular PUT con FormData
        formData.append('_method', 'PUT');
        
        const response = await fetch(`${API_URL}/admin/games/${gameId}`, {
            method: 'POST', // Usar POST con _method para FormData
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Accept': 'application/json'
                // NO incluir Content-Type para FormData
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error updating game:', errorData);
            throw new Error(errorData.message || 'Error al actualizar el juego');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating game:', error);
        throw error;
    }
}

// Eliminar juego
export async function deleteGame(gameId) {
    try {
        const response = await fetch(`${API_URL}/admin/games/${gameId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting game:', error);
        throw error;
    }
}

// Obtener un juego específico
export async function getAdminGame(gameId) {
    try {
        const response = await fetch(`${API_URL}/admin/games/${gameId}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching admin game:', error);
        throw error;
    }
}

// Verificar autenticación de administrador
export async function checkAdminAuth() {
    try {
        const token = localStorage.getItem('auth_token');
        const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
        
        if (!token || !user || user.role_id !== 1) {
            return false;
        }
        
        // Verificar que el token sigue siendo válido
        const response = await fetch(`${API_URL}/user`, {
            headers: getAuthHeaders()
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error checking admin auth:', error);
        return false;
    }
}