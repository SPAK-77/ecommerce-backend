import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ordersAPI } from '../api';
import toast from 'react-hot-toast';
import {
  FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight,
  FiCheckCircle, FiX, FiMapPin, FiPhone, FiUser, FiPackage,
  FiTruck, FiCreditCard, FiSmartphone, FiCheck
} from 'react-icons/fi';
import { getProductImage, handleImageError } from '../utils/productImages';
import './CartPage.css';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', short: 'GPay', icon: '🟢', color: '#4285F4', handle: '@okaxis', example: 'name@okaxis' },
  { id: 'phonepe', name: 'PhonePe', short: 'PhonePe', icon: '🟣', color: '#5f259f', handle: '@ybl', example: '9876543210@ybl' },
  { id: 'paytm', name: 'Paytm UPI', short: 'Paytm', icon: '🔵', color: '#00baf2', handle: '@paytm', example: '9876543210@paytm' },
  { id: 'bhim', name: 'BHIM UPI', short: 'BHIM', icon: '🟠', color: '#ff6600', handle: '@upi', example: 'user@upi' },
  { id: 'other', name: 'Other UPI ID', short: 'Other VPA', icon: '📱', color: '#10b981', handle: '', example: 'username@bank' },
];

const CartPage = () => {
  const { items, total, loading, updateQuantity, removeFromCart, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Checkout modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Payment choice state: 'cod' or 'upi'
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');

  // Address & Checkout Form State
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    pincode: '',
    notes: '',
  });

  const subtotal = total;
  const tax = subtotal * 0.18;
  const shipping = subtotal > 500 ? 0 : 50;
  const grandTotal = subtotal + tax + shipping;

  const handleAppSelect = (appId) => {
    setSelectedUpiApp(appId);
    const appObj = UPI_APPS.find(a => a.id === appId);
    if (addressForm.phone && appObj && appObj.handle) {
      setUpiId(`${addressForm.phone.replace(/[^0-9]/g, '')}${appObj.handle}`);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.street || !addressForm.city || !addressForm.pincode) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    if (paymentMethod === 'upi' && !upiId.trim()) {
      toast.error('Please enter your UPI VPA Address');
      return;
    }

    const appObj = UPI_APPS.find(a => a.id === selectedUpiApp);
    const finalPaymentMethod = paymentMethod === 'upi'
      ? `UPI (${appObj ? appObj.name : 'UPI'})`
      : 'cod';

    setPlacingOrder(true);
    try {
      const addressData = {
        fullName: addressForm.fullName,
        phone: addressForm.phone,
        street: addressForm.street,
        city: addressForm.city,
        pincode: addressForm.pincode,
        upiApp: paymentMethod === 'upi' ? appObj?.name : null,
        upiId: paymentMethod === 'upi' ? upiId.trim() : null,
      };

      const res = await ordersAPI.place({
        address: addressData,
        payment_method: finalPaymentMethod,
        notes: addressForm.notes || (paymentMethod === 'upi' ? `Paid via ${appObj?.name} (${upiId.trim()})` : 'Cash on Delivery order'),
      });

      toast.success(paymentMethod === 'upi' ? `🎉 ${appObj?.name} Payment Verified & Order Placed!` : '🎉 Order Placed (Cash on Delivery)!');
      const createdOrderId = res.data?.orderId;
      setOrderSuccess({
        orderId: createdOrderId,
        total: grandTotal,
        itemsCount: itemCount,
        paymentMethod: finalPaymentMethod,
        upiApp: appObj?.name,
        upiId: paymentMethod === 'upi' ? upiId.trim() : null,
      });

      setShowCheckoutModal(false);
      await clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="loading-page"><div className="spinner" /></div>
      </main>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="section-title">🛒 Shopping Cart</h1>
            <p className="section-subtitle">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          {itemCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--danger-light)' }}>
              <FiTrash2 /> Clear Cart
            </button>
          )}
        </div>

        {/* Order Success Popup */}
        {orderSuccess && (
          <div className="modal-overlay confirm-overlay" onClick={() => setOrderSuccess(null)}>
            <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🎉</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>
                Order Placed Successfully!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Your order ID is <strong>#{orderSuccess.orderId ? `ORD-${orderSuccess.orderId}` : 'Success'}</strong>
              </p>

              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                  <strong style={{ color: '#10b981' }}>{orderSuccess.paymentMethod.toUpperCase()}</strong>
                </div>
                {orderSuccess.upiId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>UPI Address:</span>
                    <strong style={{ color: '#38bdf8' }}>{orderSuccess.upiId}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                  <strong style={{ color: '#ffffff' }}>₹{orderSuccess.total.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cancellation Window:</span>
                  <strong style={{ color: '#fbbf24' }}>4 Hours Flexible</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => { setOrderSuccess(null); navigate('/orders'); }}>
                  Track Order in My Orders →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Address & Payment Choice Modal */}
        {showCheckoutModal && (
          <div className="modal-overlay" onClick={() => setShowCheckoutModal(false)}>
            <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiMapPin style={{ color: '#38bdf8' }} /> Shipping Address & Payment Selection
                </h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowCheckoutModal(false)} style={{ padding: '6px' }}>
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder}>
                {/* Section 1: Shipping Address */}
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiTruck /> Shipping Information
                </h4>

                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiUser size={14} /> Full Name
                    </label>
                    <input
                      className="form-input"
                      placeholder="John Doe"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiPhone size={14} /> Contact Phone Number
                    </label>
                    <input
                      className="form-input"
                      placeholder="9876543210"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label className="form-label">Street Address / House No.</label>
                  <input
                    className="form-input"
                    placeholder="123 Main Street, Flat No. 4B"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    required
                  />
                </div>

                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      className="form-input"
                      placeholder="Mumbai"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input
                      className="form-input"
                      placeholder="400001"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Section 2: Choose Payment Method */}
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--primary-light)', margin: '22px 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCreditCard /> Choose Payment Method
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  {/* Option A: Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: paymentMethod === 'cod' ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                      background: paymentMethod === 'cod' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div style={{ fontSize: '2rem' }}>💵</div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff' }}>Cash on Delivery</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.3' }}>
                        Pay cash when products arrive at your doorstep.
                      </div>
                    </div>
                  </div>

                  {/* Option B: UPI Payment */}
                  <div
                    onClick={() => setPaymentMethod('upi')}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: paymentMethod === 'upi' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      background: paymentMethod === 'upi' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div style={{ fontSize: '2rem' }}>📱</div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff' }}>UPI Instant Payment</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.3' }}>
                        GPay, PhonePe, Paytm & BHIM UPI.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive UPI App Provider Selector */}
                {paymentMethod === 'upi' && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '16px', marginBottom: '18px' }}>
                    <label className="form-label" style={{ color: '#10b981', fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <FiSmartphone /> Select Preferred UPI App Provider:
                    </label>

                    {/* UPI App Provider Tiles */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                      {UPI_APPS.map((app) => {
                        const isSelected = selectedUpiApp === app.id;
                        return (
                          <div
                            key={app.id}
                            onClick={() => handleAppSelect(app.id)}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '12px',
                              border: isSelected ? `2px solid ${app.color}` : '1px solid rgba(255,255,255,0.12)',
                              background: isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.2)',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? `0 0 12px ${app.color}40` : 'none',
                            }}
                          >
                            <div style={{ fontSize: '1.3rem', marginBottom: '2px' }}>{app.icon}</div>
                            <div style={{ fontWeight: '700', fontSize: '0.78rem', color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                              {app.short}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected App VPA Input */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          Enter {UPI_APPS.find(a => a.id === selectedUpiApp)?.name} VPA ID:
                        </span>
                        {UPI_APPS.find(a => a.id === selectedUpiApp)?.handle && (
                          <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                            Default handle: {UPI_APPS.find(a => a.id === selectedUpiApp)?.handle}
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        className="form-input"
                        placeholder={`e.g. ${UPI_APPS.find(a => a.id === selectedUpiApp)?.example}`}
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required={paymentMethod === 'upi'}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          ⚡ Instant verification enabled for {UPI_APPS.find(a => a.id === selectedUpiApp)?.name}
                        </span>
                        {addressForm.phone && UPI_APPS.find(a => a.id === selectedUpiApp)?.handle && (
                          <button
                            type="button"
                            onClick={() => setUpiId(`${addressForm.phone.replace(/[^0-9]/g, '')}${UPI_APPS.find(a => a.id === selectedUpiApp)?.handle}`)}
                            style={{ background: 'transparent', border: 'none', color: '#10b981', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Use Phone ({addressForm.phone.replace(/[^0-9]/g, '')}{UPI_APPS.find(a => a.id === selectedUpiApp)?.handle})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Delivery Notes (Optional)</label>
                  <input
                    className="form-input"
                    placeholder="Leave at front desk or call before delivery..."
                    value={addressForm.notes}
                    onChange={(e) => setAddressForm({ ...addressForm, notes: e.target.value })}
                  />
                </div>

                {/* Order Summary inside Modal */}
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Items ({itemCount}):</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>GST (18%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Shipping:</span>
                    <span style={{ color: shipping === 0 ? '#10b981' : 'inherit' }}>
                      {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem', color: '#ffffff' }}>
                    <span>Grand Total:</span>
                    <span style={{ color: '#10b981' }}>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowCheckoutModal(false)} disabled={placingOrder}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={placingOrder} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px' }}>
                    {placingOrder ? 'Processing Order...' : `Confirm Order (₹${grandTotal.toFixed(2)})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="card text-center empty-cart-card">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any products to your cart yet.</p>
            <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Explore Products <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* Cart Items List */}
            <div className="cart-items-column">
              {items.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="cart-item-image"
                    onError={(e) => handleImageError(e, item)}
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-category">{item.category_name}</span>
                    <h3 className="cart-item-name">{item.name}</h3>
                    <div className="cart-item-price">₹{Number(item.price).toFixed(2)}</div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock || 999)}
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <div className="cart-item-subtotal">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>

                    <button className="remove-btn" onClick={() => removeFromCart(item.id)} title="Remove item">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary Column */}
            <div className="cart-summary-column">
              <div className="card cart-summary-card">
                <h3 className="summary-title">Order Summary</h3>

                <div className="summary-row">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Estimated GST (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <strong style={{ color: '#10b981' }}>FREE</strong> : `₹${shipping.toFixed(2)}`}</span>
                </div>

                {subtotal < 500 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--warning)', marginTop: '4px' }}>
                    💡 Add ₹{(500 - subtotal).toFixed(2)} more for FREE Shipping!
                  </p>
                )}

                <div className="summary-divider" />

                <div className="summary-row total-row">
                  <span>Total Amount</span>
                  <span className="grand-total">₹{grandTotal.toFixed(2)}</span>
                </div>

                <button
                  className="btn btn-primary btn-block btn-lg checkout-btn"
                  onClick={() => setShowCheckoutModal(true)}
                  style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  Proceed to Checkout <FiArrowRight />
                </button>

                <div className="summary-guarantees">
                  <div className="guarantee-item">
                    <FiCheckCircle style={{ color: '#10b981' }} /> <span>4-Hour Flexible Order Cancellation</span>
                  </div>
                  <div className="guarantee-item">
                    <FiCheckCircle style={{ color: '#10b981' }} /> <span>GPay, PhonePe, Paytm, BHIM & COD Supported</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
