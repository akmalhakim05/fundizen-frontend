import api from './api';

export const authService = {
  // Register user in backend
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user in backend
  login: async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/auth/login', { 
        usernameOrEmail, 
        password 
      });
      
      // Store user data for future requests
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('userData');
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return localStorage.getItem('userData') !== null;
  }
};