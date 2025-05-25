// src/utils/toast.js

// Función principal para mostrar toasts
export const showToast = (message, options = {}) => {
  const {
    type = 'info',
    duration = 4000,
    title = null,
    icon = null
  } = options;

  const event = new CustomEvent('show-toast', {
    detail: {
      message,
      type,
      duration,
      title,
      icon
    }
  });

  document.dispatchEvent(event);
};

// Funciones específicas para cada tipo de toast
export const toastSuccess = (message, options = {}) => {
  showToast(message, { ...options, type: 'success' });
};

export const toastError = (message, options = {}) => {
  showToast(message, { ...options, type: 'error' });
};

export const toastWarning = (message, options = {}) => {
  showToast(message, { ...options, type: 'warning' });
};

export const toastInfo = (message, options = {}) => {
  showToast(message, { ...options, type: 'info' });
};

export const toastAuth = (message, options = {}) => {
  showToast(message, { ...options, type: 'auth' });
};

// Toasts específicos para operaciones CRUD de juegos
export const toastGameCreated = (gameName) => {
  toastSuccess(`El juego "${gameName}" ha sido creado exitosamente`, {
    title: 'Juego Creado',
    duration: 5000
  });
};

export const toastGameUpdated = (gameName) => {
  toastSuccess(`El juego "${gameName}" ha sido actualizado exitosamente`, {
    title: 'Juego Actualizado',
    duration: 5000
  });
};

export const toastGameDeleted = (gameName) => {
  toastSuccess(`El juego "${gameName}" ha sido eliminado exitosamente`, {
    title: 'Juego Eliminado',
    duration: 5000
  });
};

export const toastGameError = (action, error = null) => {
  const actions = {
    create: 'crear',
    update: 'actualizar',
    delete: 'eliminar',
    fetch: 'cargar'
  };

  const actionText = actions[action] || action;
  let message = `Error al ${actionText} el juego`;
  
  if (error && error.message) {
    message += `: ${error.message}`;
  }

  toastError(message, {
    title: 'Error en la operación',
    duration: 6000
  });
};

// Toasts específicos para operaciones CRUD de consolas
export const toastConsoleCreated = (consoleName) => {
  toastSuccess(`La consola "${consoleName}" ha sido creada exitosamente`, {
    title: 'Consola Creada',
    duration: 5000
  });
};

export const toastConsoleUpdated = (consoleName) => {
  toastSuccess(`La consola "${consoleName}" ha sido actualizada exitosamente`, {
    title: 'Consola Actualizada',
    duration: 5000
  });
};

export const toastConsoleDeleted = (consoleName) => {
  toastSuccess(`La consola "${consoleName}" ha sido eliminada exitosamente`, {
    title: 'Consola Eliminada',
    duration: 5000
  });
};

export const toastConsoleError = (action, error = null) => {
  const actions = {
    create: 'crear',
    update: 'actualizar',
    delete: 'eliminar',
    fetch: 'cargar'
  };

  const actionText = actions[action] || action;
  let message = `Error al ${actionText} la consola`;
  
  if (error && error.message) {
    message += `: ${error.message}`;
  }

  toastError(message, {
    title: 'Error en la operación',
    duration: 6000
  });
};

// Toast para consolas con juegos asociados
export const toastConsoleCannotDelete = (consoleName, gamesCount) => {
  toastWarning(
    `No se puede eliminar la consola "${consoleName}" porque tiene ${gamesCount} juego${gamesCount === 1 ? '' : 's'} asociado${gamesCount === 1 ? '' : 's'}. Elimina primero los juegos.`,
    {
      title: 'No se puede eliminar',
      duration: 7000
    }
  );
};

// Toast para errores de validación
export const toastValidationError = (message = 'Por favor, revisa los campos del formulario') => {
  toastWarning(message, {
    title: 'Datos incorrectos',
    duration: 5000
  });
};

// Toast para confirmaciones
export const toastConfirmation = (message, options = {}) => {
  toastInfo(message, {
    title: 'Información',
    ...options
  });
};