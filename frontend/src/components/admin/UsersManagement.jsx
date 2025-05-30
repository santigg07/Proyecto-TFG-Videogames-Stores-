// src/components/admin/UsersManagement.jsx
import React, { useState, useEffect } from 'react';
import UsersList from './UsersList';
import UserForm from './UserForm';
import ConfirmationModal from '../ui/ConfirmationModal';
import { 
  toastUserCreated, 
  toastUserUpdated, 
  toastUserDeleted, 
  toastUserError,
  toastUserCannotDeleteSelf,
  toastValidationError 
} from '../../utils/toast';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    verified: '',
    page: 1
  });

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar usuarios cuando cambien los filtros
  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadCurrentUser(),
        loadRoles(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toastUserError('fetch', error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData.id);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/admin/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.data || data || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.verified) params.append('verified', filters.verified);
      params.append('page', filters.page);
      params.append('per_page', 10);

      const response = await fetch(`http://localhost:8000/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
        setPagination(data);
      } else {
        throw new Error('Error al cargar los usuarios');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toastUserError('fetch', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('auth_token');
      const isEditing = !!editingUser;
      
      const url = isEditing 
        ? `http://localhost:8000/api/admin/users/${editingUser.id}`
        : 'http://localhost:8000/api/admin/users';
      
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
          toastUserUpdated(responseData.data?.name || editingUser.name);
        } else {
          toastUserCreated(responseData.data?.name || 'el usuario');
        }

        // Cerrar formulario y recargar datos
        setShowForm(false);
        setEditingUser(null);
        await loadUsers();
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
      toastUserError(editingUser ? 'update' : 'create', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteClick = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    // Verificar si es el usuario actual
    if (userToDelete.id === currentUserId) {
      toastUserCannotDeleteSelf();
      setShowDeleteModal(false);
      setUserToDelete(null);
      return;
    }

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`http://localhost:8000/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Mostrar toast de éxito
        toastUserDeleted(userToDelete.name);
        
        // Cerrar modal y recargar datos
        setShowDeleteModal(false);
        setUserToDelete(null);
        await loadUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toastUserError('delete', error);
      
      // Cerrar modal
      setShowDeleteModal(false);
      setUserToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
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
      role: '',
      verified: '',
      page: 1
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-gray-400 mt-1">
            {pagination.total || users.length} usuarios en total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Agregar Usuario</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Filtros de búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda por nombre/email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar usuarios
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              placeholder="Nombre o email..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Filtro por rol */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filtrar por rol
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange({ role: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Todos los roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.name}>
                  {role.name === 'admin' ? 'Administradores' : 'Clientes'}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por verificación */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado de verificación
            </label>
            <select
              value={filters.verified}
              onChange={(e) => handleFilterChange({ verified: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Todos</option>
              <option value="verified">Verificados</option>
              <option value="unverified">No verificados</option>
            </select>
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

      {/* Lista de usuarios */}
      <div className=" rounded-lg shadow overflow-hidden">
        <UsersList
          users={users}
          pagination={pagination}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onPageChange={handlePageChange}
          loading={loading}
          currentUserId={currentUserId}
        />
      </div>

      {/* Formulario modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          roles={roles}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          isLoading={formLoading}
          currentUserId={currentUserId}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={userToDelete?.id === currentUserId ? "No se puede eliminar" : "Eliminar Usuario"}
        message={
          userToDelete?.id === currentUserId 
            ? "No puedes eliminar tu propia cuenta de administrador. Pide a otro administrador que lo haga si es necesario."
            : `¿Estás seguro de que quieres eliminar al usuario "${userToDelete?.name}"? Esta acción no se puede deshacer y se perderán todos sus datos.`
        }
        confirmText={userToDelete?.id === currentUserId ? "Entendido" : "Eliminar"}
        cancelText={userToDelete?.id === currentUserId ? "" : "Cancelar"}
        type={userToDelete?.id === currentUserId ? "warning" : "danger"}
        isLoading={deleteLoading}
        item={userToDelete ? {
          name: userToDelete.name,
          email: userToDelete.email,
          description: `Rol: ${userToDelete.role?.name === 'admin' ? 'Administrador' : 'Cliente'}${userToDelete.id === currentUserId ? ' • Tu cuenta' : ''}`
        } : null}
      />
    </div>
  );
}