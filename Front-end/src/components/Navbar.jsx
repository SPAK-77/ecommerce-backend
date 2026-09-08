import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { FiShoppingCart, FiUser, FiLogOut, FiPackage, FiGrid, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { getAvatarImage, handleAvatarImageError, DEFAULT_AVATAR_IMAGE } from '../utils/avatarImages';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={handleLogoClick} title="FLIPZONE Home Shortcut (Refresh)">
          <span className="logo-icon">🛒</span>
          <span className="logo-text">
            <span className="brand-flip">FLIP</span>
            <span className="brand-zone">ZONE</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</NavLink>
          {!isAdmin && <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Products</NavLink>}
          {user && (
            <>
              {!isAdmin && (
                <>
                  <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
                  <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Orders</NavLink>
                </>
              )}
              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => `nav-link nav-link-admin ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                  <FiGrid size={14} /> Admin
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="navbar-actions">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
              border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(15,23,42,0.15)',
              color: isDark ? '#fbbf24' : '#6366f1',
              borderRadius: '20px',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '700',
              fontSize: '0.8rem',
              transition: 'all 0.2s ease',
            }}
          >
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {user ? (
            <>
              {/* Cart */}
              <Link to="/cart" className="cart-btn">
                <FiShoppingCart size={20} />
                {itemCount > 0 && <span className="cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>}
              </Link>

              {/* User Dropdown */}
              <div className="user-dropdown" ref={dropdownRef}>
                <button className="user-avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <img
                    src={getAvatarImage(user.avatar) || DEFAULT_AVATAR_IMAGE}
                    alt={user.name}
                    className="user-avatar-img"
                    style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', background: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
                    onError={(e) => handleAvatarImageError(e)}
                  />
                  <span className="user-name-text">{user.name?.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider" />
                    {!isAdmin && (
                      <>
                        <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <FiUser size={15} /> My Profile
                        </Link>
                        <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <FiPackage size={15} /> My Orders
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item dropdown-admin" onClick={() => setDropdownOpen(false)}>
                        <FiGrid size={15} /> Admin Panel
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      <FiLogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
