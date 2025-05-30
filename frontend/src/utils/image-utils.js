// Este archivo contiene funciones de utilidad para manejar imágenes en la aplicación.
export function getBackendImageUrl(path) {
    if (!path) return '/assets/images/placeholder.png';
    const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:8000';
    return `${backendUrl}/storage/${path}`;
}