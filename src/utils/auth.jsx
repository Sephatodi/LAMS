 
/* eslint-disable react-refresh/only-export-components */
/** @jsxRuntime classic */
/** @jsx React.createElement */

import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from './api';

// Constants
const TOKEN_KEY = 'land_board_auth_token';
const USER_KEY = 'land_board_user_data';

// Token management utilities
export const setAuthToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem(USER_KEY, JSON.stringify(payload));
    return payload;
  } catch (error) {
    console.error('Error storing auth token:', error);
    throw new Error('Failed to process authentication token');
  }
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp > Date.now() / 1000;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      
      if (token && isTokenValid(token)) {
        setUser(getUserData());
      } else {
        removeAuthToken();
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiRequest('POST', '/auth/login', credentials);
      const userData = setAuthToken(response.token);
      setUser(userData);
      navigate('/dashboard'); // Redirect after login
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout
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

// Move this to a separate api/auth.js file if needed
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return await response.json();
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  },
  logout: async () => {
    // Your logout logic
  },
};