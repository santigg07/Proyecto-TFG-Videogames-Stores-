// src/components/products/ProductReviews.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import ReviewForm from './ReviewForm';

const ProductReviews = ({ gameId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
    if (isAuthenticated) {
      checkCanReview();
    }
  }, [gameId, currentPage, isAuthenticated]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      } : {
        'Accept': 'application/json'
      };

      const response = await fetch(
        `http://localhost:8000/api/games/${gameId}/reviews?page=${currentPage}`,
        { headers }
      );

      if (!response.ok) throw new Error('Error al cargar reseñas');

      const data = await response.json();
      setReviews(data.data || []);
      setTotalPages(data.last_page || 1);
      
      // Calcular estadísticas
      calculateStats(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:8000/api/games/${gameId}/can-review`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCanReview(data.can_review);
        setHasPurchased(data.has_purchased);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const calculateStats = (reviewsData) => {
    if (reviewsData.length === 0) {
      setStats({ average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      return;
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviewsData.forEach(review => {
      distribution[review.rating]++;
      totalRating += review.rating;
    });

    setStats({
      average: (totalRating / reviewsData.length).toFixed(1),
      total: reviewsData.length,
      distribution
    });
  };

  const handleVote = async (reviewId, isHelpful) => {
    if (!isAuthenticated) {
      showToast('Debes iniciar sesión para votar', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:8000/api/reviews/${reviewId}/vote`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ is_helpful: isHelpful })
        }
      );

      if (response.ok) {
        fetchReviews(); // Recargar reseñas
      } else {
        const data = await response.json();
        showToast(data.error || 'Error al votar', 'error');
      }
    } catch (err) {
      showToast('Error al procesar el voto', 'error');
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviews();
    checkCanReview();
    showToast('¡Reseña publicada exitosamente!', 'success');
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Reseñas del Producto</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {renderStars(Math.round(stats.average))}
              <span className="ml-2 text-white font-semibold">{stats.average}</span>
            </div>
            <span className="text-gray-400">({stats.total} reseñas)</span>
          </div>
        </div>

        {isAuthenticated && canReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {/* Distribución de ratings */}
      <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
        {[5, 4, 3, 2, 1].map(rating => {
          const percentage = stats.total > 0 ? (stats.distribution[rating] / stats.total) * 100 : 0;
          return (
            <div key={rating} className="flex items-center gap-3 mb-2 last:mb-0">
              <span className="text-sm text-gray-400 w-4">{rating}</span>
              <div className="flex">{renderStars(rating)}</div>
              <div className="flex-1 bg-gray-600 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-10 text-right">
                {stats.distribution[rating]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Formulario de reseña */}
      {showReviewForm && (
        <ReviewForm
          gameId={gameId}
          onClose={() => setShowReviewForm(false)}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Mensaje si no puede reseñar */}
      {isAuthenticated && !canReview && !showReviewForm && (
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400">
            {hasPurchased
              ? 'Ya has reseñado este producto.'
              : 'Debes comprar este producto para poder reseñarlo.'}
          </p>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No hay reseñas todavía. ¡Sé el primero en opinar!
          </p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="border-b border-gray-700 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="font-semibold text-white">{review.title || 'Sin título'}</span>
                    {review.is_verified_purchase && (
                      <span className="text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded">
                        Compra verificada
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2">
                    Por <span className="text-white">{review.user?.name}</span> el{' '}
                    {new Date(review.created_at).toLocaleDateString('es-ES')}
                  </p>
                  
                  {review.comment && (
                    <p className="text-gray-300 mb-3">{review.comment}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      ¿Te resultó útil? ({review.helpful_count} personas)
                    </span>
                    <button
                      onClick={() => handleVote(review.id, true)}
                      className={`text-gray-400 hover:text-green-400 transition-colors ${
                        review.user_vote === true ? 'text-green-400' : ''
                      }`}
                    >
                      👍 Sí
                    </button>
                    <button
                      onClick={() => handleVote(review.id, false)}
                      className={`text-gray-400 hover:text-red-400 transition-colors ${
                        review.user_vote === false ? 'text-red-400' : ''
                      }`}
                    >
                      👎 No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded transition-colors"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-gray-400">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;