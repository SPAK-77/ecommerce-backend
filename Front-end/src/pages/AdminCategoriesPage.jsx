import { useEffect, useState } from 'react';
import { categoriesAPI } from '../api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { FiPlus, FiTrash2, FiAlertTriangle, FiX, FiSmile, FiEdit2, FiCheck } from 'react-icons/fi';
import './Dashboard.css';

const EMOJI_PALETTE = [
  // Stationery & Office
  '✏️', '📝', '📚', '📎', '📁', '📌', '✂️', '🖊️', '🎒', '📖',
  // Food & Snacks
  '🍪', '🍿', '🍫', '🥨', '🍬', '🍩', '🍕', '🍔', '🥪', '🥗',
  // Beverages
  '☕', '🍵', '🥤', '🧃', '🥛', '🍺', '🍾', '🧊', '🧋', '🍷',
  // Electronics & Gadgets
  '💡', '💻', '📱', '🎧', '🔌', '🔋', '🖱️', '⌨️', '📷', '📺',
  // Cleaning & Hygiene
  '🧹', '🧼', '🧻', '🪠', '🧴', '🧽', '🧺', '🫧', '🛁', '🚿',
  // Furniture & Workplace
  '🪑', '🛋️', '🛏️', '🚪', '📦', '💼', '🎁', '🚀', '🛠️', '🏷️',
];

const getCategoryColor = (catName) => {
  const name = (catName || '').toLowerCase();
  if (name.includes('stationery')) return { bg: 'linear-gradient(135deg, rgba(108, 99, 255, 0.18) 0%, rgba(147, 51, 234, 0.12) 100%)', text: '#818cf8', border: 'rgba(108, 99, 255, 0.35)' };
  if (name.includes('snack')) return { bg: 'linear-gradient(135deg, rgba(255, 107, 107, 0.18) 0%, rgba(249, 115, 22, 0.12) 100%)', text: '#ff8787', border: 'rgba(255, 107, 107, 0.35)' };
  if (name.includes('beverag')) return { bg: 'linear-gradient(135deg, rgba(0, 200, 150, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)', text: '#34d399', border: 'rgba(0, 200, 150, 0.35)' };
  if (name.includes('electron')) return { bg: 'linear-gradient(135deg, rgba(255, 184, 0, 0.18) 0%, rgba(234, 179, 8, 0.12) 100%)', text: '#fbbf24', border: 'rgba(255, 184, 0, 0.35)' };
  if (name.includes('clean')) return { bg: 'linear-gradient(135deg, rgba(0, 212, 255, 0.18) 0%, rgba(14, 165, 233, 0.12) 100%)', text: '#38bdf8', border: 'rgba(0, 212, 255, 0.35)' };
  if (name.includes('furnit')) return { bg: 'linear-gradient(135deg, rgba(255, 127, 80, 0.18) 0%, rgba(244, 63, 94, 0.12) 100%)', text: '#fb923c', border: 'rgba(255, 127, 80, 0.35)' };
  return { bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)', text: 'var(--text-primary)', border: 'rgba(255, 255, 255, 0.18)' };
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category Form State
  const [form, setForm] = useState({ name: '', icon: '📦', description: '' });

  // Edit Category Form State
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', icon: '📦', description: '' });

  // Delete Modal State
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.categories || []);
    } catch (err) {
      toast.error('Unable to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      await categoriesAPI.create({
        name: form.name.trim(),
        icon: form.icon || '📦',
        description: form.description.trim(),
      });
      toast.success('Category created with emoji icon!');
      setForm({ name: '', icon: '📦', description: '' });
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create category');
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name || '',
      icon: category.icon || '📦',
      description: category.description || '',
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      await categoriesAPI.update(editingCategory.id, {
        name: editForm.name.trim(),
        icon: editForm.icon || '📦',
        description: editForm.description.trim(),
      });
      toast.success('Category updated successfully!');
      setEditingCategory(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update category');
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await categoriesAPI.delete(categoryToDelete.id);
      toast.success(`Category "${categoryToDelete.name}" was removed`);
      setCategoryToDelete(null);
      await loadData();
    } catch (err) {
      toast.error('Unable to delete category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-welcome">Manage Categories</h1>
            <p className="dashboard-date">Select emoji icons and manage store product categories.</p>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {categoryToDelete && (
          <div className="modal-overlay" onClick={() => setCategoryToDelete(null)}>
            <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="delete-modal-icon-badge">
                  <FiAlertTriangle />
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setCategoryToDelete(null)} style={{ padding: '6px' }}>
                  <FiX size={18} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 8px 0', color: '#ffffff' }}>
                Confirm Delete Category
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                Are you sure you want to delete this category? This action cannot be undone.
              </p>

              <div className="delete-product-preview">
                <span style={{ fontSize: '2.4rem', padding: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                  {categoryToDelete.icon || '📦'}
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: '700' }}>
                    {categoryToDelete.name}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {categoryToDelete.product_count || 0} Products linked
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn btn-ghost" onClick={() => setCategoryToDelete(null)} disabled={deleting}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={deleting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiTrash2 /> {deleting ? 'Deleting...' : 'Yes, Delete Category'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Form */}
        {editingCategory && (
          <div className="card admin-form-card" style={{ marginBottom: '24px', border: '2px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>✏️ Edit Category: {editingCategory.name}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingCategory(null)}>
                <FiX /> Cancel
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="auth-form">
              <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input className="form-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Selected Emoji Icon</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', border: '1.5px solid rgba(108,99,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                      {editForm.icon || '📦'}
                    </div>
                    <input className="form-input" style={{ flex: 1 }} value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} placeholder="Type custom emoji..." />
                  </div>
                </div>
              </div>

              {/* Emoji Picker Section */}
              <div className="admin-photo-section-bg" style={{ margin: '14px 0' }}>
                <label className="form-label" style={{ fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light, #6C63FF)' }}>
                  <FiSmile size={18} /> Choose Category Emoji Icon
                </label>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '140px', overflowY: 'auto', padding: '6px' }}>
                  {EMOJI_PALETTE.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, icon: emoji })}
                      style={{
                        width: '42px',
                        height: '42px',
                        fontSize: '1.4rem',
                        borderRadius: '10px',
                        border: editForm.icon === emoji ? '2px solid var(--primary-light, #6C63FF)' : '1px solid rgba(255,255,255,0.1)',
                        background: editForm.icon === emoji ? 'rgba(108, 99, 255, 0.3)' : 'rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingCategory(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><FiCheck /> Save Changes</button>
              </div>
            </form>
          </div>
        )}

        {/* Add New Category Form */}
        <div className="card admin-form-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}><FiPlus style={{ marginRight: '6px' }} /> Add New Category</h3>
          <form onSubmit={handleCreateSubmit} className="auth-form">
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input className="form-input" placeholder="e.g. Stationery" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Selected Emoji Icon</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', border: '1.5px solid rgba(108,99,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                    {form.icon || '📦'}
                  </div>
                  <input className="form-input" style={{ flex: 1 }} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Type custom emoji..." />
                </div>
              </div>
            </div>

            {/* Emoji Selection Palette */}
            <div className="admin-photo-section-bg" style={{ margin: '14px 0' }}>
              <label className="form-label" style={{ fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light, #6C63FF)' }}>
                <FiSmile size={18} /> Select Category Emoji Icon
              </label>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '140px', overflowY: 'auto', padding: '6px' }}>
                {EMOJI_PALETTE.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm({ ...form, icon: emoji })}
                    style={{
                      width: '42px',
                      height: '42px',
                      fontSize: '1.4rem',
                      borderRadius: '10px',
                      border: form.icon === emoji ? '2px solid var(--primary-light, #6C63FF)' : '1px solid rgba(255,255,255,0.1)',
                      background: form.icon === emoji ? 'rgba(108, 99, 255, 0.3)' : 'rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="2" placeholder="Brief category description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-primary"><FiPlus /> Create Category</button>
          </form>
        </div>

        {/* Existing Categories Grid */}
        <div className="card admin-panel-card">
          <h3 style={{ marginBottom: '16px' }}>Existing Categories ({categories.length})</h3>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : categories.length === 0 ? (
            <p>No categories yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {categories.map((category) => {
                const style = getCategoryColor(category.name);
                return (
                  <div
                    key={category.id}
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      borderRadius: '14px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      gap: '12px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
                        {category.icon || '📦'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: style.text }}>
                          {category.name}
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {category.description || 'No description provided'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {category.product_count || 0} Products
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(category)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiEdit2 size={13} /> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setCategoryToDelete(category)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiTrash2 size={13} /> Delete
                        </button>
                      </div>
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

export default AdminCategoriesPage;
