import axios from 'axios';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Firebase Authentication Functions
export const firebaseAuth = {
  // Register with Firebase
  register: async (email, password, username) => {
    try {
      console.log('Creating user with Firebase...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log('Updating user profile...');
      await updateProfile(userCredential.user, {
        displayName: username
      });
      
      console.log('Sending email verification...');
      await sendEmailVerification(userCredential.user);
      
      return userCredential;
    } catch (error) {
      console.error('Firebase registration error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  },

  // Login with Firebase
  login: async (email, password) => {
    try {
      console.log('Signing in with Firebase...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase sign in successful');
      return userCredential;
    } catch (error) {
      console.error('Firebase login error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut(auth);
      console.log('Firebase logout successful');
    } catch (error) {
      console.error('Firebase logout error:', error);
      throw error;
    }
  }
};

// Backend API Functions
export const backendAuth = {
  // Register user with backend (after Firebase registration)
  register: async (userData) => {
    try {
      console.log('Registering with backend...', userData);
      const response = await api.post('/auth/register', userData);
      console.log('Backend registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Backend registration error:', error);
      throw new Error(error.response?.data || 'Backend registration failed');
    }
  },

  // Login with backend (verify token)
  login: async (token) => {
    try {
      console.log('Verifying token with backend...');
      const response = await api.post('/auth/login', {}, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      console.log('Backend login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Backend login error:', error);
      throw new Error(error.response?.data || 'Backend login failed');
    }
  }
};

// Combined authentication flow
export const authService = {
  // Complete registration process (Firebase + Backend)
  registerUser: async (email, password, username) => {
    try {
      // 1. Register with Firebase
      console.log('Step 1: Firebase registration');
      const userCredential = await firebaseAuth.register(email, password, username);
      
      // 2. Get Firebase token
      console.log('Step 2: Getting Firebase token');
      const token = await userCredential.user.getIdToken();
      
      // 3. Register with backend
      console.log('Step 3: Backend registration');
      const backendResponse = await backendAuth.register({
        username,
        token
      });
      
      return {
        firebaseUser: userCredential.user,
        backendResponse
      };
    } catch (error) {
      console.error('Registration process failed:', error);
      throw error;
    }
  },

  // Complete login process (Firebase + Backend)
  loginUser: async (email, password) => {
    try {
      // 1. Login with Firebase
      console.log('Step 1: Firebase login');
      const userCredential = await firebaseAuth.login(email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await firebaseAuth.logout();
        throw new Error('Please verify your email before logging in');
      }
      
      // 2. Get Firebase token
      console.log('Step 2: Getting Firebase token');
      const token = await userCredential.user.getIdToken();
      
      // 3. Verify with backend
      console.log('Step 3: Backend verification');
      const backendResponse = await backendAuth.login(token);
      
      return {
        firebaseUser: userCredential.user,
        backendResponse
      };
    } catch (error) {
      console.error('Login process failed:', error);
      throw error;
    }
  },

  // Logout
  logoutUser: async () => {
    try {
      await firebaseAuth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
};

// Helper function to get user-friendly error messages
function getFirebaseErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No user found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'Email address is already registered';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'Authentication failed. Please try again';
  }
}