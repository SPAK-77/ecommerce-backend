import { useEffect, useState } from 'react';
import { usersAPI } from '../api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const AdminCustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Unable to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-welcome">Manage Customers</h1>
            <p className="dashboard-date">View customer accounts and roles.</p>
          </div>
        </div>

        <div className="card admin-panel-card">
          <h3 style={{ marginBottom: '16px' }}>Customers</h3>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <p>No customers found.</p>
          ) : (
            <div className="orders-list">
              {users.map((user) => (
                <div key={user.id} className="order-list-item">
                  <div className="order-list-info">
                    <span className="order-list-id">{user.name}</span>
                    <span className="order-list-date">{user.email}</span>
                  </div>
                  <div className="order-list-right">
                    <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>{user.role}</span>
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

export default AdminCustomersPage;
