import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { User } from '../api/types';
import { authApi } from '../api/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await authApi.login(email, password);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      setIsLoading(true);
      const userData = await authApi.register(name, email, password, passwordConfirmation);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we still want to clear the local state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
