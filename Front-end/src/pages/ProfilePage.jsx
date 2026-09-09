import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import {
  FiMail, FiPhone, FiLock, FiCalendar, FiShield,
  FiEdit2, FiKey, FiEye, FiEyeOff, FiSave, FiUser, FiX
} from 'react-icons/fi';
import './Dashboard.css';

const ProfilePage = () => {
  const { setUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', role: '', created_at: '',
  });

  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getProfile();
      const u = res.data.user || {};
      setProfileData(u);
      setNameInput(u.name || '');
      setPhoneInput(u.phone || '');
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) { toast.error('Name cannot be empty'); return; }
    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', nameInput.trim());
      formData.append('phone', phoneInput.trim());
      await usersAPI.updateProfile(formData);
      toast.success('🎉 Profile updated successfully!');
      if (setUser) setUser((prev) => ({ ...prev, name: nameInput.trim(), phone: phoneInput.trim() }));
      await fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword) { toast.error('Enter your current password'); return; }
    if (!newPassword || newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }

    setChangingPassword(true);
    try {
      await usersAPI.changePassword({ currentPassword, newPassword });
      toast.success('🔒 Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Current password is incorrect');
    } finally {
      setChangingPassword(false);
    }
  };

  const firstLetter = profileData.name ? profileData.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-welcome">👤 My Profile</h1>
            <p className="dashboard-date">View your account details and update personal information.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-page" style={{ minHeight: '200px' }}><div className="spinner" /></div>
        ) : (
          <div style={{ maxWidth: '820px', width: '100%', margin: '0 auto' }}>
            <div className="card admin-panel-card" style={{ padding: '28px' }}>

              {/* Profile Header */}
              <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                  margin: '0 auto 14px', display: 'flex', alignItems: 'center',
                  justify: 'center', fontSize: '2.4rem', fontWeight: '900',
                  color: '#ffffff', boxShadow: '0 8px 24px rgba(56, 189, 248, 0.35)',
                }}>
                  {firstLetter}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px', color: '#ffffff' }}>
                  {profileData.name}
                </h2>
                <span style={{
                  padding: '4px 14px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: '700',
                  background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}>
                  <FiShield size={12} /> {profileData.role ? profileData.role.toUpperCase() : 'CUSTOMER'} ACCOUNT
                </span>
              </div>

              {/* Profile Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { icon: <FiUser size={17} style={{ color: '#38bdf8' }} />, label: 'Full Name', value: profileData.name },
                  { icon: <FiMail size={17} style={{ color: '#38bdf8' }} />, label: 'Email Address', value: profileData.email },
                  { icon: <FiPhone size={17} style={{ color: '#10b981' }} />, label: 'Phone Number', value: profileData.phone || 'Not provided' },
                  { icon: <FiCalendar size={17} style={{ color: '#fbbf24' }} />, label: 'Member Since', value: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {item.icon}
                    <div>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'block' }}>{item.label}</span>
                      <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Update Personal Info Form */}
              <form onSubmit={handleUpdateProfile}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiEdit2 /> Update Information
                </h4>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" type="text" placeholder="e.g. 9876543210" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" disabled={updatingProfile}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <FiSave /> {updatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>

                  {/* Change Password Button */}
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
                      fontSize: '0.88rem', border: '1.5px solid rgba(239, 68, 68, 0.5)',
                      background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'; }}
                  >
                    <FiLock size={15} /> Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', width: '100%' }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <FiKey />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>Change Password</h3>
                </div>
                <button onClick={() => setShowPasswordModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleChangePassword}>
                {/* Current Password */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showCurrentPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showNewPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showNewPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showConfirmPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={changingPassword}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', border: 'none', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', color: '#ffffff' }}>
                    <FiLock size={14} /> {changingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
