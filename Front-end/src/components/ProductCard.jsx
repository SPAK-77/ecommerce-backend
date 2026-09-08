import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reviewsAPI } from '../api';
import { FiShoppingCart, FiStar, FiPlus, FiMinus, FiInfo, FiX, FiCheck, FiMessageSquare, FiCalendar, FiUser } from 'react-icons/fi';
import { getProductImage, handleImageError } from '../utils/productImages';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Reviews state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [existingReviews, setExistingReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const inStock = product.stock > 0;
  const maxQty = product.stock || 1;
  const imgUrl = getProductImage(product);

  const fetchProductReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await reviewsAPI.get({ product_id: product.id });
      setExistingReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (showDetailsModal) {
      fetchProductReviews();
    }
  }, [showDetailsModal]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth) {
      navigate('/login');
      return;
    }
    if (!inStock) return;
    addToCart(product.id, quantity);
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < maxQty) setQuantity(prev => prev + 1);
  };

  const handleQuantityInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
    } else if (val > maxQty) {
      setQuantity(maxQty);
      toast.error(`Maximum quantity available is ${maxQty}`);
    } else {
      setQuantity(val);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuth) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please enter your review text');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsAPI.create({
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast.success('🎉 Thank you! Your review has been submitted');
      setShowReviewForm(false);
      setReviewComment('');
      await fetchProductReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      {/* Customer Write Review Modal */}
      {showReviewForm && (
        <div className="modal-overlay confirm-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMessageSquare style={{ color: '#38bdf8' }} /> Write a Product Review
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReviewForm(false)} style={{ padding: '6px' }}>
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={imgUrl} alt={product.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#ffffff' }}>{product.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>₹{Number(product.price).toFixed(2)}</span>
                </div>
              </div>

              {/* Interactive Star Picker */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Select Rating (1 to 5 Stars):</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: star <= reviewRating ? 'rgba(255, 184, 0, 0.2)' : 'rgba(255,255,255,0.06)',
                        border: star <= reviewRating ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                        color: star <= reviewRating ? '#fbbf24' : 'var(--text-muted)',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Honest Review & Feedback:</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Tell us what you loved about this product, quality, and delivery speed..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowReviewForm(false)} disabled={submittingReview}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingReview} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCheck /> {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Details & Overall Description Modal */}
      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="product-category" style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>
                  {product.category_icon} {product.category_name || 'General Product'}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0 0', color: '#ffffff' }}>
                  {product.name}
                </h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDetailsModal(false)} style={{ padding: '6px' }}>
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {/* Product Image Box */}
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                <img
                  src={imgUrl}
                  alt={product.name}
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                  onError={(e) => handleImageError(e, product)}
                />
              </div>

              {/* Product Info & Max Purchase Limits */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div className="product-rating">
                      <FiStar className="star-icon" />
                      <span style={{ fontWeight: '700' }}>{product.rating || '4.8'}</span>
                      <span className="rating-count">({product.reviews_count || existingReviews.length} reviews)</span>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowReviewForm(true)}
                      style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FiMessageSquare size={12} /> Write Review
                    </button>
                  </div>

                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-light)', marginBottom: '12px' }}>
                    ₹{Number(product.price).toFixed(2)}
                  </div>

                  {/* Stock & Max Order Limit Note */}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: inStock ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${inStock ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    marginBottom: '14px',
                    fontSize: '0.85rem'
                  }}>
                    <strong style={{ color: inStock ? '#10b981' : '#ef4444', display: 'block', marginBottom: '2px' }}>
                      {inStock ? `✅ Stock Available: ${product.stock} units` : '❌ Currently Out of Stock'}
                    </strong>
                    {inStock && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        📦 You can order up to <strong>{product.stock}</strong> unit{product.stock !== 1 ? 's' : ''} of this product.
                      </span>
                    )}
                  </div>
                </div>

                {/* Overall Description Box */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    📝 Overall Product Description:
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                    {product.description || 'High quality product available for immediate order and fast delivery.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Other Customers' Reviews Section */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiMessageSquare style={{ color: '#38bdf8' }} /> Other Customers' Reviews ({existingReviews.length})
                </h4>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowReviewForm(true)}
                  style={{ fontSize: '0.75rem', padding: '2px 8px', color: 'var(--primary-light)' }}
                >
                  + Add Your Review
                </button>
              </div>

              {loadingReviews ? (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading reviews...</div>
              ) : existingReviews.length === 0 ? (
                <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                  No customer reviews yet for this product. Be the first to share your experience!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {existingReviews.map((r) => (
                    <div key={r.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#ffffff' }}>
                          {r.user_name || 'Customer'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '700' }}>
                          ⭐ {r.rating}.0
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 4px', fontStyle: 'italic' }}>
                        "{r.comment}"
                      </p>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity Selector & Total Price in Modal */}
            {inStock && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Select Order Quantity:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button className="qty-btn" onClick={handleDecrease} disabled={quantity <= 1}>
                        <FiMinus size={14} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={maxQty}
                        value={quantity}
                        onChange={handleQuantityInputChange}
                        style={{
                          width: '56px',
                          textAlign: 'center',
                          padding: '6px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: 'rgba(255,255,255,0.1)',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '1rem',
                        }}
                      />
                      <button className="qty-btn" onClick={handleIncrease} disabled={quantity >= maxQty}>
                        <FiPlus size={14} />
                      </button>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        (Max {maxQty})
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Price ({quantity} units):</span>
                    <strong style={{ fontSize: '1.4rem', color: '#10b981' }}>
                      ₹{(product.price * quantity).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              <button
                className={`btn btn-primary ${!inStock ? 'btn-disabled' : ''}`}
                onClick={(e) => {
                  handleAddToCart(e);
                  setShowDetailsModal(false);
                }}
                disabled={!inStock}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
              >
                <FiShoppingCart /> {inStock ? `Add ${quantity} to Cart (₹${(product.price * quantity).toFixed(2)})` : 'Sold Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Product Card */}
      <div className="product-card">
        <div className="product-image-wrapper">
          <img src={imgUrl} alt={product.name} className="product-image" loading="lazy" onError={(e) => handleImageError(e, product)} />
          {product.is_featured && <span className="product-featured-badge">⭐ Featured</span>}
          {!inStock && <span className="product-oos-badge">Out of Stock</span>}

          {/* Quick Info Button */}
          <button
            onClick={() => setShowDetailsModal(true)}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <FiInfo size={12} /> View Details
          </button>
        </div>

        <div className="product-info">
          <span className="product-category">{product.category_icon} {product.category_name}</span>
          <h3 className="product-name" onClick={() => setShowDetailsModal(true)} style={{ cursor: 'pointer' }}>
            {product.name}
          </h3>

          {/* Overall Product Description & Max Limit Note */}
          <p className="product-desc">{product.description}</p>
          <span style={{ fontSize: '0.75rem', color: inStock ? 'var(--primary-light)' : '#ef4444', fontWeight: '600' }}>
            {inStock ? `📦 Can buy up to ${product.stock} units` : '❌ Out of Stock'}
          </span>

          <div className="product-rating">
            <FiStar className="star-icon" />
            <span>{product.rating}</span>
            <span className="rating-count">({product.reviews_count})</span>
          </div>

          {/* Quantity Selector Bar */}
          {inStock && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '8px', margin: '6px 0 2px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Qty:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center'
                  }}
                >
                  <FiMinus size={11} />
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', minWidth: '18px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= maxQty}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center'
                  }}
                >
                  <FiPlus size={11} />
                </button>
              </div>
            </div>
          )}

          <div className="product-footer">
            <div>
              <span className="product-price">₹{Number(product.price).toFixed(2)}</span>
              {quantity > 1 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  (₹{(product.price * quantity).toFixed(2)} total)
                </div>
              )}
            </div>

            <button
              className={`btn btn-primary btn-sm ${!inStock ? 'btn-disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={!inStock}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FiShoppingCart size={13} />
              {inStock ? `Add (${quantity})` : 'Sold Out'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
