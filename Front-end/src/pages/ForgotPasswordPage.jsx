import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { FiMail, FiArrowRight, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp+pass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    try {
      setLoading(true);
      const res = await authAPI.forgotPassword(email);
      toast.success('OTP sent to your email!');
      if (res.data.demo_otp) { setDemoOtp(res.data.demo_otp); }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) { toast.error('Please fill all fields'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      setLoading(true);
      await authAPI.resetPassword({ email, otp, newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
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
            <h1 className="auth-title">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="auth-subtitle">
              {step === 1
                ? 'Enter your email address to receive an OTP'
                : `Enter the OTP sent to ${email}`}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'step-active' : 'step-inactive'}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'step-line-done' : ''}`} />
            <div className={`step ${step >= 2 ? 'step-active' : 'step-inactive'}`}>2</div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="forgot-email"
                    className="form-input"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" id="send-otp-btn" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : <><FiArrowRight /> Send OTP</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form">
              {demoOtp && (
                <div className="auth-demo">
                  <p className="demo-title">Demo Mode – Your OTP</p>
                  <div className="demo-cred" style={{ justifyContent: 'center', fontSize: '1.5rem', letterSpacing: '6px', fontWeight: 700, color: 'var(--accent)' }}>
                    {demoOtp}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input
                  type="text"
                  id="reset-otp"
                  className="form-input"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 700 }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="new-password"
                    className="form-input"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingRight: '44px' }}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    id="confirm-new-password"
                    className="form-input"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" id="reset-pass-btn" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : <><FiLock /> Reset Password</>}
              </button>
              <button type="button" className="btn btn-ghost btn-full" onClick={() => setStep(1)}>
                <FiArrowLeft /> Back to Email
              </button>
            </form>
          )}

          <p className="auth-footer-text">
            Remembered it? <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>

        <div className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-visual-icon animate-float">🔐</div>
            <h2>Secure Password Reset</h2>
            <p>We'll send a one-time password to your email. Your account stays safe throughout the process.</p>
            <div className="auth-visual-features">
              {['📧 Email Verification', '⏱ OTP Expires in 15 min', '🔒 Encrypted Process', '✅ Instant Reset'].map(f => (
                <div key={f} className="auth-visual-feature">{f}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
