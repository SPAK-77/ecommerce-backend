import { useEffect, useState } from 'react';
import { productsAPI } from '../api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const AdminOffersPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await productsAPI.getAll({ limit: 100 });
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error('Unable to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleOffer = async (product) => {
    try {
      await productsAPI.update(product.id, {
        category_id: product.category_id || 1,
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        is_featured: !product.is_featured,
      });
      toast.success(product.is_featured ? 'Offer removed' : 'Offer added');
      await loadData();
    } catch (err) {
      toast.error('Unable to update offer');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-welcome">Manage Offers</h1>
            <p className="dashboard-date">Turn products into featured offers from here.</p>
          </div>
        </div>

        <div className="card admin-panel-card">
          <h3 style={{ marginBottom: '16px' }}>Featured Offers</h3>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="orders-list">
              {products.map((product) => (
                <div key={product.id} className="order-list-item">
                  <div className="order-list-info">
                    <span className="order-list-id">{product.name}</span>
                    <span className="order-list-date">₹{Number(product.price).toFixed(2)} • Stock: {product.stock}</span>
                  </div>
                  <div className="order-list-right">
                    <span className={`badge ${product.is_featured ? 'badge-success' : 'badge-warning'}`}>
                      {product.is_featured ? 'Active Offer' : 'Not Featured'}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleOffer(product)}>
                      {product.is_featured ? 'Remove Offer' : 'Add Offer'}
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

export default AdminOffersPage;
