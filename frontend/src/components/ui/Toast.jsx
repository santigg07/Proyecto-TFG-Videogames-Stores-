// src/components/ui/Toast.jsx
import React, { useState, useEffect } from 'react';

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleShowToast(event) {
      const { 
        message, 
        type = 'info', 
        duration = 4000,
        title = null,
        icon = null 
      } = event.detail;
      
      const newToast = {
        id: Date.now() + Math.random(), // ID único
        message,
        type,
        duration,
        title,
        icon
      };

      setToasts(prev => [...prev, newToast]);

      // Auto-remover el toast
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== newToast.id));
      }, duration);
    }

    document.addEventListener('show-toast', handleShowToast);

    return () => {
      document.removeEventListener('show-toast', handleShowToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 text-white';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-600 border-red-400 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 text-white';
      case 'auth':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 text-white';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400 text-white';
    }
  };

  const getIcon = (type, customIcon) => {
    if (customIcon) return customIcon;

    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'auth':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 px-4 py-3 rounded-lg shadow-xl border-l-4
            transform transition-all duration-300 ease-in-out
            animate-[slideInFromRight_0.3s_ease-out]
            ${getToastStyles(toast.type)}
          `}
          style={{
            animation: 'slideInFromRight 0.3s ease-out',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(toast.type, toast.icon)}
          </div>
          
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="font-semibold text-sm mb-1">
                {toast.title}
              </h4>
            )}
            <p className="text-sm leading-relaxed">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <style jsx="true">{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}