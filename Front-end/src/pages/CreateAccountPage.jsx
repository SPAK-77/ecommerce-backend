import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiBriefcase, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthPages.css';
import './CreateAccountPage.css';

const CreateAccountPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', role: '',
    password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) { toast.error('Name and email are required'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password) { toast.error('Password is required'); return; }
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    try {
      setLoading(true);
      const res = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      login(res.data.user, res.data.token);
      toast.success('Account created! Welcome to E-Store 🎉');
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
      <div className="auth-container create-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">🛒 <span className="brand-flip">FLIP</span><span className="brand-zone">ZONE</span></Link>
            <h1 className="auth-title">Set Up Your Account</h1>
            <p className="auth-subtitle">Step {step} of 2 — {step === 1 ? 'Personal Details' : 'Security Setup'}</p>
          </div>

          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'step-active' : 'step-inactive'}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'step-line-done' : ''}`} />
            <div className={`step ${step >= 2 ? 'step-active' : 'step-inactive'}`}>2</div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="auth-form">
              <div className="create-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div className="input-icon-wrapper">
                    <FiUser className="input-icon" />
                    <input type="text" name="name" id="create-name" className="form-input" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <div className="input-icon-wrapper">
                    <FiMail className="input-icon" />
                    <input type="email" name="email" id="create-email" className="form-input" placeholder="you@company.com" value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-icon-wrapper">
                    <FiPhone className="input-icon" />
                    <input type="tel" name="phone" id="create-phone" className="form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Company / Organization</label>
                  <div className="input-icon-wrapper">
                    <FiBriefcase className="input-icon" />
                    <input type="text" name="company" id="create-company" className="form-input" placeholder="Your Company Name" value={formData.company} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Your Role</label>
                <select name="role" id="create-role" className="form-select" value={formData.role} onChange={handleChange}>
                  <option value="">Select your role...</option>
                  <option value="Office Manager">Office Manager</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Admin Executive">Admin Executive</option>
                  <option value="Procurement Manager">Procurement Manager</option>
                  <option value="Employee">Employee</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" id="create-next-btn" className="btn btn-primary btn-full">
                Continue <FiArrowRight />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="create-profile-preview">
                <div className="create-avatar">{formData.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="create-name">{formData.name}</p>
                  <p className="create-email-preview">{formData.email}</p>
                  {formData.company && <p className="create-company-preview">🏢 {formData.company}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Create Password *</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input type={showPass ? 'text' : 'password'} name="password" id="create-password" className="form-input" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} style={{ paddingRight: '44px' }} />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input type="password" name="confirmPassword" id="create-confirm-password" className="form-input" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} />
                </div>
              </div>

              <button type="submit" id="create-submit-btn" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : <><FiArrowRight /> Create My Account</>}
              </button>
              <button type="button" className="btn btn-ghost btn-full" onClick={() => setStep(1)}>← Back</button>
            </form>
          )}

          <p className="auth-footer-text">
            Already registered? <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>

        <div className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-visual-icon animate-float">🚀</div>
            <h2>Get Started in Minutes</h2>
            <p>Set up your E-Store account and start ordering company essentials right away.</p>
            <div className="auth-visual-features">
              {['📝 Fill Details', '🔒 Set Password', '✅ Start Shopping', '📦 Track Orders'].map((f, i) => (
                <div key={f} className={`auth-visual-feature ${i < step ? 'feature-done' : ''}`}>{f}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
