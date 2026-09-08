import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import './AuthPages.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, phone } = formData;
    if (!name || !email || !password) { toast.error('Please fill all required fields'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    try {
      setLoading(true);
      const res = await authAPI.register({ name, email, password, phone });
      login(res.data.user, res.data.token);
      toast.success('Account created successfully! 🎉');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-orb-1" />
      <div className="auth-bg-orb auth-orb-2" />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">🛒 <span className="brand-flip">FLIP</span><span className="brand-zone">ZONE</span></Link>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join thousands of businesses using FLIPZONE</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-icon-wrapper">
                <FiUser className="input-icon" />
                <input type="text" name="name" id="signup-name" className="form-input" placeholder="John Doe" value={formData.name} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="input-icon-wrapper">
                <FiMail className="input-icon" />
                <input type="email" name="email" id="signup-email" className="form-input" placeholder="you@company.com" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-icon-wrapper">
                <FiPhone className="input-icon" />
                <input type="tel" name="phone" id="signup-phone" className="form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input type={showPass ? 'text' : 'password'} name="password" id="signup-password" className="form-input" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} style={{ paddingRight: '44px' }} />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input type="password" name="confirmPassword" id="signup-confirm" className="form-input" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" id="signup-submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : <><FiArrowRight /> Create Account</>}
            </button>
          </form>

          <p className="auth-terms">
            By signing up you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </p>
          <p className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>

        <div className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-visual-icon animate-float">🎉</div>
            <h2>Join E-Store Today</h2>
            <p>Access all company essentials in one place. Setup takes less than a minute.</p>
            <div className="auth-visual-features">
              {['🆓 Free to Register', '📦 500+ Products', '⚡ Instant Access', '💳 Secure Checkout'].map(f => (
                <div key={f} className="auth-visual-feature">{f}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
