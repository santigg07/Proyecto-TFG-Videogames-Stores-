// src/components/admin/GameForm.jsx
import React, { useState, useEffect } from 'react';
import { getImageUrl, buildApiUrl, getFileUploadHeaders } from '../../utils/apiConfig';

export default function GameForm({ 
  game = null, 
  consoles = [], 
  categories = [], 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    sale_price: '',
    stock: '',
    release_year: '',
    condition: '',
    manufacturer: '',
    includes: '',
    console_id: '',
    category_ids: [],
    image: null,
    additional_images: []
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Opciones para el campo condition
  const conditionOptions = [
    { value: 'Nuevo', label: 'Nuevo' },
    { value: 'Usado - Excelente estado', label: 'Usado - Excelente estado' },
    { value: 'Usado - Muy buen estado', label: 'Usado - Muy buen estado' },
    { value: 'Usado - Buen estado', label: 'Usado - Buen estado' },
    { value: 'Usado - Estado aceptable', label: 'Usado - Estado aceptable' },
    { value: 'Coleccionista', label: 'Coleccionista' },
    { value: 'Para repuestos', label: 'Para repuestos' }
  ];

  // Cargar datos del juego si estamos editando
  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name || '',
        slug: game.slug || '',
        description: game.description || '',
        price: game.price || '',
        sale_price: game.sale_price || '',
        stock: game.stock || '',
        release_year: game.release_year || '',
        condition: game.condition || '',
        manufacturer: game.manufacturer || '',
        includes: game.includes || '',
        console_id: game.console_id || '',
        category_ids: game.categories?.map(cat => cat.id) || [],
        image: null,
        additional_images: []
      });

      // Mostrar imagen actual si existe
      if (game.image) {
        setImagePreview(getImageUrl(game.image));
      }
    }
  }, [game]);

  // Cargar imágenes existentes si estamos editando
  useEffect(() => {
    if (game && game.images) {
      setExistingImages(game.images);
    }
  }, [game]);

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
    const { name, value, type, checked, files } = e.target;

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
        setImagePreview(null);
      }
    } else if (type === 'checkbox') {
      if (name === 'category_ids') {
        const categoryId = parseInt(value);
        const updatedCategories = checked
          ? [...formData.category_ids, categoryId]
          : formData.category_ids.filter(id => id !== categoryId);
        
        setFormData({ ...formData, category_ids: updatedCategories });
      }
    } else {
      setFormData({ ...formData, [name]: value });

      if (name === 'name' && (!formData.slug || formData.slug === generateSlug(formData.name))) {
        setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
      }
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, additional_images: files });

    const previews = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({
          file,
          preview: e.target.result,
          name: file.name
        });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(setImagePreviews);
  };

  const removeExistingImage = async (imageId) => {
    try {
      const response = await fetch(buildApiUrl(`/admin/games/${game.id}/images/${imageId}`), {
        method: 'DELETE',
        headers: getFileUploadHeaders()
      });

      if (response.ok) {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
      }
    } catch (error) {
      console.error('Error eliminando imagen:', error);
    }
  };

  const removePreviewImage = (index) => {
    const newImages = formData.additional_images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData({ ...formData, additional_images: newImages });
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es obligatorio';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.sale_price && parseFloat(formData.sale_price) >= parseFloat(formData.price)) {
      newErrors.sale_price = 'El precio de oferta debe ser menor al precio normal';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'El stock debe ser 0 o mayor';
    }

    if (!formData.console_id) {
      newErrors.console_id = 'Debe seleccionar una consola';
    }

    if (formData.release_year && (parseInt(formData.release_year) < 1970 || parseInt(formData.release_year) > new Date().getFullYear())) {
      newErrors.release_year = `El año debe estar entre 1970 y ${new Date().getFullYear()}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    
    // Asegurarse de que el slug esté presente
    const dataToSubmit = { ...formData };
    if (!dataToSubmit.slug || dataToSubmit.slug.trim() === '') {
      dataToSubmit.slug = generateSlug(dataToSubmit.name);
    }
    
    // Agregar todos los campos
    Object.keys(dataToSubmit).forEach(key => {
      if (key === 'category_ids') {
        dataToSubmit[key].forEach(categoryId => {
          submitData.append('category_ids[]', categoryId);
        });
      } else if (key === 'image' && dataToSubmit[key] instanceof File) {
        submitData.append('image', dataToSubmit[key]);
      } else if (key === 'additional_images' && dataToSubmit[key].length > 0) {
        dataToSubmit[key].forEach((file) => {
          submitData.append('additional_images[]', file);
        });
      } else if (key !== 'image' && key !== 'additional_images' && dataToSubmit[key] !== null && dataToSubmit[key] !== '') {
        submitData.append(key, dataToSubmit[key]);
      }
    });

    // Log para debug
    console.log('FormData entries being sent:');
    for (let pair of submitData.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }

    onSubmit(submitData);
  };

  // Modal backdrop y contenedor responsivo
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto  bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-4xl bg-gray-800 border-2 border-gray-700 rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header fijo */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {game ? 'Editar Juego' : 'Crear Nuevo Juego'}
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
                    Nombre del juego *
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
                    placeholder="Ej: Super Mario Bros"
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
                    placeholder="super-mario-bros"
                  />
                  {errors.slug && <p className="mt-1 text-sm text-red-400">{errors.slug}</p>}
                </div>

                {/* Precio */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                      errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="59.99"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-400">{errors.price}</p>}
                </div>

                {/* Precio de oferta */}
                <div>
                  <label htmlFor="sale_price" className="block text-sm font-medium text-gray-300 mb-2">
                    Precio de oferta
                  </label>
                  <input
                    type="number"
                    id="sale_price"
                    name="sale_price"
                    value={formData.sale_price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                      errors.sale_price ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="49.99"
                  />
                  {errors.sale_price && <p className="mt-1 text-sm text-red-400">{errors.sale_price}</p>}
                </div>

                {/* Stock */}
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                      errors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="10"
                  />
                  {errors.stock && <p className="mt-1 text-sm text-red-400">{errors.stock}</p>}
                </div>

                {/* Consola */}
                <div>
                  <label htmlFor="console_id" className="block text-sm font-medium text-gray-300 mb-2">
                    Consola *
                  </label>
                  <select
                    id="console_id"
                    name="console_id"
                    value={formData.console_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                      errors.console_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Seleccionar consola</option>
                    {consoles.map(console => (
                      <option key={console.id} value={console.id}>
                        {console.name}
                      </option>
                    ))}
                  </select>
                  {errors.console_id && <p className="mt-1 text-sm text-red-400">{errors.console_id}</p>}
                </div>

                {/* Año de lanzamiento */}
                <div>
                  <label htmlFor="release_year" className="block text-sm font-medium text-gray-300 mb-2">
                    Año de lanzamiento
                  </label>
                  <input
                    type="number"
                    id="release_year"
                    name="release_year"
                    value={formData.release_year}
                    onChange={handleChange}
                    min="1970"
                    max={new Date().getFullYear()}
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                      errors.release_year ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="1985"
                  />
                  {errors.release_year && <p className="mt-1 text-sm text-red-400">{errors.release_year}</p>}
                </div>

                {/* Condición */}
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-300 mb-2">
                    Condición
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar condición</option>
                    {conditionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fabricante */}
                <div>
                  <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-300 mb-2">
                    Fabricante
                  </label>
                  <input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nintendo"
                  />
                </div>

                {/* Incluye */}
                <div>
                  <label htmlFor="includes" className="block text-sm font-medium text-gray-300 mb-2">
                    Incluye
                  </label>
                  <input
                    type="text"
                    id="includes"
                    name="includes"
                    value={formData.includes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cartucho, caja y manual"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                    errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                  }`}
                  placeholder="Descripción detallada del juego..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categorías
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="category_ids"
                        value={category.id}
                        checked={formData.category_ids.includes(category.id)}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sección de imágenes mejorada y responsiva */}
              <div className="space-y-4">
                {/* Imagen principal */}
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
                    Imagen principal
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
                        alt="Preview principal"
                        className="w-32 h-32 object-cover rounded-md border border-gray-600"
                      />
                    </div>
                  )}
                </div>

                {/* Imágenes adicionales */}
                <div>
                  <label htmlFor="additional_images" className="block text-sm font-medium text-gray-300 mb-2">
                    Imágenes adicionales
                  </label>
                  <input
                    type="file"
                    id="additional_images"
                    name="additional_images"
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-600 file:text-gray-300 hover:file:bg-gray-500"
                  />
                  
                  {/* Mostrar imágenes existentes */}
                  {existingImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Imágenes actuales:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {existingImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={getImageUrl(image.image_path)}
                              alt="Imagen del juego"
                              className="w-full h-24 object-cover rounded border border-gray-600"
                              
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(image.id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mostrar previews de nuevas imágenes */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Nuevas imágenes:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded border border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={() => removePreviewImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
              {isLoading ? 'Guardando...' : (game ? 'Actualizar' : 'Crear')} Juego
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}