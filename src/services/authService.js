import axios from 'axios';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Firebase Authentication Functions
export const firebaseAuth = {
  // Register with Firebase
  register: async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    return userCredential;
  },

  // Login with Firebase
  login: async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  // Logout
  logout: async () => {
    return await signOut(auth);
  }
};

// Backend API Functions
export const backendAuth = {
  // Register user with backend (after Firebase registration)
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Registration failed');
    }
  },

  // Login with backend (verify token)
  login: async (token) => {
    try {
      const response = await api.post('/auth/login', {}, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Login failed');
    }
  }
};

// Combined authentication flow
export const authService = {
  // Complete registration process (Firebase + Backend)
  registerUser: async (email, password, username) => {
    try {
      // 1. Register with Firebase
      const userCredential = await firebaseAuth.register(email, password);
      
      // 2. Get Firebase token
      const token = await userCredential.user.getIdToken();
      
      // 3. Register with backend
      const backendResponse = await backendAuth.register({
        username,
        token
      });
      
      return {
        firebaseUser: userCredential.user,
        backendResponse
      };
    } catch (error) {
      throw error;
    }
  },

  // Complete login process (Firebase + Backend)
  loginUser: async (email, password) => {
    try {
      // 1. Login with Firebase
      const userCredential = await firebaseAuth.login(email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await firebaseAuth.logout();
        throw new Error('Please verify your email before logging in');
      }
      
      // 2. Get Firebase token
      const token = await userCredential.user.getIdToken();
      
      // 3. Verify with backend
      const backendResponse = await backendAuth.login(token);
      
      return {
        firebaseUser: userCredential.user,
        backendResponse
      };
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logoutUser: async () => {
    try {
      await firebaseAuth.logout();
    } catch (error) {
      throw error;
    }
  }
};