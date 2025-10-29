import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import type { Usuario } from '../types';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Usuario | null>(null);

  // Placeholder for actual login logic
  const login = useCallback(async (username: string, password: string) => {
    console.log('Attempting to log in with:', username, password);
    // In a real application, you would make an API call here
    // For now, simulate a successful login
    const dummyUser: Usuario = {
      id: '1',
      email: `${username}@example.com`,
      displayName: username,
      role: 'ADMIN',
      contributionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(dummyUser);
    localStorage.setItem('user', JSON.stringify(dummyUser)); // Persist login
  }, []);

  // Placeholder for actual logout logic
  const logout = useCallback(() => {
    console.log('Logging out');
    setUser(null);
    localStorage.removeItem('user'); // Clear persisted login
  }, []);

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const authContextValue = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
