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
  login: async (idToken) => {
    try {
      const response = await api.post('/auth/login', { idToken });
      
      // Store token for future requests
      localStorage.setItem('authToken', idToken);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify token with backend
  verifyToken: async (idToken) => {
    try {
      const response = await api.post('/auth/login', { idToken });
      
      // Store token for future requests
      localStorage.setItem('authToken', idToken);
      
      return response.data;
    } catch (error) {
      // Don't throw error for token verification failures
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
      return null;
    }
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('authToken');
  }
};