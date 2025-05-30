// src/components/ui/AuthRequiredNotice.jsx
import React, { useState, useEffect } from 'react';

export default function AuthRequiredNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    function handleShowNotice(event) {
      setMessage(event.detail.message || 'Necesitas iniciar sesión para acceder a esta sección');
      setIsVisible(true);
      
      // Auto-ocultar después de 3 segundos
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }

    document.addEventListener('show-auth-notice', handleShowNotice);
    
    return () => {
      document.removeEventListener('show-auth-notice', handleShowNotice);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9998] max-w-md">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-lg shadow-lg border border-amber-400">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {message}
            </p>
            <p className="text-xs text-amber-100 mt-1">
              El modal de inicio de sesión aparecerá en breve
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-amber-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}