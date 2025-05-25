// src/components/admin/CategoryForm.jsx
import React, { useState, useEffect } from 'react';

export default function CategoryForm({ 
  category = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  const [errors, setErrors] = useState({});

  // Cargar datos de la categoría si estamos editando
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || ''
      });
    }
  }, [category]);

  // Generar slug automáticamente del nombre
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({ ...formData, [name]: value });

    // Auto-generar slug cuando cambie el nombre
    if (name === 'name' && (!formData.slug || formData.slug === generateSlug(formData.name))) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }

    // Limpiar errores del campo que se está editando
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es obligatorio';
    }

    // Validar que el slug no tenga caracteres especiales
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header fijo */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {category ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la categoría *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                  }`}
                  placeholder="Ej: RPG"
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                    errors.slug ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                  }`}
                  placeholder="rpg"
                />
                {errors.slug && <p className="mt-1 text-sm text-red-400">{errors.slug}</p>}
                <p className="mt-1 text-xs text-gray-400">
                  Se genera automáticamente del nombre. Solo letras minúsculas, números y guiones.
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">ℹ️ Información</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Las categorías se usan para clasificar los juegos</li>
                  <li>• El slug se usa para generar URLs amigables</li>
                  <li>• No se puede eliminar una categoría que tiene juegos asociados</li>
                </ul>
              </div>
            </form>
          </div>

          {/* Footer fijo con botones */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 border-t border-gray-700 bg-gray-800">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:border-gray-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Guardando...' : (category ? 'Actualizar' : 'Crear')} Categoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}