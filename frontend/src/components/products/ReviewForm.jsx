// src/components/products/ReviewForm.jsx
import React, { useState } from 'react';
import { showToast } from '../../utils/toast';

const ReviewForm = ({ gameId, orderId = null, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rating) {
      showToast('Por favor selecciona una calificación', 'warning');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId,
          order_id: orderId,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSubmitted();
      } else {
        showToast(data.error || 'Error al publicar la reseña', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => handleRatingClick(i + 1)}
        className="focus:outline-none"
      >
        <svg
          className={`w-8 h-8 ${
            i < formData.rating ? 'text-yellow-400' : 'text-gray-600'
          } hover:text-yellow-400 transition-colors`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ));
  };

  return (
    <div className="mb-6 p-6 bg-gray-700/50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Escribir una reseña</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Calificación
          </label>
          <div className="flex gap-1">
            {renderStars()}
          </div>
        </div>

        {/* Título */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Título de la reseña (opcional)
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength="255"
            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Resume tu experiencia..."
          />
        </div>

        {/* Comentario */}
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
            Tu opinión (opcional)
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows="4"
            maxLength="1000"
            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Cuéntanos más sobre tu experiencia con este juego..."
          />
          <p className="text-xs text-gray-400 mt-1">
            {formData.comment.length}/1000 caracteres
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Publicando...
              </>
            ) : (
              'Publicar reseña'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;