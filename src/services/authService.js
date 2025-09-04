// src/services/authService.js
import api from './api';
import { auth } from '../firebase/config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

export const authService = {
  // Register user with Firebase + Backend
  register: async (userData) => {
    try {
      // Step 1: Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      // Step 2: Get Firebase token
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Step 3: Register with backend
      const response = await api.post('/auth/register', {
        token: firebaseToken,
        user: userData
      });
      
      return response.data;
    } catch (error) {
      // Handle Firebase errors
      if (error.code) {
        throw { error: error.message };
      }
      throw error.response?.data || error.message;
    }
  },

  // Login user with Firebase + Backend
  login: async (email, password) => {
    try {
      // Step 1: Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Step 2: Get Firebase token
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Step 3: Login with backend
      const response = await api.post('/auth/login', {
        token: firebaseToken,
        usernameOrEmail: email, // Use email for backend login
        password: password
      });
      
      // Step 4: Store user data
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      // Handle different error types
      if (error.code) {
        throw { error: error.message };
      }
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

  // Logout (Firebase + clear local storage)
  logout: async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if Firebase logout fails
      localStorage.removeItem('userData');
    }
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return localStorage.getItem('userData') !== null;
  },

  // Legacy login (fallback without Firebase)
  legacyLogin: async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/auth/legacy/login', { 
        usernameOrEmail, 
        password 
      });
      
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};