// src/components/admin/GamesManagement.jsx
import React, { useState, useEffect } from 'react';
import GamesList from './GamesList';
import GameForm from './GameForm';
import DeleteModal from '../ui/DeleteModal';
import { 
  toastGameCreated, 
  toastGameUpdated, 
  toastGameDeleted, 
  toastGameError,
  toastValidationError 
} from '../../utils/toast';
import { getImageUrl } from '../../utils/apiConfig';

export default function GamesManagement() {
  const [games, setGames] = useState([]);
  const [consoles, setConsoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    console_id: '',
    page: 1
  });

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar juegos cuando cambien los filtros
  useEffect(() => {
    loadGames();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadConsoles(),
        loadCategories(),
        loadGames()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toastGameError('fetch', error);
    }
  };

  const loadGames = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.console_id) params.append('console_id', filters.console_id);
      params.append('page', filters.page);
      params.append('per_page', 10);

      const response = await fetch(`http://localhost:8000/api/admin/games?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGames(data.data || []);
        setPagination(data);
      } else {
        throw new Error('Error al cargar los juegos');
      }
    } catch (error) {
      console.error('Error loading games:', error);
      toastGameError('fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConsoles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/admin/consoles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConsoles(data.data || data || []);
      }
    } catch (error) {
      console.error('Error loading consoles:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toastGameError('auth', new Error('No estás autenticado'));
        window.location.href = '/?showLogin=true';
        return;
      }
      
      const isEditing = !!editingGame;
      
      const url = isEditing 
        ? `http://localhost:8000/api/admin/games/${editingGame.id}`
        : 'http://localhost:8000/api/admin/games';
      
      const method = isEditing ? 'POST' : 'POST';
      
      // Si estamos editando, agregar _method para Laravel
      if (isEditing) {
        formData.append('_method', 'PUT');
      }

      console.log('Enviando petición a:', url);
      console.log('Método:', method);
      console.log('Token:', token.substring(0, 20) + '...');

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      console.log('Response status:', response.status);

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        // Mostrar toast de éxito
        if (isEditing) {
          toastGameUpdated(responseData.game?.name || editingGame.name);
        } else {
          toastGameCreated(responseData.game?.name || 'el juego');
        }

        // Cerrar formulario y recargar datos
        setShowForm(false);
        setEditingGame(null);
        await loadGames();
      } else {
        // Manejar errores de validación
        if (response.status === 422 && responseData.errors) {
          const firstError = Object.values(responseData.errors)[0][0];
          toastValidationError(firstError);
        } else if (response.status === 401) {
          toastGameError('auth', new Error('No autorizado'));
          window.location.href = '/?showLogin=true';
        } else if (response.status === 403) {
          toastGameError('auth', new Error('No tienes permisos de administrador'));
        } else {
          throw new Error(responseData.message || responseData.error || 'Error en la operación');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toastGameError(editingGame ? 'update' : 'create', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setShowForm(true);
  };

  const handleDeleteClick = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      setGameToDelete(game);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:8000/api/admin/games/${gameToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Mostrar toast de éxito
        toastGameDeleted(gameToDelete.name);
        
        // Cerrar modal y recargar datos
        setShowDeleteModal(false);
        setGameToDelete(null);
        await loadGames();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el juego');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      toastGameError('delete', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setGameToDelete(null);
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      console_id: '',
      page: 1
    });
  };

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Juegos</h1>
          <p className="text-gray-400 mt-1">
            {pagination.total || games.length} juegos en total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGame(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Agregar Juego</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Filtros de búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar juegos
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              placeholder="Nombre del juego..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por consola */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filtrar por consola
            </label>
            <select
              value={filters.console_id}
              onChange={(e) => handleFilterChange({ console_id: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las consolas</option>
              {consoles.map(console => (
                <option key={console.id} value={console.id}>
                  {console.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de juegos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <GamesList
          games={games}
          pagination={pagination}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>

      {/* Formulario modal */}
      {showForm && (
        <GameForm
          game={editingGame}
          consoles={consoles}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingGame(null);
          }}
          isLoading={formLoading}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Juego"
        message="¿Estás seguro de que quieres eliminar este juego? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={deleteLoading}
        item={gameToDelete ? {
          name: gameToDelete.name,
          console: gameToDelete.console,
          price: gameToDelete.price,
          image: getImageUrl(gameToDelete.image)
        } : null}
      />
    </div>
  );
}