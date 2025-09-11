'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/api';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User; }>;
  register: (userData: {
    email: string;
    password: string;
    name?: string;
    displayName?: string;
  }) => Promise<{ success: boolean; error?: string; user?: User; }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const result = await api.getMe();
        if (result.data?.user) {
          setUser(result.data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; }> => {
    try {
      const result = await api.login({ email, password });
      
      if (result.data) {
        api.setToken(result.data.token);
        setUser(result.data.user);
        return { success: true, user: result.data.user };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name?: string;
    displayName?: string;
  }): Promise<{ success: boolean; error?: string; user?: User; }> => {
    try {
      const result = await api.register(userData);
      
      if (result.data) {
        api.setToken(result.data.token);
        setUser(result.data.user);
        return { success: true, user: result.data.user };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}