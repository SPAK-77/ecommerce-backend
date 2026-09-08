import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import PublicPage from './pages/PublicPage'
import ProductListingPage from './pages/ProductListingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CartPage from './pages/CartPage'
import DashboardPage from './pages/DashboardPage'
import CustomerOrdersPage from './pages/CustomerOrdersPage'
import ProfilePage from './pages/ProfilePage'
import AdminPanelPage from './pages/AdminPanelPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminCustomersPage from './pages/AdminCustomersPage'
import AdminOffersPage from './pages/AdminOffersPage'
import AdminReviewsPage from './pages/AdminReviewsPage'
import CreateAccountPage from './pages/CreateAccountPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VantaBackground from './components/VantaBackground'
import { AdminRoute, AdminPanelRedirect, PublicOnlyRoute } from './components/ProtectedRoute'
import './App.css'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <VantaBackground />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="page-wrapper">
              <Routes>
                <Route path="/" element={<AdminPanelRedirect><PublicPage /></AdminPanelRedirect>} />
                <Route path="/products" element={<AdminPanelRedirect><ProductListingPage /></AdminPanelRedirect>} />
                <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
                <Route path="/create-account" element={<PublicOnlyRoute><CreateAccountPage /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
                <Route path="/cart" element={<AdminPanelRedirect><CartPage /></AdminPanelRedirect>} />
                <Route path="/checkout" element={<AdminPanelRedirect><CartPage /></AdminPanelRedirect>} />
                <Route path="/dashboard" element={<AdminPanelRedirect><DashboardPage /></AdminPanelRedirect>} />
                <Route path="/orders" element={<AdminPanelRedirect><CustomerOrdersPage /></AdminPanelRedirect>} />
                <Route path="/profile" element={<AdminPanelRedirect><ProfilePage /></AdminPanelRedirect>} />
                <Route path="/admin" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
                <Route path="/admin/offers" element={<AdminRoute><AdminOffersPage /></AdminRoute>} />
                <Route path="/admin/reviews" element={<AdminRoute><AdminReviewsPage /></AdminRoute>} />
                <Route path="*" element={<PublicPage />} />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
