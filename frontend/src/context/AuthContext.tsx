import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    jobTitle?: string;
    department?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('flowtask_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('flowtask_access_token');
      if (!token) {
        setUser(null);
        return;
      }
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('flowtask_user', JSON.stringify(currentUser));
    } catch {
      setUser(null);
      localStorage.removeItem('flowtask_access_token');
      localStorage.removeItem('flowtask_refresh_token');
      localStorage.removeItem('flowtask_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('flowtask_access_token', response.accessToken);
    localStorage.setItem('flowtask_refresh_token', response.refreshToken);
    localStorage.setItem('flowtask_user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    jobTitle?: string;
    department?: string;
  }) => {
    const response = await authApi.register(data);
    localStorage.setItem('flowtask_access_token', response.accessToken);
    localStorage.setItem('flowtask_refresh_token', response.refreshToken);
    localStorage.setItem('flowtask_user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
