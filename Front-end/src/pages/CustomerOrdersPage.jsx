import { useEffect, useState } from 'react';
import { ordersAPI } from '../api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle,
  FiMapPin, FiCalendar, FiX, FiRefreshCw, FiShoppingBag, FiChevronRight, FiFileText, FiAlertTriangle, FiAlertCircle
} from 'react-icons/fi';
import { getProductImage, handleImageError } from '../utils/productImages';
import './Dashboard.css';

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

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cancellation confirmation popup state
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const { addToCart } = useCart();

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error('Unable to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleConfirmCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      await ordersAPI.cancel(orderId);
      toast.success(`Order #ORD-${orderId} cancelled & removed from placed orders!`);
      setOrderToCancel(null);
      setSelectedOrder(null);
      await loadOrders();
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

  const activeOrders = orders.filter(o => o.status !== 'cancelled');

  const filteredOrders = statusFilter === 'All'
    ? activeOrders
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-welcome">My Orders</h1>
            <p className="dashboard-date">View order details and cancel within 4 hours of ordering.</p>
          </div>
          <Link to="/products" className="btn btn-primary">
            <FiShoppingBag /> Browse Products
          </Link>
        </div>

        {/* Status Filter Pills */}
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
                {st === 'All' ? `Placed Orders (${activeOrders.length})` : `${st} (${orders.filter(o => o.status === st).length})`}
              </button>
            ))}
          </div>
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
                    <FiCalendar size={13} /> Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

              {/* Delivery Address & Payment Breakdown */}
              <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {/* Delivery Address */}
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

                {/* Price Breakdown */}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Shipping:</span>
                      <span style={{ color: Number(selectedOrder.shipping) === 0 ? '#10b981' : 'inherit' }}>
                        {Number(selectedOrder.shipping) === 0 ? 'FREE' : `₹${Number(selectedOrder.shipping).toFixed(2)}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '6px', fontWeight: '700', color: '#ffffff' }}>
                      <span>Total Paid:</span>
                      <span style={{ color: '#10b981', fontSize: '1.05rem' }}>₹{Number(selectedOrder.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
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

        {/* Cancel Order Confirmation Pop-up Menu (Rendered IN FRONT of observing modal) */}
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

        {/* Customer Orders List Card */}
        <div className="card admin-panel-card">
          <h3 style={{ marginBottom: '16px' }}>Your Placed Orders ({filteredOrders.length})</h3>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-icon">📦</div>
              <h3>No orders found</h3>
              <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders matching this filter yet.</p>
              <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>
                <FiShoppingBag /> Start Shopping
              </Link>
            </div>
          ) : (
            <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredOrders.map((order) => {
                const st = getStatusConfig(order.status);
                const cancelInfo = getCancelWindowInfo(order.created_at, order.status);
                const itemsCount = (order.items || []).reduce((sum, i) => sum + i.quantity, 0);

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    }}
                    className="order-card-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Product Preview Thumbnails Stack */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {(order.items || []).slice(0, 3).map((item, idx) => (
                          <img
                            key={item.id || idx}
                            src={getProductImage({ name: item.product_name, image: item.image })}
                            alt={item.product_name}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              border: '2px solid #1e1b4b',
                              marginLeft: idx > 0 ? '-14px' : '0',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                            onError={(e) => handleImageError(e, { name: item.product_name })}
                          />
                        ))}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#ffffff' }}>
                            Order #ORD-{order.id}
                          </span>
                          <span style={{
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: st.bg,
                            color: st.text,
                            border: `1px solid ${st.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {st.icon} {st.label}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span><FiCalendar size={12} /> {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{itemsCount} item{itemsCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {cancelInfo.canCancel && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToCancel(order);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
                        >
                          <FiXCircle size={13} /> Cancel ({cancelInfo.timeLeft.split(' ')[0]})
                        </button>
                      )}

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981', display: 'block' }}>
                          ₹{Number(order.total).toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>
                          Click to View Products
                        </span>
                      </div>

                      <button className="btn btn-secondary btn-sm" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        View Details <FiChevronRight />
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

export default CustomerOrdersPage;
