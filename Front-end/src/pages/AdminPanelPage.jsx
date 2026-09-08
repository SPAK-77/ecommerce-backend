import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, ordersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const AdminPanelPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          adminAPI.getStats(),
          ordersAPI.adminGetAll(),
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="loading-page"><div className="spinner" /></div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-welcome">Admin Panel</h1>
            <p className="dashboard-date">Welcome back, {user?.name}</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{stats?.stats?.total_products ?? 0}</div>
            <div className="stat-label">Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats?.stats?.total_users ?? 0}</div>
            <div className="stat-label">Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-value">{stats?.stats?.total_orders ?? 0}</div>
            <div className="stat-label">Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{Number(stats?.stats?.total_revenue || 0).toFixed(0)}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card dashboard-card admin-hero-card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3>Recent Orders</h3>
              <Link to="/admin/orders" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            {orders.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>No orders found.</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="order-list-item">
                    <div className="order-list-info">
                      <span className="order-list-id">Order #{order.id}</span>
                      <span className="order-list-date">{order.customer_name}</span>
                    </div>
                    <div className="order-list-right">
                      <span className="order-list-price">₹{Number(order.total).toFixed(2)}</span>
                      <span className={`badge ${order.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card dashboard-card">
            <h3 style={{ marginBottom: '16px' }}>Quick Actions</h3>
            <div className="quick-links">
              <Link to="/admin/products" className="quick-link">
                <span className="quick-link-icon">📦</span>
                <span className="quick-link-label">Manage Products</span>
              </Link>
              <Link to="/admin/categories" className="quick-link">
                <span className="quick-link-icon">🏷️</span>
                <span className="quick-link-label">Manage Categories</span>
              </Link>
              <Link to="/admin/orders" className="quick-link">
                <span className="quick-link-icon">📋</span>
                <span className="quick-link-label">Manage Orders</span>
              </Link>
              <Link to="/admin/users" className="quick-link">
                <span className="quick-link-icon">👥</span>
                <span className="quick-link-label">Manage Customers</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanelPage;
