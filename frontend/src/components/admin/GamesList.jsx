// src/components/admin/GamesList.jsx
import React from 'react';
import { getImageUrl } from '../../utils/apiConfig';

export default function GamesList({ 
    games, 
    pagination, 
    onEdit, 
    onDelete, 
    onPageChange, 
    loading 
}) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    const getStockStatusColor = (stock) => {
        if (stock === 0) return 'text-red-600 bg-red-50';
        if (stock <= 5) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    const getStockStatusText = (stock) => {
        if (stock === 0) return 'Agotado';
        if (stock <= 5) return 'Stock bajo';
        return 'Disponible';
    };

    if (loading && games.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando juegos...</p>
            </div>
        );
    }

    if (games.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                    <i className="fas fa-gamepad text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay juegos</h3>
                <p className="text-gray-600">No se encontraron juegos que coincidan con los filtros aplicados.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header de la tabla */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                    Lista de Juegos ({pagination?.total || games.length})
                </h3>
            </div>

            {/* Tabla para desktop */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Juego
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Consola
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {games.map((game) => (
                            <tr key={game.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 flex-shrink-0">
                                            <img
                                                className="h-12 w-12 rounded object-cover"
                                                src={getImageUrl(game.image)}
                                                alt={game.name}
                                                
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {game.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {game.release_year}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{game.console?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {game.sale_price ? (
                                            <div>
                                                <span className="font-medium text-red-600">
                                                    {formatPrice(game.sale_price)}
                                                </span>
                                                <div className="text-xs text-gray-500 line-through">
                                                    {formatPrice(game.price)}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="font-medium">
                                                {formatPrice(game.price)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900">
                                        {game.stock} unidades
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(game.stock)}`}>
                                        {getStockStatusText(game.stock)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => onEdit(game)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                            title="Editar"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => onDelete(game.id)}
                                            className="text-red-600 hover:text-red-900 p-1"
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
                {games.map((game) => (
                    <div key={game.id} className="border-b border-gray-200 p-4">
                        <div className="flex items-start space-x-3">
                            <img
                                className="h-16 w-16 rounded object-cover flex-shrink-0"
                                src={getImageUrl(game.image)}
                                alt={game.name}
                               
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                            {game.name}
                                        </h4>
                                        <p className="text-sm text-gray-500">{game.console?.name}</p>
                                        <p className="text-sm text-gray-500">{game.release_year}</p>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => onEdit(game)}
                                            className="text-blue-600 hover:text-blue-900 p-2"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => onDelete(game.id)}
                                            className="text-red-600 hover:text-red-900 p-2"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <div>
                                        {game.sale_price ? (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-red-600">
                                                    {formatPrice(game.sale_price)}
                                                </span>
                                                <span className="text-xs text-gray-500 line-through">
                                                    {formatPrice(game.price)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-medium">
                                                {formatPrice(game.price)}
                                            </span>
                                        )}
                                        <div className="text-xs text-gray-500">
                                            Stock: {game.stock} unidades
                                        </div>
                                    </div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(game.stock)}`}>
                                        {getStockStatusText(game.stock)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Paginación mejorada */}
            {pagination && pagination.last_page > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                        <div className="text-sm text-gray-700">
                            Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a{' '}
                            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de{' '}
                            {pagination.total} resultados
                        </div>
                        <div className="flex items-center space-x-1">
                            {/* Botón anterior */}
                            <button
                                onClick={() => onPageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            
                            {/* Números de página */}
                            {(() => {
                                const current = pagination.current_page;
                                const total = pagination.last_page;
                                const pages = [];

                                // Lógica para mostrar páginas
                                if (total <= 7) {
                                    // Mostrar todas las páginas si son pocas
                                    for (let i = 1; i <= total; i++) {
                                        pages.push(i);
                                    }
                                } else {
                                    // Mostrar primera página
                                    pages.push(1);
                                    
                                    if (current > 4) {
                                        pages.push('...');
                                    }
                                    
                                    // Páginas alrededor de la actual
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
                                    
                                    // Última página
                                    if (!pages.includes(total)) {
                                        pages.push(total);
                                    }
                                }

                                return pages.map((page, index) => {
                                    if (page === '...') {
                                        return (
                                            <span 
                                                key={`ellipsis-${index}`} 
                                                className="px-3 py-2 text-sm text-gray-500"
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
                                            className={`px-3 py-2 text-sm font-medium border rounded-md ${
                                                isCurrentPage
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
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
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}