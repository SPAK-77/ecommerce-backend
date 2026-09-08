import { useState, useEffect } from 'react';
import { reviewsAPI } from '../api';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import {
  FiStar, FiTrash2, FiMessageSquare, FiUser, FiPackage,
  FiCalendar, FiAlertTriangle, FiX, FiCheckCircle, FiSearch
} from 'react-icons/fi';
import { getProductImage, handleImageError } from '../utils/productImages';
import './Dashboard.css';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewsAPI.adminGetAll();
      setReviews(res.data.reviews || []);
    } catch (err) {
      toast.error('Failed to load customer reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    setDeletingId(reviewId);
    try {
      await reviewsAPI.delete(reviewId);
      toast.success('Review deleted successfully!');
      setReviewToDelete(null);
      await fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch =
      (r.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === 'All' || r.rating === parseInt(ratingFilter, 10);
    return matchesSearch && matchesRating;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-welcome">⭐ Customer Reviews</h1>
            <p className="dashboard-date">View and moderate all ratings & feedback submitted by customers.</p>
          </div>
        </div>

        {/* Delete Confirmation Popup */}
        {reviewToDelete && (
          <div className="modal-overlay confirm-overlay" onClick={() => setReviewToDelete(null)}>
            <div className="delete-modal-card" onClick={(e) => e.stopPropagation()} style={{ border: '2px solid rgba(239, 68, 68, 0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="delete-modal-icon-badge">
                  <FiAlertTriangle />
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setReviewToDelete(null)} style={{ padding: '6px' }}>
                  <FiX size={18} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 8px 0', color: '#ffffff' }}>
                Confirm Review Deletion
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                Are you sure you want to delete this customer review? This will update the product rating statistics.
              </p>

              <div className="delete-product-preview" style={{ background: 'rgba(255,255,255,0.05)', margin: '16px 0 20px', padding: '12px 14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff', marginBottom: '4px' }}>
                    "{reviewToDelete.comment}"
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    By <strong>{reviewToDelete.user_name}</strong> • Rating: ⭐ {reviewToDelete.rating}.0
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setReviewToDelete(null)} disabled={deletingId === reviewToDelete.id}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteReview(reviewToDelete.id)}
                  disabled={deletingId === reviewToDelete.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiTrash2 /> {deletingId === reviewToDelete.id ? 'Deleting...' : 'Delete Review'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{reviews.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{avgRating} / 5.0</div>
            <div className="stat-label">Average Customer Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💯</div>
            <div className="stat-value">{reviews.filter(r => r.rating === 5).length}</div>
            <div className="stat-label">5-Star Rating Reviews</div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="card admin-panel-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '6px 14px', flex: 1, maxWidth: '380px' }}>
              <FiSearch style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search reviews by customer or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', width: '100%', fontSize: '0.9rem' }}
              />
            </div>

            {/* Rating Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rating Filter:</span>
              {['All', '5', '4', '3', '2', '1'].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setRatingFilter(stars)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    border: ratingFilter === stars ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                    background: ratingFilter === stars ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: ratingFilter === stars ? '#10b981' : '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {stars === 'All' ? 'All Ratings' : `⭐ ${stars} Stars`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Cards List */}
        <div className="card admin-panel-card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiMessageSquare /> Customer Feedback List ({filteredReviews.length})
          </h3>

          {loading ? (
            <div className="loading-page" style={{ minHeight: '180px' }}><div className="spinner" /></div>
          ) : filteredReviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-icon">💬</div>
              <h3>No customer reviews found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Reviews submitted by customers will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {filteredReviews.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    {/* Header: Customer Info & Rating */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          fontWeight: '800',
                          color: '#ffffff',
                          fontSize: '1rem',
                        }}>
                          {r.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.92rem' }}>
                            {r.user_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {r.user_email}
                          </div>
                        </div>
                      </div>

                      {/* Stars Badge */}
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '14px',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        background: 'rgba(255, 184, 0, 0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(255, 184, 0, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        ⭐ {r.rating}.0
                      </span>
                    </div>

                    {/* Product Name if associated */}
                    {r.product_name && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)',
                        marginBottom: '12px',
                        fontSize: '0.8rem',
                        color: 'var(--primary-light)',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}>
                        <FiPackage size={13} />
                        <span style={{ fontWeight: '600' }}>Product: {r.product_name}</span>
                      </div>
                    )}

                    {/* Review Text Comment */}
                    <p style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      margin: '0 0 14px',
                      fontStyle: 'italic',
                      background: 'rgba(0,0,0,0.2)',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      borderLeft: '3px solid #38bdf8'
                    }}>
                      "{r.comment}"
                    </p>
                  </div>

                  {/* Footer: Date & Delete Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiCalendar size={12} /> {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setReviewToDelete(r)}
                      style={{ color: '#ef4444', padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminReviewsPage;
