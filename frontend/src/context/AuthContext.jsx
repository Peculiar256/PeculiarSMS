import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
        
        // Try to refresh user profile from backend if token exists
        if (authService.isAuthenticated()) {
          const freshUser = await authService.refreshUserProfile();
          if (freshUser) {
            setUser(freshUser);
          }
          // If refresh fails, continue with stored user - no need for error logging here
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password, identifier = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password, identifier);
      const { accessToken, refreshToken, user } = response.data;
      authService.setTokens(accessToken, refreshToken, user);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      const { accessToken, refreshToken, user } = response.data;
      authService.setTokens(accessToken, refreshToken, user);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.forgotPassword(email);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset link';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword(token, newPassword);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyEmail(token);
      const { user } = response.data;
      setUser(user);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to verify email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const refreshUserProfile = useCallback(async () => {
    try {
      const freshUser = await authService.refreshUserProfile();
      if (freshUser) {
        setUser(freshUser);
        console.log('✅ User profile refreshed:', freshUser);
        return freshUser;
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
      setError('Failed to refresh profile');
    }
    return null;
  }, []);

  const isAuthenticated = !!user;
  const userRole = user?.role || null;

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    login,
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    changePassword,
    logout,
    refreshUserProfile,
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

export { AuthContext };
