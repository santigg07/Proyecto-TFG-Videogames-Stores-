// src/components/admin/CategoriesList.jsx
import React from 'react';

export default function CategoriesList({ 
    categories, 
    pagination, 
    onEdit, 
    onDelete, 
    onPageChange, 
    loading 
}) {
    if (loading && categories.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-400">Cargando categorías...</p>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-600">
                    <i className="fas fa-tags text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No hay categorías</h3>
                <p className="text-gray-400">No se encontraron categorías que coincidan con los filtros aplicados.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Header de la tabla */}
            <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">
                    Lista de Categorías ({pagination?.total || categories.length})
                </h3>
            </div>

            {/* Tabla para desktop */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Categoría
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Slug
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Juegos
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Fecha Creación
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                            <i className="fas fa-tag text-white text-sm"></i>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-white">
                                                {category.name}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">
                                        {category.slug}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/20 text-blue-400">
                                        {category.games_count || 0} juegos
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">
                                        {category.created_at ? new Date(category.created_at).toLocaleDateString('es-ES') : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => onEdit(category)}
                                            className="text-blue-400 hover:text-blue-300 p-1"
                                            title="Editar"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => onDelete(category.id)}
                                            className="text-red-400 hover:text-red-300 p-1"
                                            title="Eliminar"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Vista móvil */}
            <div className="md:hidden">
                {categories.map((category) => (
                    <div key={category.id} className="border-b border-gray-700 p-4 hover:bg-gray-700/50">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                <i className="fas fa-tag text-white"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-medium text-white truncate">
                                            {category.name}
                                        </h4>
                                        <p className="text-xs text-gray-400">{category.slug}</p>
                                        <p className="text-xs text-gray-500">
                                            {category.created_at ? new Date(category.created_at).toLocaleDateString('es-ES') : '-'}
                                        </p>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => onEdit(category)}
                                            className="text-blue-400 hover:text-blue-300 p-2"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => onDelete(category.id)}
                                            className="text-red-400 hover:text-red-300 p-2"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/20 text-blue-400">
                                        {category.games_count || 0} juegos
                                    </span>
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