/** @jsxRuntime classic */
/** @jsx React.createElement */

// src/hooks/useAuth.js
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext'; // Optional for notifications
import { authAPI } from '../utils/auth';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast?.() || {}; // Fallback for toast notifications

  // Memoized auth check to prevent unnecessary re-renders
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      localStorage.removeItem('authToken');
      setUser(null);
      setError(err.message);
      showToast?.('Session expired. Please log in again.', 'warning');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Auto-check auth status on mount and token changes
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'authToken') {
        checkAuth();
      }
    };

    checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const { user, token, expiresIn } = await authAPI.login(credentials);
      
      localStorage.setItem('authToken', token);
      setUser(user);
      setError(null);
      
      // Set automatic token refresh
      const refreshTime = (expiresIn - 60) * 1000; // Refresh 1 minute before expiration
      setTimeout(checkAuth, refreshTime);
      
      showToast?.('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      showToast?.(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setError(null);
      showToast?.('Logged out successfully', 'info');
      navigate('/login');
    }
  }, [navigate, showToast]);

  // Memoized return value to prevent unnecessary re-renders
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth
  };
};

export default useAuth;