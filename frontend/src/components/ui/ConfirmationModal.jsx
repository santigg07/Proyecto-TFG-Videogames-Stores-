// src/components/ui/ConfirmationModal.jsx
import React from 'react';

export default function ConfirmationModal({ 
  isOpen, 
  title = "Confirmar acción", 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onCancel,
  type = "default" // "default", "danger"
}) {
  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      {/* Modal sin fondo oscuro, con sombra más prominente */}
      <div className="bg-[#131a2d] border-2 border-[#a32b26] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl pointer-events-auto transform scale-105">
        <div className="mb-5">
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            {type === 'danger' && (
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            {title}
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:border-gray-400 hover:text-white transition-all duration-200 hover:shadow-md"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded font-medium transition-all duration-200 hover:shadow-md ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-900/25' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-900/25'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}