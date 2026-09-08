import { useEffect, useState } from 'react';
import { productsAPI, categoriesAPI } from '../api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { getProductImage, handleImageError } from '../utils/productImages';
import { FiUpload, FiImage, FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import './Dashboard.css';

const getCategoryColor = (catName) => {
  const name = (catName || '').toLowerCase();
  if (name.includes('stationery')) return { bg: 'rgba(108, 99, 255, 0.15)', text: '#6C63FF', border: 'rgba(108, 99, 255, 0.3)' };
  if (name.includes('snack')) return { bg: 'rgba(255, 107, 107, 0.15)', text: '#FF6B6B', border: 'rgba(255, 107, 107, 0.3)' };
  if (name.includes('beverag')) return { bg: 'rgba(0, 200, 150, 0.15)', text: '#00C896', border: 'rgba(0, 200, 150, 0.3)' };
  if (name.includes('electron')) return { bg: 'rgba(255, 184, 0, 0.15)', text: '#FFB800', border: 'rgba(255, 184, 0, 0.3)' };
  if (name.includes('clean')) return { bg: 'rgba(0, 212, 255, 0.15)', text: '#00D4FF', border: 'rgba(0, 212, 255, 0.3)' };
  if (name.includes('furnit')) return { bg: 'rgba(255, 127, 80, 0.15)', text: '#FF7F50', border: 'rgba(255, 127, 80, 0.3)' };
  return { bg: 'rgba(255, 255, 255, 0.08)', text: 'var(--text-primary)', border: 'rgba(255, 255, 255, 0.15)' };
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // New product state
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    is_featured: false,
    image_url: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Edit product state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    is_featured: false,
    image_url: '',
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');

  // Delete product confirmation modal state
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ limit: 100 }),
        categoriesAPI.getAll(),
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (err) {
      toast.error('Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle file select for new product
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setForm(prev => ({ ...prev, image_url: '' }));
    }
  };

  // Handle file select for editing product
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
      setEditForm(prev => ({ ...prev, image_url: '' }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload;
      if (imageFile) {
        payload = new FormData();
        payload.append('name', form.name);
        payload.append('category_id', form.category_id || categories[0]?.id || 1);
        payload.append('description', form.description);
        payload.append('price', Number(form.price));
        payload.append('stock', Number(form.stock));
        payload.append('is_featured', form.is_featured);
        payload.append('image', imageFile);
      } else {
        payload = {
          name: form.name,
          category_id: form.category_id || categories[0]?.id || 1,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          is_featured: form.is_featured,
          image: form.image_url || null,
        };
      }

      await productsAPI.create(payload);
      toast.success('Product created with photo!');
      setForm({ category_id: '', name: '', description: '', price: '', stock: '', is_featured: false, image_url: '' });
      setImageFile(null);
      setImagePreview('');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create product');
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      category_id: product.category_id || categories[0]?.id || 1,
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      is_featured: Boolean(product.is_featured),
      image_url: product.image || '',
    });
    setEditImageFile(null);
    setEditImagePreview(getProductImage(product));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      let payload;
      if (editImageFile) {
        payload = new FormData();
        payload.append('name', editForm.name);
        payload.append('category_id', editForm.category_id);
        payload.append('description', editForm.description);
        payload.append('price', Number(editForm.price));
        payload.append('stock', Number(editForm.stock));
        payload.append('is_featured', editForm.is_featured);
        payload.append('image', editImageFile);
      } else {
        payload = {
          name: editForm.name,
          category_id: editForm.category_id,
          description: editForm.description,
          price: Number(editForm.price),
          stock: Number(editForm.stock),
          is_featured: editForm.is_featured,
          image: editForm.image_url || null,
        };
      }

      await productsAPI.update(editingProduct.id, payload);
      toast.success('Product photo & details updated!');
      setEditingProduct(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update product');
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await productsAPI.delete(productToDelete.id);
      toast.success(`"${productToDelete.name}" was deleted`);
      setProductToDelete(null);
      await loadData();
    } catch (err) {
      toast.error('Unable to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = selectedCategoryFilter === 'All'
    ? products
    : products.filter(p => p.category_name === selectedCategoryFilter);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-welcome">Manage Products</h1>
            <p className="dashboard-date">Upload photos and manage product listings for your catalog.</p>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {productToDelete && (
          <div className="modal-overlay" onClick={() => setProductToDelete(null)}>
            <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="delete-modal-icon-badge">
                  <FiAlertTriangle />
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setProductToDelete(null)} style={{ padding: '6px' }}>
                  <FiX size={18} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 8px 0', color: '#ffffff' }}>
                Confirm Delete Product
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                Are you sure you want to delete this product? This action cannot be undone and will permanently remove it from the customer store catalog.
              </p>

              {/* Product Preview Box */}
              <div className="delete-product-preview">
                <img
                  src={getProductImage(productToDelete)}
                  alt={productToDelete.name}
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                  onError={(e) => handleImageError(e, productToDelete)}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#ffffff' }}>{productToDelete.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {productToDelete.category_name || 'Uncategorized'} • ₹{Number(productToDelete.price).toFixed(2)} • Stock: {productToDelete.stock}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn btn-ghost" onClick={() => setProductToDelete(null)} disabled={deleting}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={deleting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiTrash2 /> {deleting ? 'Deleting...' : 'Yes, Delete Product'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal / Inline Edit Card */}
        {editingProduct && (
          <div className="card admin-form-card" style={{ marginBottom: '24px', border: '2px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>✏️ Edit Product: {editingProduct.name}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingProduct(null)}>
                <FiX /> Cancel
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="auth-form">
              <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input className="form-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select admin-category-select" value={editForm.category_id} onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.icon} {category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" step="0.01" className="form-input" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-input" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} required />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="admin-photo-section-bg">
                <label className="form-label" style={{ fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light, #6C63FF)' }}>
                  <FiImage size={18} /> Product Photo Upload
                </label>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Image Preview Box */}
                  <div className="photo-preview-box">
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '28px' }}>🖼️</span>
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                    {/* Upload File Input */}
                    <div>
                      <label htmlFor="edit-image-upload" className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <FiUpload /> Upload New Photo File
                      </label>
                      <input
                        id="edit-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleEditFileChange}
                        style={{ display: 'none' }}
                      />
                      {editImageFile && <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: 'var(--primary-light)' }}>{editImageFile.name}</span>}
                    </div>

                    {/* Or URL input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR Image URL:</span>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://images.unsplash.com/..."
                        value={editForm.image_url}
                        onChange={(e) => {
                          setEditForm({ ...editForm, image_url: e.target.value });
                          setEditImageFile(null);
                          setEditImagePreview(e.target.value);
                        }}
                        style={{ flex: 1, fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editForm.is_featured} onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })} />
                  Mark as Featured Product
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditingProduct(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary"><FiCheck /> Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Add Product Form */}
        <div className="card admin-form-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}><FiPlus style={{ marginRight: '6px' }} /> Add New Product</h3>
          <form onSubmit={handleCreateSubmit} className="auth-form">
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input className="form-input" placeholder="e.g. Wireless Keyboard" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select admin-category-select" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.icon} {category.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input type="number" step="0.01" className="form-input" placeholder="299.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input type="number" className="form-input" placeholder="50" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="admin-photo-section-bg">
              <label className="form-label" style={{ fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light, #6C63FF)' }}>
                <FiImage size={18} /> Product Photo Upload
              </label>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Image Preview */}
                <div className="photo-preview-box">
                  {imagePreview || form.image_url ? (
                    <img src={imagePreview || form.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '28px', opacity: 0.5 }}>🖼️</span>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                  <div>
                    <label htmlFor="create-image-upload" className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <FiUpload /> Upload Photo File
                    </label>
                    <input
                      id="create-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    {imageFile && <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: 'var(--primary-light)' }}>{imageFile.name}</span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR Image URL:</span>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://images.unsplash.com/..."
                      value={form.image_url}
                      onChange={(e) => {
                        setForm({ ...form, image_url: e.target.value });
                        setImageFile(null);
                        setImagePreview(e.target.value);
                      }}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="2" placeholder="Product details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                Mark as Featured Product
              </label>
              <button type="submit" className="btn btn-primary">
                <FiPlus /> Create Product
              </button>
            </div>
          </form>
        </div>

        {/* Existing Products List */}
        <div className="card admin-panel-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <h3>Existing Products ({filteredProducts.length})</h3>

            {/* Category Filter Pills Bar */}
            <div className="admin-category-pills-bar" style={{ margin: 0, padding: '8px 12px' }}>
              <button
                className={`category-pill-tag ${selectedCategoryFilter === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryFilter('All')}
                style={selectedCategoryFilter === 'All' ? { background: '#6C63FF', color: '#fff' } : {}}
              >
                All ({products.length})
              </button>
              {categories.map((cat) => {
                const style = getCategoryColor(cat.name);
                const isSelected = selectedCategoryFilter === cat.name;
                return (
                  <button
                    key={cat.id}
                    className={`category-pill-tag ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedCategoryFilter(cat.name)}
                    style={{
                      background: isSelected ? style.text : style.bg,
                      color: isSelected ? '#fff' : style.text,
                      borderColor: style.border,
                    }}
                  >
                    <span>{cat.icon}</span> {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : filteredProducts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '16px' }}>No products found in this category.</p>
          ) : (
            <div className="orders-list">
              {filteredProducts.map((product) => {
                const catStyle = getCategoryColor(product.category_name);
                return (
                  <div key={product.id} className="order-list-item" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px' }}>
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                      onError={(e) => handleImageError(e, product)}
                    />
                    <div className="order-list-info" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="order-list-id" style={{ fontWeight: '600', fontSize: '1rem' }}>{product.name}</span>
                        <span style={{
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: catStyle.bg,
                          color: catStyle.text,
                          border: `1px solid ${catStyle.border}`
                        }}>
                          {product.category_icon || '📦'} {product.category_name || 'Uncategorized'}
                        </span>
                      </div>
                      <span className="order-list-date">
                        ₹{Number(product.price).toFixed(2)} • Stock: {product.stock} units
                      </span>
                    </div>
                    <div className="order-list-right" style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(product)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiEdit2 size={13} /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setProductToDelete(product)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiTrash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminProductsPage;
