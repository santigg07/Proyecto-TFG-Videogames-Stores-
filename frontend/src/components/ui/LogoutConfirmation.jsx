// src/components/ui/LogoutConfirmation.jsx
import React, { useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';

export default function LogoutConfirmation() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleShowConfirmation() {
      setIsOpen(true);
    }

    document.addEventListener('show-logout-confirmation', handleShowConfirmation);
    
    return () => {
      document.removeEventListener('show-logout-confirmation', handleShowConfirmation);
    };
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    document.dispatchEvent(new CustomEvent('logout-confirmed'));
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      title="Cerrar sesión"
      message="¿Estás seguro que quieres cerrar sesión? Se cerrará tu sesión en este dispositivo."
      confirmText="Cerrar sesión"
      cancelText="Cancelar"
      type="danger"
      onConfirm={handleConfirm}
      onClose={handleClose} // 
    />
  );
}