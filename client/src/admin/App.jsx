import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HomepageEditor from './pages/HomepageEditor';
import ProductsEditor from './pages/ProductsEditor';
import StoryEditor from './pages/StoryEditor';
import InnovationsEditor from './pages/InnovationsEditor';
import ContactEditor from './pages/ContactEditor';
import FooterEditor from './pages/FooterEditor';
import MediaLibrary from './pages/MediaLibrary';
import SettingsEditor from './pages/SettingsEditor';
import { ToastProvider, ToastContainer } from './hooks/useToast';
import './styles/admin.css';

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%'}} />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%'}} />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/admin" replace /> : <Outlet />;
}

export default function AdminApp() {
  useEffect(() => {
    document.title = 'Om Banana Crafts - Admin CMS';
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<PublicRoute />}>
            <Route index element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="home" element={<HomepageEditor />} />
              <Route path="products" element={<ProductsEditor />} />
              <Route path="story" element={<StoryEditor />} />
              <Route path="innovations" element={<InnovationsEditor />} />
              <Route path="contact" element={<ContactEditor />} />
              <Route path="footer" element={<FooterEditor />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="settings" element={<SettingsEditor />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}