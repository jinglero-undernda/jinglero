import { Routes, Route } from 'react-router-dom';
import AdminHome from './admin/AdminHome';
import AdminDashboard from './admin/AdminDashboard';
import AdminEntityAnalyze from './admin/AdminEntityAnalyze';
import AdminEntityList from './admin/AdminEntityList';
import AdminLogin from './admin/AdminLogin';
import { useAdminAuth } from '../hooks/useAdminAuth';

/**
 * Protected route wrapper that requires authentication
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth(true);

  console.log('ProtectedRoute - loading:', loading, 'isAuthenticated:', isAuthenticated);

  if (loading) {
    console.log('ProtectedRoute - returning loading state');
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - not authenticated, returning null');
    return null; // useAdminAuth will redirect to login
  }

  console.log('ProtectedRoute - authenticated, rendering children');
  return <>{children}</>;
}

export default function AdminPage() {
  return (
    <main>
      <Routes>
        {/* Login route - no authentication required */}
        <Route path="login" element={<AdminLogin />} />
        
        {/* All other routes require authentication */}
        {/* Dashboard route */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        {/* Search route - shows AdminHome for entity selection */}
        <Route
          path="search"
          element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        {/* New route format: /admin/:entityType/:entityId (e.g., /admin/j/0001) - must come before :entityType */}
        <Route
          path=":entityType/:entityId"
          element={
            <ProtectedRoute>
              <AdminEntityAnalyze />
            </ProtectedRoute>
          }
        />
        {/* Entity list routes - /admin/:entityType (e.g., /admin/f for fabricas list) */}
        <Route
          path=":entityType"
          element={
            <ProtectedRoute>
              <AdminEntityList />
            </ProtectedRoute>
          }
        />
        {/* Default route shows AdminDashboard */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </main>
  );
}
