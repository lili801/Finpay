import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Initial authentication failed:', error);
          // Token refresh might have failed in interceptor
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to custom logout events triggered by interceptor failures
    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ firstName, lastName, username, email, password }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        username,
        email,
        password,
      });
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const verifyEmail = async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  };

  const resetPassword = async ({ token, password }) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
