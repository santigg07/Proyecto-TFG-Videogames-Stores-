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
        if (stock === 0) return 'text-red-400 bg-red-900/20';
        if (stock <= 5) return 'text-yellow-400 bg-yellow-900/20';
        return 'text-green-400 bg-green-900/20';
    };

    const getStockStatusText = (stock) => {
        if (stock === 0) return 'Agotado';
        if (stock <= 5) return 'Stock bajo';
        return 'Disponible';
    };

    if (loading && games.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-400">Cargando juegos...</p>
            </div>
        );
    }

    if (games.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-600">
                    <i className="fas fa-gamepad text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No hay juegos</h3>
                <p className="text-gray-400">No se encontraron juegos que coincidan con los filtros aplicados.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Header de la tabla */}
            <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">
                    Lista de Juegos ({pagination?.total || games.length})
                </h3>
            </div>

            {/* Tabla para desktop */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Juego
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Consola
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Precio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {games.map((game) => (
                            <tr key={game.id} className="hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 flex-shrink-0">
                                            <img
                                                className="h-12 w-12 rounded object-cover bg-gray-700"
                                                src={getImageUrl(game.image)}
                                                alt={game.name}
                                                onError={(e) => {
                                                    if (e.target.src !== '/placeholder.jpg') {
                                                        e.target.src = '/placeholder.jpg';
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-white">
                                                {game.name}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {game.release_year}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{game.console?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm">
                                        {game.sale_price ? (
                                            <div>
                                                <span className="font-medium text-red-400">
                                                    {formatPrice(game.sale_price)}
                                                </span>
                                                <div className="text-xs text-gray-500 line-through">
                                                    {formatPrice(game.price)}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="font-medium text-gray-300">
                                                {formatPrice(game.price)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-300">
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
                                            className="text-blue-400 hover:text-blue-300 p-1"
                                            title="Editar"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => onDelete(game.id)}
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
                {games.map((game) => (
                    <div key={game.id} className="border-b border-gray-700 p-4 hover:bg-gray-700/50">
                        <div className="flex items-start space-x-3">
                            <img
                                className="h-16 w-16 rounded object-cover flex-shrink-0 bg-gray-700"
                                src={getImageUrl(game.image)}
                                alt={game.name}
                                onError={(e) => {
                                    if (e.target.src !== '/placeholder.jpg') {
                                        e.target.src = '/placeholder.jpg';
                                    }
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-medium text-white truncate">
                                            {game.name}
                                        </h4>
                                        <p className="text-sm text-gray-400">{game.console?.name}</p>
                                        <p className="text-sm text-gray-500">{game.release_year}</p>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => onEdit(game)}
                                            className="text-blue-400 hover:text-blue-300 p-2"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => onDelete(game.id)}
                                            className="text-red-400 hover:text-red-300 p-2"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <div>
                                        {game.sale_price ? (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-red-400">
                                                    {formatPrice(game.sale_price)}
                                                </span>
                                                <span className="text-xs text-gray-500 line-through">
                                                    {formatPrice(game.price)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-300">
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