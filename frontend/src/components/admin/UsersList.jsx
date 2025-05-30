// src/components/admin/UsersList.jsx
import React from 'react';

export default function UsersList({ 
    users, 
    pagination, 
    onEdit, 
    onDelete, 
    onPageChange, 
    loading,
    currentUserId // Para evitar que el admin se elimine a sí mismo
}) {
    const getRoleBadge = (role) => {
        if (role?.name === 'admin') {
            return (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-900/20 text-red-400">
                    <i className="fas fa-crown mr-1"></i>
                    Administrador
                </span>
            );
        }
        return (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/20 text-blue-400">
                <i className="fas fa-user mr-1"></i>
                Cliente
            </span>
        );
    };

    const getStatusBadge = (emailVerified) => {
        if (emailVerified) {
            return (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900/20 text-green-400">
                    <i className="fas fa-check-circle mr-1"></i>
                    Verificado
                </span>
            );
        }
        return (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/20 text-yellow-400">
                <i className="fas fa-clock mr-1"></i>
                Pendiente
            </span>
        );
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    if (loading && users.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-400">Cargando usuarios...</p>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-600">
                    <i className="fas fa-users text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No hay usuarios</h3>
                <p className="text-gray-400">No se encontraron usuarios que coincidan con los filtros aplicados.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Header de la tabla */}
            <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">
                    Lista de Usuarios ({pagination?.total || users.length})
                </h3>
            </div>

            {/* Tabla para desktop */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Registro
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {getInitials(user.name)}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-white">
                                                {user.name}
                                                {user.id === currentUserId && (
                                                    <span className="ml-2 text-xs text-blue-400">(Tú)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getRoleBadge(user.role)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(user.email_verified_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="text-blue-400 hover:text-blue-300 p-1"
                                            title="Editar"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        {user.id !== currentUserId && (
                                            <button
                                                onClick={() => onDelete(user.id)}
                                                className="text-red-400 hover:text-red-300 p-1"
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Vista móvil */}
            <div className="md:hidden">
                {users.map((user) => (
                    <div key={user.id} className="border-b border-gray-700 p-4 hover:bg-gray-700/50">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {getInitials(user.name)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-medium text-white truncate">
                                            {user.name}
                                            {user.id === currentUserId && (
                                                <span className="ml-2 text-xs text-blue-400">(Tú)</span>
                                            )}
                                        </h4>
                                        <p className="text-sm text-gray-400 truncate">{user.email}</p>
                                        <p className="text-xs text-gray-500">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '-'}
                                        </p>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="text-blue-400 hover:text-blue-300 p-2"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        {user.id !== currentUserId && (
                                            <button
                                                onClick={() => onDelete(user.id)}
                                                className="text-red-400 hover:text-red-300 p-2"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center space-x-2">
                                    {getRoleBadge(user.role)}
                                    {getStatusBadge(user.email_verified_at)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Paginación */}
            {pagination && pagination.last_page > 1 && (
                <div className="bg-gray-900 px-6 py-3 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a{' '}
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de{' '}
                        {pagination.total} resultados
                    </div>
                    <div className="flex items-center space-x-1">
                        {/* Botón anterior */}
                        <button
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="px-3 py-1 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        
                        {/* Números de página */}
                        {(() => {
                            const current = pagination.current_page;
                            const total = pagination.last_page;
                            const pages = [];

                            if (total <= 7) {
                                for (let i = 1; i <= total; i++) {
                                    pages.push(i);
                                }
                            } else {
                                pages.push(1);
                                
                                if (current > 4) {
                                    pages.push('...');
                                }
                                
                                const start = Math.max(2, current - 1);
                                const end = Math.min(total - 1, current + 1);
                                
                                for (let i = start; i <= end; i++) {
                                    if (!pages.includes(i)) {
                                        pages.push(i);
                                    }
                                }
                                
                                if (current < total - 3) {
                                    pages.push('...');
                                }
                                
                                if (!pages.includes(total)) {
                                    pages.push(total);
                                }
                            }

                            return pages.map((page, index) => {
                                if (page === '...') {
                                    return (
                                        <span 
                                            key={`ellipsis-${index}`} 
                                            className="px-3 py-1 text-sm text-gray-500"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                const isCurrentPage = page === current;
                                
                                return (
                                    <button
                                        key={page}
                                        onClick={() => onPageChange(page)}
                                        className={`px-3 py-1 text-sm font-medium rounded ${
                                            isCurrentPage
                                                ? 'bg-red-600 text-white'
                                                : 'text-white bg-gray-700 hover:bg-gray-600'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            });
                        })()}
                        
                        {/* Botón siguiente */}
                        <button
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                            className="px-3 py-1 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}