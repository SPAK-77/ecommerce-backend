import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../api';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import { FiSearch, FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';
import './ProductListing.css';
import './Dashboard.css';

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    featured: searchParams.get('featured') || '',
    page: 1,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.categories || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.featured) params.featured = filters.featured;
      params.page = filters.page;
      params.limit = 12;

      const res = await productsAPI.getAll(params);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', featured: '', page: 1 });
    setSearchParams({});
  };

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.featured;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
      <div className="container">
        {/* Page Header */}
        <div className="products-header">
          <div>
            <h1 className="section-title">Product Catalog</h1>
            <p className="section-subtitle">{pagination.total || 0} products available</p>
          </div>
          <div className="products-header-actions">
            <button
              className={`btn btn-secondary btn-sm ${showFilters ? 'active-filter' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> Filters
              {hasActiveFilters && <span className="filter-count-badge">!</span>}
            </button>
            <div className="view-toggle">
              <button className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><FiGrid /></button>
              <button className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><FiList /></button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-wrapper">
          <div className="input-icon-wrapper search-input-wrapper">
            <FiSearch className="input-icon" />
            <input
              type="text"
              id="product-search"
              className="form-input search-input"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
            {filters.search && (
              <button className="search-clear" onClick={() => updateFilter('search', '')}>
                <FiX size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          <button className={`tag ${!filters.category ? 'active' : ''}`} onClick={() => updateFilter('category', '')}>
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`tag ${filters.category === cat.name ? 'active' : ''}`}
              onClick={() => updateFilter('category', cat.name)}
            >
              {cat.icon} {cat.name}
              <span className="cat-count">({cat.product_count})</span>
            </button>
          ))}
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-row">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Min Price (₹)</label>
                <input type="number" className="form-input" placeholder="0" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Max Price (₹)</label>
                <input type="number" className="form-input" placeholder="10000" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Featured Only</label>
                <select className="form-select" value={filters.featured} onChange={(e) => updateFilter('featured', e.target.value)}>
                  <option value="">All Products</option>
                  <option value="true">Featured Only</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button className="btn btn-danger btn-sm" onClick={clearFilters} style={{ marginTop: '20px' }}>
                  <FiX /> Clear All
                </button>
              )}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-skeleton">
                <div className="skeleton" style={{ height: '200px', borderRadius: '12px 12px 0 0' }} />
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                  <div className="skeleton" style={{ height: '20px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '80%' }} />
                  <div className="skeleton" style={{ height: '36px', marginTop: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '16px' }}>Clear Filters</button>
          </div>
        ) : (
          <div className={`products-grid ${viewMode === 'list' ? 'products-list' : ''}`}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
            >
              ← Prev
            </button>
            <div className="page-numbers">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`page-num ${filters.page === p ? 'page-num-active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              disabled={filters.page >= pagination.pages}
              onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
            >
              Next →
            </button>
          </div>
        )}
      </div>
      </main>
    </div>
  );
};

export default ProductListingPage;
