import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Sidebar from '../components/Sidebar';
import {
  FiPackage, FiShoppingCart, FiClipboard, FiArrowRight,
  FiClock, FiCheckCircle, FiTruck, FiXCircle, FiX, FiMapPin, FiFileText, FiRefreshCw, FiAlertTriangle, FiAlertCircle
} from 'react-icons/fi';
import { getProductImage, handleImageError } from '../utils/productImages';
import toast from 'react-hot-toast';
import './Dashboard.css';

const getStatusBadge = (status) => {
  const map = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
  };
  return map[status] || 'badge-muted';
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'delivered': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)', icon: <FiCheckCircle />, label: 'Delivered' };
    case 'shipped': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)', icon: <FiTruck />, label: 'Shipped' };
    case 'processing': return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)', icon: <FiPackage />, label: 'Processing' };
    case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', icon: <FiXCircle />, label: 'Cancelled' };
    default: return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', icon: <FiClock />, label: 'Pending' };
  }
};

const getCancelWindowInfo = (createdAt, status) => {
  if (status === 'cancelled' || status === 'delivered' || status === 'shipped') {
    return { canCancel: false, reason: `Order is already ${status}` };
  }
  const orderTime = new Date(createdAt).getTime();
  const now = new Date().getTime();
  const diffMs = (4 * 60 * 60 * 1000) - (now - orderTime); // 4 hours in ms
  if (diffMs <= 0) {
    return { canCancel: false, reason: '4-hour cancellation window passed' };
  }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { canCancel: true, timeLeft: `${hours}h ${mins}m left to cancel` };
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { items: cartItems, total: cartTotal, itemCount, addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cancellation confirmation popup state
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const loadData = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter out cancelled orders from recent orders list & total spent
  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const recentOrders = activeOrders.slice(0, 5);
  const totalSpent = activeOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const handleConfirmCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      await ordersAPI.cancel(orderId);
      toast.success(`Order #ORD-${orderId} cancelled successfully!`);
      setOrderToCancel(null);
      setSelectedOrder(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = async (orderItems) => {
    if (!orderItems || orderItems.length === 0) return;
    try {
      for (const item of orderItems) {
        await addToCart(item.product_id || item.id);
      }
      toast.success('Items added to cart!');
    } catch (err) {
      toast.error('Unable to reorder items');
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-welcome">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="dashboard-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <Link to="/products" className="btn btn-primary">
            <FiShoppingCart /> Browse Products
          </Link>
        </div>

        {/* Order Details Observing Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                      Order #ORD-{selectedOrder.id}
                    </h3>
                    {(() => {
                      const st = getStatusConfig(selectedOrder.status);
                      return (
                        <span style={{
                          padding: '3px 12px',
                          borderRadius: '16px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          background: st.bg,
                          color: st.text,
                          border: `1px solid ${st.border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          {st.icon} {st.label}
                        </span>
                      );
                    })()}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                    <FiClock size={13} /> Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(null)} style={{ padding: '6px' }}>
                  <FiX size={20} />
                </button>
              </div>

              {/* 4-Hour Cancellation Status Alert Banner */}
              {(() => {
                const cancelInfo = getCancelWindowInfo(selectedOrder.created_at, selectedOrder.status);
                if (cancelInfo.canCancel) {
                  return (
                    <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiClock size={20} style={{ color: '#ef4444' }} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#ef4444' }}>
                            Order Cancellation Window Active
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ⏱️ {cancelInfo.timeLeft} (4-hour policy)
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setOrderToCancel(selectedOrder)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <FiXCircle /> Cancel Order
                      </button>
                    </div>
                  );
                } else if (selectedOrder.status !== 'cancelled') {
                  return (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <FiAlertCircle size={16} /> <span>{cancelInfo.reason}</span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Ordered Products Section */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary-light)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiPackage /> Ordered Products ({(selectedOrder.items || []).length})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(selectedOrder.items || []).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        gap: '14px',
                      }}
                    >
                      <img
                        src={getProductImage({ name: item.product_name, image: item.image })}
                        alt={item.product_name}
                        style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                        onError={(e) => handleImageError(e, { name: item.product_name })}
                      />

                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: '700', color: '#ffffff' }}>
                          {item.product_name}
                        </h5>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          ₹{Number(item.price).toFixed(2)} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--primary-light)' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Breakdown */}
              <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h5 style={{ margin: '0 0 8px', color: 'var(--primary-light)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiMapPin /> Delivery Address
                  </h5>
                  {selectedOrder.address ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      <strong>{selectedOrder.address.fullName}</strong> ({selectedOrder.address.phone})<br />
                      {selectedOrder.address.street}, {selectedOrder.address.city}<br />
                      Pincode: {selectedOrder.address.pincode}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Standard Shipping Address</span>
                  )}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h5 style={{ margin: '0 0 8px', color: 'var(--primary-light)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiFileText /> Payment & Invoice
                  </h5>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal:</span>
                      <span>₹{Number(selectedOrder.subtotal || selectedOrder.total * 0.82).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>GST (18%):</span>
                      <span>₹{Number(selectedOrder.tax || selectedOrder.total * 0.18).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '6px', fontWeight: '700', color: '#ffffff' }}>
                      <span>Total Paid:</span>
                      <span style={{ color: '#10b981', fontSize: '1.05rem' }}>₹{Number(selectedOrder.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleReorder(selectedOrder.items)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiRefreshCw /> Reorder All Items
                </button>
                <button className="btn btn-primary" onClick={() => setSelectedOrder(null)}>
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Confirmation Pop-up Menu */}
        {orderToCancel && (
          <div className="modal-overlay confirm-overlay" onClick={() => setOrderToCancel(null)}>
            <div className="delete-modal-card" onClick={(e) => e.stopPropagation()} style={{ border: '2px solid rgba(239, 68, 68, 0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="delete-modal-icon-badge">
                  <FiAlertTriangle />
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setOrderToCancel(null)} style={{ padding: '6px' }}>
                  <FiX size={18} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 8px 0', color: '#ffffff' }}>
                Confirm Order Cancellation
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                Are you sure you want to cancel <strong>Order #ORD-{orderToCancel.id}</strong>? This action will cancel your order and restore the product stock.
              </p>

              {/* Order Summary Box in Modal */}
              <div className="delete-product-preview" style={{ background: 'rgba(255,255,255,0.05)', margin: '16px 0 20px', padding: '12px 14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff', marginBottom: '4px' }}>
                    Order #ORD-{orderToCancel.id} • {(orderToCancel.items || []).length} Product(s)
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Total: <strong style={{ color: '#10b981' }}>₹{Number(orderToCancel.total).toFixed(2)}</strong> • Placed on {new Date(orderToCancel.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Confirmation Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setOrderToCancel(null)} disabled={cancellingId === orderToCancel.id}>
                  Keep Order
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleConfirmCancel(orderToCancel.id)}
                  disabled={cancellingId === orderToCancel.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiXCircle /> {cancellingId === orderToCancel.id ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{activeOrders.length}</div>
            <div className="stat-label">Active Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-value">{itemCount}</div>
            <div className="stat-label">Items in Cart</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{totalSpent.toFixed(0)}</div>
            <div className="stat-label">Total Spent</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{orders.filter(o => o.status === 'delivered').length}</div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Cart Summary */}
          <div className="card dashboard-card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3><FiShoppingCart style={{ marginRight: '8px' }} /> Cart Summary</h3>
              <Link to="/cart" className="btn btn-secondary btn-sm">View Cart <FiArrowRight /></Link>
            </div>
            {cartItems.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <div className="empty-icon">🛒</div>
                <p>Your cart is empty</p>
                <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>Start Shopping</Link>
              </div>
            ) : (
              <div className="cart-summary-list">
                {cartItems.slice(0, 4).map(item => (
                  <div key={item.id} className="cart-summary-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                      onError={(e) => handleImageError(e, item)}
                    />
                    <div className="cart-summary-info" style={{ flex: 1 }}>
                      <span className="cart-summary-name">{item.name}</span>
                      <span className="cart-summary-qty">× {item.quantity}</span>
                    </div>
                    <span className="cart-summary-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {cartItems.length > 4 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '8px' }}>
                    +{cartItems.length - 4} more items
                  </p>
                )}
                <div className="cart-summary-total">
                  <span>Total</span>
                  <span className="price-large">₹{cartTotal.toFixed(2)}</span>
                </div>
                <Link to="/checkout" className="btn btn-primary btn-full" style={{ marginTop: '12px' }}>
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>

          {/* Recent Active Orders */}
          <div className="card dashboard-card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3><FiClipboard style={{ marginRight: '8px' }} /> Recent Orders</h3>
              <Link to="/orders" className="btn btn-secondary btn-sm">View All <FiArrowRight /></Link>
            </div>
            {loading ? (
              <div className="loading-page" style={{ minHeight: '150px' }}><div className="spinner" /></div>
            ) : recentOrders.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <div className="empty-icon">📋</div>
                <p>No active recent orders</p>
              </div>
            ) : (
              <div className="orders-list">
                {recentOrders.map(order => {
                  const cancelInfo = getCancelWindowInfo(order.created_at, order.status);
                  return (
                    <div
                      key={order.id}
                      className="order-list-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="order-list-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="order-list-id">Order #ORD-{order.id}</span>
                          {cancelInfo.canCancel && (
                            <span style={{ fontSize: '0.72rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' }}>
                              ⏱️ {cancelInfo.timeLeft}
                            </span>
                          )}
                        </div>
                        <span className="order-list-date">
                          <FiClock size={12} /> {new Date(order.created_at).toLocaleDateString('en-IN')} • {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="order-list-right">
                        <span className="order-list-price">₹{Number(order.total).toFixed(2)}</span>
                        <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>⚡ Quick Actions</h3>
          <div className="quick-links">
            <Link to="/products" className="quick-link">
              <span className="quick-link-icon">📦</span>
              <span className="quick-link-label">Browse Products</span>
            </Link>
            <Link to="/products?category=Stationery" className="quick-link">
              <span className="quick-link-icon">✏️</span>
              <span className="quick-link-label">Stationery</span>
            </Link>
            <Link to="/products?category=Snacks" className="quick-link">
              <span className="quick-link-icon">🍪</span>
              <span className="quick-link-label">Snacks</span>
            </Link>
            <Link to="/products?category=Beverages" className="quick-link">
              <span className="quick-link-icon">☕</span>
              <span className="quick-link-label">Beverages</span>
            </Link>
            <Link to="/orders" className="quick-link">
              <span className="quick-link-icon">📋</span>
              <span className="quick-link-label">My Orders</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
