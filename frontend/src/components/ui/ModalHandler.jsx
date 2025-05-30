// src/components/ui/ModalHandler.jsx
import React, { useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';

export default function ModalHandler() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'default',
    onConfirm: null,
    onCancel: null
  });

  useEffect(() => {
    function handleShowModal(event) {
      const {
        title,
        message,
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'default',
        onConfirm,
        onCancel
      } = event.detail;

      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm,
        onCancel: onCancel || (() => setModalState(prev => ({ ...prev, isOpen: false })))
      });
    }

    document.addEventListener('show-modal', handleShowModal);

    return () => {
      document.removeEventListener('show-modal', handleShowModal);
    };
  }, []);

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (modalState.onCancel) {
      modalState.onCancel();
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmationModal
      isOpen={modalState.isOpen}
      title={modalState.title}
      message={modalState.message}
      confirmText={modalState.confirmText}
      cancelText={modalState.cancelText}
      type={modalState.type}
      onConfirm={handleConfirm}
      onClose={handleCancel}
    />
  );
}