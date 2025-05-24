// src/components/profile/ProfileForm.jsx
import React, { useState, useEffect } from 'react';

export default function ProfileForm() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    birth_date: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // URL del backend
  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    loadUserData();
    
    // Escuchar el evento del botón de editar
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
      const handleEdit = () => setIsEditing(true);
      editBtn.addEventListener('click', handleEdit);
      return () => editBtn.removeEventListener('click', handleEdit);
    }
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        setError('Error al cargar los datos del usuario');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Error de conexión al cargar los datos');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('No hay token de autenticación');
        setIsLoading(false);
        return;
      }

      console.log('Enviando datos del perfil:', userData);

      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      console.log('Respuesta del servidor:', response.status);

      const result = await response.json();

      if (response.ok) {
        setSuccess('Perfil actualizado correctamente');
        setIsEditing(false);
        
        // Actualizar el usuario en localStorage
        const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const updatedUser = { ...currentUser, ...result.user };
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        
        // Actualizar el nombre en el sidebar
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
          userNameElement.textContent = userData.name;
        }
        
        // Emitir evento para actualizar otros componentes
        document.dispatchEvent(new CustomEvent('profile-updated', {
          detail: updatedUser
        }));
        
      } else {
        console.error('Error del servidor:', result);
        setError(result.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    loadUserData(); // Recargar datos originales
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        {success && (
          <div className="bg-green-600 bg-opacity-20 border border-green-500 text-green-100 px-4 py-3 rounded">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Nombre Completo
            </label>
            <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
              {userData.name || 'No especificado'}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
              {userData.email || 'No especificado'}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Teléfono
            </label>
            <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
              {userData.phone || 'No especificado'}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Fecha de Nacimiento
            </label>
            <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
              {userData.birth_date ? new Date(userData.birth_date).toLocaleDateString('es-ES') : 'No especificado'}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Dirección
            </label>
            <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
              {userData.address || 'No especificado'}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              País
            </label>
            <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
              {userData.country || 'No especificado'}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Ciudad
            </label>
            <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
              {userData.city || 'No especificado'}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Código Postal
            </label>
            <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
              {userData.postal_code || 'No especificado'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-gray-300 text-sm font-medium mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            required
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="Tu nombre completo"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            required
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="tu@email.com"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-gray-300 text-sm font-medium mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={userData.phone || ''}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="+34 600 000 000"
          />
        </div>
        
        <div>
          <label htmlFor="birth_date" className="block text-gray-300 text-sm font-medium mb-2">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            id="birth_date"
            name="birth_date"
            value={userData.birth_date || ''}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-gray-300 text-sm font-medium mb-2">
            Dirección
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={userData.address || ''}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="Calle, número, piso..."
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="country" className="block text-gray-300 text-sm font-medium mb-2">
            País
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={userData.country || ''}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="Tu país"
          />
        </div>
        
        <div>
          <label htmlFor="city" className="block text-gray-300 text-sm font-medium mb-2">
            Ciudad
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={userData.city || ''}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="Tu ciudad"
          />
        </div>
        
        <div>
          <label htmlFor="postal_code" className="block text-gray-300 text-sm font-medium mb-2">
            Código Postal
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={userData.postal_code || ''}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="00000"
          />
        </div>
      </div>
      
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors duration-200"
        >
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}