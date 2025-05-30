// src/components/admin/CategoriesManagement.jsx
import React, { useState, useEffect } from 'react';
import CategoriesList from './CategoriesList';
import CategoryForm from './CategoryForm';
import ConfirmationModal from '../ui/ConfirmationModal';
import { 
  toastCategoryCreated, 
  toastCategoryUpdated, 
  toastCategoryDeleted, 
  toastCategoryError,
  toastCategoryCannotDelete,
  toastValidationError 
} from '../../utils/toast';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    page: 1
  });

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadCategories();
  }, [filters]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('per_page', 10);

      const response = await fetch(`http://localhost:8000/api/admin/categories?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
        setPagination(data);
      } else {
        throw new Error('Error al cargar las categorías');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toastCategoryError('fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('auth_token');
      const isEditing = !!editingCategory;
      
      const url = isEditing 
        ? `http://localhost:8000/api/admin/categories/${editingCategory.id}`
        : 'http://localhost:8000/api/admin/categories';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      if (response.ok) {
        // Mostrar toast de éxito
        if (isEditing) {
          toastCategoryUpdated(responseData.data?.name || editingCategory.name);
        } else {
          toastCategoryCreated(responseData.data?.name || 'la categoría');
        }

        // Cerrar formulario y recargar datos
        setShowForm(false);
        setEditingCategory(null);
        await loadCategories();
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
      toastCategoryError(editingCategory ? 'update' : 'create', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteClick = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setCategoryToDelete(category);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    // Verificar si la categoría tiene juegos asociados antes de eliminar
    if (categoryToDelete.games_count > 0) {
      toastCategoryCannotDelete(categoryToDelete.name, categoryToDelete.games_count);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      return;
    }

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:8000/api/admin/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Mostrar toast de éxito
        toastCategoryDeleted(categoryToDelete.name);
        
        // Cerrar modal y recargar datos
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        await loadCategories();
      } else {
        const errorData = await response.json();
        
        // Si el error es por juegos asociados
        if (response.status === 409) {
          toastCategoryCannotDelete(categoryToDelete.name, errorData.games_count || 0);
        } else {
          throw new Error(errorData.message || 'Error al eliminar la categoría');
        }
        
        // Cerrar modal en cualquier caso
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toastCategoryError('delete', error);
      
      // Cerrar modal
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
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
      page: 1
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Categorías</h1>
          <p className="text-gray-400 mt-1">
            {pagination.total || categories.length} categorías en total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Agregar Categoría</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Filtros de búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda por nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar categorías
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              placeholder="Nombre de la categoría..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-md transition-colors"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="rounded-lg shadow overflow-hidden">
        <CategoriesList
          categories={categories}
          pagination={pagination}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>

      {/* Formulario modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          isLoading={formLoading}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={categoryToDelete?.games_count > 0 ? "No se puede eliminar" : "Eliminar Categoría"}
        message={
          categoryToDelete?.games_count > 0 
            ? `No se puede eliminar la categoría "${categoryToDelete?.name}" porque tiene ${categoryToDelete.games_count} juego${categoryToDelete.games_count === 1 ? '' : 's'} asociado${categoryToDelete.games_count === 1 ? '' : 's'}. Elimina primero los juegos o cambia su categoría.`
            : "¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer."
        }
        confirmText={categoryToDelete?.games_count > 0 ? "Entendido" : "Eliminar"}
        cancelText={categoryToDelete?.games_count > 0 ? "" : "Cancelar"}
        type={categoryToDelete?.games_count > 0 ? "warning" : "danger"}
        isLoading={deleteLoading}
        item={categoryToDelete ? {
          name: categoryToDelete.name,
          description: `Slug: ${categoryToDelete.slug}${categoryToDelete.games_count > 0 ? ` • ${categoryToDelete.games_count} juegos asociados` : ''}`
        } : null}
      />
    </div>
  );
}