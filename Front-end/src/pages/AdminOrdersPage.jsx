import { useEffect, useState } from 'react';
import { ordersAPI } from '../api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiMapPin, FiUser, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getProductImage, handleImageError } from '../utils/productImages';
import './Dashboard.css';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'delivered': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)', icon: <FiCheckCircle /> };
    case 'shipped': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)', icon: <FiTruck /> };
    case 'processing': return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)', icon: <FiPackage /> };
    case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', icon: <FiXCircle /> };
    default: return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', icon: <FiClock /> };
  }
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = async () => {
    try {
      const res = await ordersAPI.adminGetAll();
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error('Unable to load customer orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
      await loadData();
    } catch (err) {
      toast.error('Unable to update order status');
    }
  };

  const filteredOrders = statusFilter === 'All'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-welcome">Manage Orders</h1>
            <p className="dashboard-date">Track and process customer orders placed from cart checkout.</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="card admin-panel-card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Filter Orders:</span>
            {['All', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: statusFilter === st ? '1px solid var(--primary-light)' : '1px solid rgba(255,255,255,0.1)',
                  background: statusFilter === st ? 'var(--primary-color)' : 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {st} ({st === 'All' ? orders.length : orders.filter(o => o.status === st).length})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List Card */}
        <div className="card admin-panel-card">
          <h3 style={{ marginBottom: '16px' }}>Customer Orders ({filteredOrders.length})</h3>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <FiPackage size={40} style={{ opacity: 0.5, marginBottom: '10px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No customer orders found under this filter.</p>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const statusStyle = getStatusBadgeClass(order.status);
                const addr = order.address || {};

                return (
                  <div
                    key={order.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      marginBottom: '14px',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Header Row */}
                    <div
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(108, 99, 255, 0.15)', border: '1px solid rgba(108, 99, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                          <FiPackage size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#ffffff' }}>Order #{order.id}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiCalendar size={12} /> {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiUser size={13} /> {order.customer_name} ({order.email})
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
                          ₹{Number(order.total).toFixed(2)}
                        </span>

                        {/* Status Select */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="admin-category-select"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: statusStyle.bg,
                              color: statusStyle.text,
                              borderColor: statusStyle.border,
                              cursor: 'pointer',
                            }}
                          >
                            <option value="pending">🟡 Pending</option>
                            <option value="processing">🟣 Processing</option>
                            <option value="shipped">🔵 Shipped</option>
                            <option value="delivered">🟢 Delivered</option>
                            <option value="cancelled">🔴 Cancelled</option>
                          </select>
                        </div>

                        <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                          {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px', background: 'rgba(15, 23, 42, 0.4)' }}>
                        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '16px' }}>
                          {/* Shipping Address */}
                          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <h5 style={{ margin: '0 0 8px', color: 'var(--primary-light)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FiMapPin /> Delivery Address
                            </h5>
                            {addr.fullName ? (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                <strong>{addr.fullName}</strong> ({addr.phone})<br />
                                {addr.street}, {addr.city}<br />
                                Pincode: {addr.pincode}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Standard Shipping Address</span>
                            )}
                          </div>

                          {/* Payment & Status Info */}
                          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <h5 style={{ margin: '0 0 8px', color: 'var(--primary-light)', fontSize: '0.9rem' }}>
                              💳 Payment & Order Details
                            </h5>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                              Payment Method: <span style={{ color: '#fbbf24', fontWeight: '600' }}>Cash on Delivery / Test Order</span><br />
                              Payment Status: <span style={{ textTransform: 'capitalize', color: order.payment_status === 'paid' ? '#10b981' : '#fbbf24' }}>{order.payment_status}</span><br />
                              Order Notes: <span style={{ color: 'var(--text-muted)' }}>{order.notes || 'None'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items Table */}
                        <h5 style={{ margin: '0 0 10px', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          📦 Ordered Products ({(order.items || []).length})
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(order.items || []).map((item) => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img
                                  src={getProductImage(item)}
                                  alt={item.product_name}
                                  style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                  onError={(e) => handleImageError(e, item)}
                                />
                                <div>
                                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#ffffff' }}>{item.product_name}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{Number(item.price).toFixed(2)} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}</div>
                                </div>
                              </div>
                              <span style={{ fontWeight: '600', color: 'var(--primary-light)', fontSize: '0.9rem' }}>
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

export default AdminOrdersPage;
