import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiPackage, FiShoppingCart, FiClipboard,
  FiUser, FiGrid, FiUsers, FiTag, FiStar
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const customerLinks = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/products', icon: <FiPackage />, label: 'Products' },
    { to: '/cart', icon: <FiShoppingCart />, label: 'My Cart' },
    { to: '/orders', icon: <FiClipboard />, label: 'My Orders' },
    { to: '/profile', icon: <FiUser />, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: <FiGrid />, label: 'Admin Panel' },
    { to: '/admin/products', icon: <FiPackage />, label: 'Products' },
    { to: '/admin/orders', icon: <FiClipboard />, label: 'Orders' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Customers' },
    { to: '/admin/categories', icon: <FiTag />, label: 'Categories' },
    { to: '/admin/reviews', icon: <FiStar />, label: 'Customer Reviews' },
  ];

  return (
    <aside className="sidebar">
      {!isAdmin && (
        <div className="sidebar-section">
          <p className="sidebar-section-title">Navigation</p>
          <nav className="sidebar-nav">
            {customerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {isAdmin && (
        <div className="sidebar-section">
          <p className="sidebar-section-title sidebar-section-title--admin">Admin</p>
          <nav className="sidebar-nav">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) => `sidebar-link sidebar-link--admin ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <div className="sidebar-footer">
        <p className="sidebar-footer-text"><span className="brand-flip">FLIP</span><span className="brand-zone">ZONE</span> v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
