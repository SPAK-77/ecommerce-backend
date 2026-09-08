import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuth, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!isAuth) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { isAuth, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (isAuth) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  return children;
};

export const AdminPanelRedirect = ({ children }) => {
  const { isAuth, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (isAuth && isAdmin) return <Navigate to="/admin" replace />;
  return children;
};
