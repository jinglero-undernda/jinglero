import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminApi } from '../lib/api/client';

/**
 * Hook to check admin authentication status
 * Redirects to login if not authenticated
 */
export function useAdminAuth(redirectToLogin = true) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }

    const checkAuth = async () => {
      try {
        const status = await adminApi.getAuthStatus();
        setIsAuthenticated(status.authenticated);
        
        if (!status.authenticated && redirectToLogin && location.pathname !== '/admin/login') {
          hasRedirected.current = true;
          navigate('/admin/login', { replace: true });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        if (redirectToLogin && location.pathname !== '/admin/login') {
          hasRedirected.current = true;
          navigate('/admin/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, redirectToLogin, location.pathname]);

  return { isAuthenticated, loading };
}

