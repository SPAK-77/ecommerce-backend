import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI, reviewsAPI } from '../api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import {
  FiArrowRight, FiShield, FiTruck, FiStar,
  FiSearch, FiClock, FiZap, FiCreditCard,
  FiMessageSquare, FiX, FiCheck
} from 'react-icons/fi';
import { getProductImage, handleImageError } from '../utils/productImages';
import { handleCategoryImageError } from '../utils/categoryImages';
import './PublicPage.css';

const CATEGORIES = [
  {
    name: 'Stationery',
    icon: '✏️',
    desc: 'Executive pens, spiral notebooks, markers & filing supplies',
    image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80',
    itemCount: '20 Products',
    color: '#6C63FF',
  },
  {
    name: 'Snacks',
    icon: '🍪',
    desc: 'Crispy chips, butter cookies, roasted nuts & healthy bites',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    itemCount: '20 Products',
    color: '#FF6B6B',
  },
  {
    name: 'Beverages',
    icon: '☕',
    desc: 'Artisanal coffee beans, green tea, energy juices & sodas',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    itemCount: '20 Products',
    color: '#00C896',
  },
  {
    name: 'Electronics',
    icon: '💡',
    desc: 'Fast charging cables, power banks, adapters & desk gadgets',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    itemCount: '20 Products',
    color: '#FFB800',
  },
  {
    name: 'Cleaning',
    icon: '🧹',
    desc: 'Hand sanitizers, disinfectant wipes, sprays & desk hygiene',
    image: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=800&q=80',
    itemCount: '20 Products',
    color: '#00D4FF',
  },
  {
    name: 'Furniture',
    icon: '🪑',
    desc: 'Ergonomic mesh chairs, wooden standing desks & organizers',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    itemCount: '20 Products',
    color: '#FF7F50',
  },
];

const HOW_IT_WORKS = [
  { step: '01', icon: <FiSearch size={28} />, title: 'Browse & Select', desc: 'Explore 500+ curated products across stationery, snacks, beverages & electronics with quantity selector.' },
  { step: '02', icon: <FiCreditCard size={28} />, title: 'Flexible Payment', desc: 'Choose between Cash on Delivery (COD) or Instant UPI Payment with zero extra fees.' },
  { step: '03', icon: <FiTruck size={28} />, title: 'Express Delivery', desc: 'Get fast desk-side delivery with 4-hour flexible order cancellation guarantee.' },
];

const FEATURES = [
  { icon: <FiZap size={24} />, title: 'Express Desk Delivery', desc: 'Fast, reliable delivery straight to your office or home doorstep.' },
  { icon: <FiShield size={24} />, title: 'COD & UPI Payments', desc: 'Multiple payment options including Cash on Delivery and instant UPI VPA.' },
  { icon: <FiClock size={24} />, title: '4-Hour Cancellation', desc: 'Flexible 4-hour cancellation window with automatic stock restoration.' },
  { icon: <FiStar size={24} />, title: '100% Quality Guaranteed', desc: 'Handpicked products from certified brands with verified 5-star ratings.' },
];

const INITIAL_TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Office Operations Manager', text: 'FLIPZONE has transformed how we order our monthly stationery and team snacks. The instant UPI checkout and live tracking are super convenient!', rating: 5, avatarBg: '#6C63FF' },
  { name: 'Rohan Mehta', role: 'Tech Lead @ Innovate', text: 'Best platform for buying tech accessories and pantry items. Order cancellation flexibility within 4 hours gives peace of mind.', rating: 5, avatarBg: '#FF6B6B' },
  { name: 'Anita Krishnan', role: 'HR Executive', text: 'Super fast delivery and top quality products! We order all our desk supplies and coffee packs here.', rating: 5, avatarBg: '#00C896' },
];

const PublicPage = () => {
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // General Website Review Modal & Dynamic List State
  const [websiteReviews, setWebsiteReviews] = useState([]);
  const [showWebsiteReviewModal, setShowWebsiteReviewModal] = useState(false);
  const [webRating, setWebRating] = useState(5);
  const [webComment, setWebComment] = useState('');
  const [submittingWebReview, setSubmittingWebReview] = useState(false);

  const fetchWebsiteReviews = async () => {
    try {
      const res = await reviewsAPI.get({ type: 'website' });
      setWebsiteReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load website reviews:', err);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsAPI.getAll();
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to load home page products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
    fetchWebsiteReviews();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleSubmitWebsiteReview = async (e) => {
    e.preventDefault();
    if (!isAuth) {
      navigate('/login');
      return;
    }
    if (!webComment.trim()) {
      toast.error('Please enter your review comments');
      return;
    }

    setSubmittingWebReview(true);
    try {
      await reviewsAPI.create({
        product_id: null, // General website review
        rating: webRating,
        comment: webComment.trim(),
      });
      toast.success('🎉 Thank you for reviewing FLIPZONE website!');
      setShowWebsiteReviewModal(false);
      setWebComment('');
      await fetchWebsiteReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingWebReview(false);
    }
  };

  const filteredProducts = activeCategoryFilter === 'All'
    ? products.slice(0, 8)
    : products.filter(p => (p.category_name || '').toLowerCase() === activeCategoryFilter.toLowerCase()).slice(0, 8);

  return (
    <div className="public-page">
      {/* General Website Review Modal */}
      {showWebsiteReviewModal && (
        <div className="modal-overlay confirm-overlay" onClick={() => setShowWebsiteReviewModal(false)}>
          <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMessageSquare style={{ color: '#38bdf8' }} /> Review FLIPZONE Website
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowWebsiteReviewModal(false)} style={{ padding: '6px' }}>
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitWebsiteReview}>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Tell us about your shopping experience, website speed, payment convenience, or delivery service on <strong>FLIPZONE</strong>.
              </p>

              {/* Star Picker */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Select Rating (1 to 5 Stars):</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setWebRating(star)}
                      style={{
                        background: star <= webRating ? 'rgba(255, 184, 0, 0.2)' : 'rgba(255,255,255,0.06)',
                        border: star <= webRating ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                        color: star <= webRating ? '#fbbf24' : 'var(--text-muted)',
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
                <label className="form-label">Your Website Feedback:</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="FLIPZONE is fast, user-friendly, and the 4-hour cancellation feature is amazing..."
                  value={webComment}
                  onChange={(e) => setWebComment(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowWebsiteReviewModal(false)} disabled={submittingWebReview}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingWebReview} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCheck /> {submittingWebReview ? 'Submitting...' : 'Post Website Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-orb hero-orb-1" />
        <div className="hero-bg-orb hero-orb-2" />
        <div className="hero-bg-orb hero-orb-3" />

        <div className="container">
          <div className="hero-content">
            <div className="hero-badge-pill">
              <span className="hero-badge-dot" /> 🚀 Next-Gen Enterprise & Retail E-Store
            </div>

            <h1 className="hero-title">
              Your Complete Workspace<br />
              <span className="gradient-text">& Daily Essentials Hub</span>
            </h1>

            <p className="hero-subtitle">
              Discover top-rated stationery, delicious snacks, refreshing beverages, cables & electronics.
              Fast delivery, flexible quantity ordering, and hassle-free Cash on Delivery & UPI payments.
            </p>

            {/* Hero Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hero-search-box">
              <FiSearch className="hero-search-icon" />
              <input
                type="text"
                placeholder="Search pens, coffee, snacks, chargers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="hero-search-btn">
                Search <FiArrowRight />
              </button>
            </form>

            {/* Quick Search Tag Pills */}
            <div className="hero-quick-tags">
              <span className="hero-quick-label">Trending:</span>
              {['Stationery', 'Snacks', 'Beverages', 'Electronics'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="hero-quick-pill"
                  onClick={() => navigate(`/products?category=${tag}`)}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Hero Trust Badges */}
            <div className="hero-trust-bar">
              <div className="hero-trust-item">
                <FiTruck className="hero-trust-icon" /> <span>Express Delivery</span>
              </div>
              <div className="hero-trust-divider" />
              <div className="hero-trust-item">
                <FiCreditCard className="hero-trust-icon" /> <span>COD & Instant UPI</span>
              </div>
              <div className="hero-trust-divider" />
              <div className="hero-trust-item">
                <FiClock className="hero-trust-icon" /> <span>4-Hour Easy Cancellation</span>
              </div>
            </div>
          </div>

          {/* Floating Glassmorphic Product Showcase */}
          <div className="hero-visual">
            <div className="hero-card-float animate-float">
              <div className="hero-card-inner">
                <div className="hero-card-header">
                  <span className="hero-card-live-dot" />
                  <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#ffffff' }}>Featured Essentials</span>
                  <span className="hero-card-badge">Top Rated ⭐ 4.9</span>
                </div>

                {/* Grid of sample top products */}
                <div className="hero-products-showcase">
                  {products.slice(0, 4).map((item) => (
                    <div key={item.id} className="hero-showcase-tile">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="hero-showcase-img"
                        onError={(e) => handleImageError(e, item)}
                      />
                      <div className="hero-showcase-info">
                        <span className="hero-showcase-name">{item.name}</span>
                        <span className="hero-showcase-price">₹{Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hero-card-footer">
                  <span>⚡ 500+ Items in Stock</span>
                  <Link to="/products" className="hero-card-link">Explore Store →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Realistic Shop by Categories Showcase */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-category-badge">✨ EXPLORE CATEGORIES</span>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Everything your workplace & home needs, curated into high-definition collections</p>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                to={`/products?category=${cat.name}`}
                key={cat.name}
                className="category-card-realistic"
              >
                {/* HD Cover Image Banner */}
                <div className="category-image-container">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="category-bg-image"
                    onError={(e) => handleCategoryImageError(e, cat)}
                  />
                  <div className="category-image-overlay" />
                  <span className="category-emoji-badge">{cat.icon}</span>
                  <span className="category-count-badge">{cat.itemCount}</span>
                </div>

                {/* Body Details */}
                <div className="category-info-body">
                  <div className="category-header-flex">
                    <h3 className="category-name-title">{cat.name}</h3>
                    <span className="category-hover-arrow">→</span>
                  </div>
                  <p className="category-desc-text">{cat.desc}</p>
                  <span className="category-explore-btn">
                    Explore {cat.name} Collection →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Real Featured Products Showcase */}
      <section className="featured-products-section">
        <div className="container">
          <div className="flex-between section-header-row" style={{ alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <span className="section-category-badge">🔥 POPULAR SELECTIONS</span>
              <h2 className="section-title" style={{ margin: 0 }}>Featured Products</h2>
              <p className="section-subtitle" style={{ margin: '4px 0 0' }}>Handpicked daily essentials ready to order</p>
            </div>

            {/* Category Filter Tabs */}
            <div className="home-filter-tabs">
              {['All', 'Stationery', 'Snacks', 'Beverages', 'Electronics'].map(tab => (
                <button
                  key={tab}
                  className={`home-tab-btn ${activeCategoryFilter === tab ? 'active' : ''}`}
                  onClick={() => setActiveCategoryFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loadingProducts ? (
            <div className="loading-page" style={{ minHeight: '200px' }}><div className="spinner" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p>No products found in this category.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/products" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px' }}>
              View Full Product Catalog <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works (3-Step Process) */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-category-badge">⚡ HOW IT WORKS</span>
            <h2 className="section-title">Ordering Made Effortless</h2>
            <p className="section-subtitle">Simple 3-step procurement for your office or household</p>
          </div>

          <div className="how-it-works-grid">
            {HOW_IT_WORKS.map((h) => (
              <div key={h.step} className="how-step-card">
                <span className="how-step-num">{h.step}</span>
                <div className="how-step-icon">{h.icon}</div>
                <h3 className="how-step-title">{h.title}</h3>
                <p className="how-step-desc">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-category-badge">🛡️ WHY FLIPZONE</span>
            <h2 className="section-title">Built for Speed & Reliability</h2>
            <p className="section-subtitle">Experience seamless ordering with modern payment and delivery guarantees</p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h4 className="feature-title">{f.title}</h4>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-banner">
            <div className="promo-bg-orb" />
            <div className="promo-content">
              <div className="promo-badge">🎉 Special Launch Offer</div>
              <h2 className="promo-title">Free Shipping on Orders Above ₹500</h2>
              <p className="promo-text">Stock up on office stationery, coffee pods, snacks and tech accessories. Pay via Cash on Delivery or Instant UPI.</p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link to={isAuth ? '/products' : '/signup'} className="btn btn-primary btn-lg">
                  {isAuth ? 'Start Shopping' : 'Create Free Account'} <FiArrowRight />
                </Link>
                <Link to="/products" className="btn btn-secondary btn-lg">
                  Explore Catalog
                </Link>
              </div>
            </div>

            <div className="promo-visual">
              <div className="promo-badge-float">
                <span className="promo-emoji">🎁</span>
                <div>
                  <div style={{ fontWeight: '800', color: '#10b981', fontSize: '1.1rem' }}>FREE SHIPPING</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>On orders over ₹500</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Customer Testimonials & General Website Reviews */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-category-badge">💬 CUSTOMER REVIEWS</span>
            <h2 className="section-title">What Customers Say About <span className="brand-flip">FLIP</span><span className="brand-zone">ZONE</span></h2>
            <p className="section-subtitle">Real feedback submitted by verified customers</p>

            <div style={{ marginTop: '16px' }}>
              <button
                className="btn btn-primary"
                onClick={() => isAuth ? setShowWebsiteReviewModal(true) : navigate('/login')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
              >
                <FiMessageSquare /> Write a Review for FLIPZONE
              </button>
            </div>
          </div>

          <div className="testimonials-grid">
            {/* Show User Submitted Website Reviews first, fallback to initial testimonials */}
            {websiteReviews.length > 0
              ? websiteReviews.map((r) => (
                <div key={r.id} className="testimonial-card">
                  <div className="testimonial-stars">
                    {'⭐'.repeat(r.rating)}
                  </div>
                  <p className="testimonial-text">"{r.comment}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg, #38bdf8, #10b981)' }}>
                      {r.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="testimonial-name">{r.user_name}</p>
                      <p className="testimonial-role">Verified Customer • {new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))
              : INITIAL_TESTIMONIALS.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="testimonial-stars">
                    {'⭐'.repeat(t.rating)}
                  </div>
                  <p className="testimonial-text">"{t.text}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" style={{ background: t.avatarBg }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="testimonial-name">{t.name}</p>
                      <p className="testimonial-role">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">Ready to Elevate Your Workplace Ordering?</h2>
            <p className="cta-text">Join hundreds of satisfied teams ordering daily essentials with instant COD & UPI support.</p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn btn-primary btn-lg" style={{ padding: '14px 32px' }}>
                Get Started Now <FiArrowRight />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" style={{ padding: '14px 32px' }}>
                Sign In to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="/" onClick={(e) => { e.preventDefault(); if (window.location.pathname === '/') window.location.reload(); else window.location.href = '/'; }} className="footer-logo" style={{ cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }} title="FLIPZONE Home Shortcut (Refresh)">
                🛒 <span className="brand-flip">FLIP</span><span className="brand-zone">ZONE</span>
              </a>
              <p className="footer-tagline">
                Your one-stop destination for company essentials, office stationery, snacks, beverages & electronics.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <span className="footer-pill">💵 Cash on Delivery</span>
                <span className="footer-pill">📱 UPI Instant Pay</span>
              </div>
            </div>

            <div className="footer-links">
              <h5>Quick Navigation</h5>
              <Link to="/">Home</Link>
              <Link to="/products">Browse Products</Link>
              <Link to="/cart">My Cart</Link>
              <Link to="/orders">My Orders</Link>
            </div>

            <div className="footer-links">
              <h5>Categories</h5>
              {CATEGORIES.slice(0, 4).map(c => (
                <Link key={c.name} to={`/products?category=${c.name}`}>
                  {c.icon} {c.name}
                </Link>
              ))}
            </div>

            <div className="footer-contact">
              <h5>Contact & Support</h5>
              <p>📧 support@flipzone.com</p>
              <p>📞 +91 98765 43210</p>
              <p>🏢 Bangalore, Karnataka, India</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 FLIPZONE. All rights reserved. Designed with ❤️ for modern businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;
