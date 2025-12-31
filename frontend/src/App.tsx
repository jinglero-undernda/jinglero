import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';
import Home from './pages/Home';
import FabricaPage from './pages/FabricaPage';
import InspectJingle from './pages/inspect/InspectJingle';
import InspectCancion from './pages/inspect/InspectCancion';
import InspectFabrica from './pages/inspect/InspectFabrica';
import InspectArtista from './pages/inspect/InspectArtista';
import InspectTematica from './pages/inspect/InspectTematica';
const AdminPage = lazy(() => import('./pages/AdminPage'));
import SearchResultsPage from './pages/SearchResultsPage';
import { adminApi } from './lib/api/client';
import { ToastProvider } from './components/common/ToastContext';
import PublicLayout from './components/layout/PublicLayout';

/**
 * Admin/Usuario link component that shows "Usuario" when authenticated and acts as logout button
 */
function AdminLink() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await adminApi.getAuthStatus();
        setIsAuthenticated(status.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (when token is added/removed in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminToken') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check on focus (when user switches back to tab)
    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault();
      try {
        await adminApi.logout();
      } catch (error) {
        console.error('Error logging out:', error);
        // Clear token even if logout request fails
        adminApi.clearToken();
      }
      // Force a page reload to clear any admin state and redirect to home
      window.location.href = '/';
    }
  };

  if (loading) {
    return <Link to="/admin">Admin</Link>;
  }

  if (isAuthenticated) {
    return (
      <a 
        href="#" 
        onClick={handleClick} 
        style={{ 
          cursor: 'pointer',
          color: 'inherit',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textDecoration = 'underline';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = 'none';
        }}
      >
        Usuario
      </a>
    );
  }

  return <Link to="/admin">Admin</Link>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/show/:fabricaId" element={<FabricaPage />} />
            <Route path="/show" element={<FabricaPage />} />
            <Route path="/j/:jingleId" element={<InspectJingle />} />
            <Route path="/c/:cancionId" element={<InspectCancion />} />
            <Route path="/f/:fabricaId" element={<InspectFabrica />} />
            <Route path="/a/:artistaId" element={<InspectArtista />} />
            <Route path="/t/:tematicaId" element={<InspectTematica />} />
          </Route>
          <Route 
            path="/admin/*" 
            element={
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>}>
                <AdminPage />
              </Suspense>
            } 
          />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
