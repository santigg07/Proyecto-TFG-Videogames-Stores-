// src/components/admin/ConsoleForm.jsx
import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/apiConfig';

export default function ConsoleForm({ 
  console = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    manufacturer: '',
    image: null
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Fabricantes comunes
  const manufacturerOptions = [
    { value: 'Nintendo', label: 'Nintendo' },
    { value: 'Sony', label: 'Sony' },
    { value: 'Microsoft', label: 'Microsoft' },
    { value: 'Sega', label: 'Sega' },
    { value: 'Atari', label: 'Atari' },
    { value: 'SNK', label: 'SNK' },
    { value: 'Capcom', label: 'Capcom' },
    { value: 'Bandai Namco', label: 'Bandai Namco' },
    { value: 'Otro', label: 'Otro' }
  ];

  // Cargar datos de la consola si estamos editando
  useEffect(() => {
    if (console) {
      setFormData({
        name: console.name || '',
        slug: console.slug || '',
        manufacturer: console.manufacturer || '',
        image: null
      });

      // Mostrar imagen actual si existe
      if (console.image) {
        setImagePreview(getImageUrl(console.image));
      }
    }
  }, [console]);

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
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(console?.image ? getImageUrl(console.image) : null);
      }
    } else {
      setFormData({ ...formData, [name]: value });

      // Auto-generar slug cuando cambie el nombre
      if (name === 'name' && (!formData.slug || formData.slug === generateSlug(formData.name))) {
        setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
      }
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

    // Crear FormData para enviar archivos
    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto  bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header fijo */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {console ? 'Editar Consola' : 'Crear Nueva Consola'}
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
              {/* Grid de dos columnas para campos principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Nombre */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la consola *
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
                    placeholder="Ej: Nintendo NES"
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
                    placeholder="nintendo-nes"
                  />
                  {errors.slug && <p className="mt-1 text-sm text-red-400">{errors.slug}</p>}
                  <p className="mt-1 text-xs text-gray-400">
                    Se genera automáticamente del nombre. Solo letras minúsculas, números y guiones.
                  </p>
                </div>
              </div>

              {/* Fabricante */}
              <div>
                <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-300 mb-2">
                  Fabricante
                </label>
                <select
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar fabricante</option>
                  {manufacturerOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Imagen */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen de la consola
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-600 file:text-gray-300 hover:file:bg-gray-500"
                />
                {imagePreview && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md border border-gray-600"
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Formatos recomendados: JPG, PNG. Tamaño máximo: 2MB.
                </p>
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
              {isLoading ? 'Guardando...' : (console ? 'Actualizar' : 'Crear')} Consola
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}