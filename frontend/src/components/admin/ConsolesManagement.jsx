// src/components/admin/ConsolesManagement.jsx
import React, { useState, useEffect } from 'react';
import ConsolesList from './ConsolesList';
import ConsoleForm from './ConsoleForm';
import ConfirmationModal from '../ui/ConfirmationModal';
import { 
  toastConsoleCreated, 
  toastConsoleUpdated, 
  toastConsoleDeleted, 
  toastConsoleError,
  toastConsoleCannotDelete,
  toastValidationError 
} from '../../utils/toast';
import { getImageUrl } from '../../utils/apiConfig';

export default function ConsolesManagement() {
  const [consoles, setConsoles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConsole, setEditingConsole] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    manufacturer: '',
    page: 1
  });

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [consoleToDelete, setConsoleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadConsoles();
  }, [filters]);

  const loadConsoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.manufacturer) params.append('manufacturer', filters.manufacturer);
      params.append('page', filters.page);
      params.append('per_page', 10);

      const response = await fetch(`http://localhost:8000/api/admin/consoles?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConsoles(data.data || []);
        setPagination(data);
      } else {
        throw new Error('Error al cargar las consolas');
      }
    } catch (error) {
      console.error('Error loading consoles:', error);
      toastConsoleError('fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('auth_token');
      const isEditing = !!editingConsole;
      
      const url = isEditing 
        ? `http://localhost:8000/api/admin/consoles/${editingConsole.id}`
        : 'http://localhost:8000/api/admin/consoles';
      
      const method = 'POST';
      
      // Si estamos editando, agregar _method para Laravel
      if (isEditing) {
        formData.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      const responseData = await response.json();

      if (response.ok) {
        // Mostrar toast de éxito
        if (isEditing) {
          toastConsoleUpdated(responseData.data?.name || editingConsole.name);
        } else {
          toastConsoleCreated(responseData.data?.name || 'la consola');
        }

        // Cerrar formulario y recargar datos
        setShowForm(false);
        setEditingConsole(null);
        await loadConsoles();
      } else {
        // Manejar errores de validación
        if (response.status === 422 && responseData.errors) {
          const firstError = Object.values(responseData.errors)[0][0];
          toastValidationError(firstError);
        } else {
          throw new Error(responseData.message || 'Error en la operación');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toastConsoleError(editingConsole ? 'update' : 'create', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (console) => {
    setEditingConsole(console);
    setShowForm(true);
  };

  const handleDeleteClick = (consoleId) => {
    const console = consoles.find(c => c.id === consoleId);
    if (console) {
      setConsoleToDelete(console);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!consoleToDelete) return;

    // Verificar si la consola tiene juegos asociados antes de eliminar
    if (consoleToDelete.games_count > 0) {
      toastConsoleCannotDelete(consoleToDelete.name, consoleToDelete.games_count);
      setShowDeleteModal(false);
      setConsoleToDelete(null);
      return;
    }

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:8000/api/admin/consoles/${consoleToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Mostrar toast de éxito
        toastConsoleDeleted(consoleToDelete.name);
        
        // Cerrar modal y recargar datos
        setShowDeleteModal(false);
        setConsoleToDelete(null);
        await loadConsoles();
      } else {
        const errorData = await response.json();
        
        // Si el error es por juegos asociados
        if (response.status === 409) {
          toastConsoleCannotDelete(consoleToDelete.name, errorData.games_count || 0);
        } else {
          throw new Error(errorData.message || 'Error al eliminar la consola');
        }
        
        // Cerrar modal en cualquier caso
        setShowDeleteModal(false);
        setConsoleToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting console:', error);
      toastConsoleError('delete', error);
      
      // Cerrar modal
      setShowDeleteModal(false);
      setConsoleToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setConsoleToDelete(null);
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
      manufacturer: '',
      page: 1
    });
  };

  // Obtener fabricantes únicos para el filtro
  const uniqueManufacturers = [...new Set(consoles.map(c => c.manufacturer).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Consolas</h1>
          <p className="text-gray-400 mt-1">
            {pagination.total || consoles.length} consolas en total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingConsole(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Agregar Consola</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Filtros de búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar consolas
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              placeholder="Nombre de la consola..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por fabricante */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filtrar por fabricante
            </label>
            <select
              value={filters.manufacturer}
              onChange={(e) => handleFilterChange({ manufacturer: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los fabricantes</option>
              {uniqueManufacturers.map(manufacturer => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
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

      {/* Lista de consolas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ConsolesList
          consoles={consoles}
          pagination={pagination}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>

      {/* Formulario modal */}
      {showForm && (
        <ConsoleForm
          console={editingConsole}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingConsole(null);
          }}
          isLoading={formLoading}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={consoleToDelete?.games_count > 0 ? "No se puede eliminar" : "Eliminar Consola"}
        message={
          consoleToDelete?.games_count > 0 
            ? `No se puede eliminar la consola "${consoleToDelete?.name}" porque tiene ${consoleToDelete.games_count} juego${consoleToDelete.games_count === 1 ? '' : 's'} asociado${consoleToDelete.games_count === 1 ? '' : 's'}. Elimina primero los juegos o cambia su consola.`
            : "¿Estás seguro de que quieres eliminar esta consola? Esta acción no se puede deshacer."
        }
        confirmText={consoleToDelete?.games_count > 0 ? "Entendido" : "Eliminar"}
        cancelText={consoleToDelete?.games_count > 0 ? "" : "Cancelar"}
        type={consoleToDelete?.games_count > 0 ? "warning" : "danger"}
        isLoading={deleteLoading}
        item={consoleToDelete ? {
          name: consoleToDelete.name,
          manufacturer: consoleToDelete.manufacturer,
          image: getImageUrl(consoleToDelete.image),
          description: consoleToDelete.games_count > 0 ? `${consoleToDelete.games_count} juegos asociados` : ''
        } : null}
      />
    </div>
  );
}