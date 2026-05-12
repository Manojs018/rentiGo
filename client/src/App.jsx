import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ScrollProgress from './components/ui/ScrollProgress';
import CursorGlow from './components/ui/CursorGlow';
import FloatingWhatsApp from './components/ui/FloatingWhatsApp';
import ParticlesBackground from './components/ui/ParticlesBackground';

// Pages
import Home from './pages/Home';
import Rentals from './pages/Rentals';
import Cities from './pages/Cities';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Protected route wrapper
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rentals" element={<Rentals />} />
      <Route path="/cities" element={<Cities />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['customer']}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/owner" element={
        <ProtectedRoute roles={['owner']}>
          <OwnerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ParticlesBackground />
        <ScrollProgress />
        <CursorGlow />
        <AppRoutes />
        <FloatingWhatsApp />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111118',
              color: '#fff',
              border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
