import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register function
  const register = async (email, password, username) => {
    try {
      const response = await authService.register({
        username,
        email,
        password
      });
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.user) {
        setCurrentUser(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      authService.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const userData = authService.getCurrentUser();
      setCurrentUser(userData);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const value = {
    currentUser,
    userData: currentUser, // Keep this for backward compatibility
    register,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};