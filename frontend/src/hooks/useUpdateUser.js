import { useState } from 'react';

export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserAddress = async (addressData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('http://localhost:8000/api/user/update-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la dirección');
      }

      // Actualizar los datos del usuario en localStorage
      const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      const updatedUser = {
        ...currentUser,
        ...addressData
      };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      setLoading(false);
      return { success: true, data: updatedUser };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    updateUserAddress,
    loading,
    error
  };
};