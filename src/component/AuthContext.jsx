/* eslint-disable react-refresh/only-export-components */
import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacebookAuthProvider, GoogleAuthProvider } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = useCallback(async () => {
    try {
      setLoading(true);
      // Implementation would go here
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role);
  }, [user]);

  const hasAnyRole = useCallback((roles) => {
    return roles?.some(role => user?.roles?.includes(role));
  }, [user]);

  const socialLogin = useCallback(async (_provider) => {
    try {
      setLoading(true);
      // Implementation would go here
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      // Implementation would go here
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const clearAuthData = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    signInWithGoogle: () => socialLogin(new GoogleAuthProvider()),
    signInWithFacebook: () => socialLogin(new FacebookAuthProvider()),
    refreshToken,
    clearAuthData
  }), [
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    socialLogin,
    refreshToken,
    clearAuthData
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};