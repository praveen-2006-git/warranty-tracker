import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CssBaseline } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Layout
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Main Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Services from './pages/Services';
import ServiceForm from './pages/ServiceForm';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Categories from './pages/Categories';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/categories" element={<Categories />} />

                  {/* Product Routes */}
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/add" element={<ProductForm />} />
                  <Route path="/products/edit/:id" element={<ProductForm />} />

                  {/* Service Routes */}
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/product/:productId" element={<Services />} />
                  <Route path="/services/add" element={<ServiceForm />} />
                  <Route path="/services/add/:productId" element={<ServiceForm />} />
                  <Route path="/services/edit/:id" element={<ServiceForm />} />
                </Route>
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );

}

export default App;