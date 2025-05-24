// src/hooks/useConfirmation.js
import { useState } from 'react';

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolvePromise, setResolvePromise] = useState(null);

  const confirm = (options) => {
    return new Promise((resolve) => {
      setConfig(options);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  return {
    isOpen,
    config,
    confirm,
    handleConfirm,
    handleCancel
  };
}