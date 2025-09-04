// src/services/authService.js
import api from './api';
import { auth } from '../firebase/config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  reload
} from 'firebase/auth';

export const authService = {
  // Register user with Firebase + Backend (with email verification)
  register: async (userData) => {
    try {
      // Step 1: Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      // Step 2: Send email verification immediately
      await sendEmailVerification(userCredential.user);
      console.log('Email verification sent to:', userData.email);
      
      // Step 3: Don't proceed to backend until email is verified
      // Return special response indicating email verification needed
      return {
        requiresEmailVerification: true,
        email: userData.email,
        message: 'Please check your email and verify your account before completing registration.'
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      // Handle Firebase errors
      if (error.code) {
        let errorMessage = error.message;
        
        // Provide user-friendly error messages
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email address is already registered.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters long.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          default:
            errorMessage = error.message;
        }
        
        throw { error: errorMessage };
      }
      throw error;
    }
  },

  // Complete registration after email verification
  completeRegistration: async (userData) => {
    try {
      // Step 1: Sign in the user to get fresh token
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      // Step 2: Reload user to get latest verification status
      await reload(userCredential.user);
      
      // Step 3: Check if email is verified
      if (!userCredential.user.emailVerified) {
        throw { 
          error: 'Email not verified', 
          message: 'Please verify your email before completing registration.',
          requiresEmailVerification: true 
        };
      }

      // Step 4: Get Firebase token
      const firebaseToken = await userCredential.user.getIdToken(true); // Force refresh
      
      // Step 5: Register with backend
      const response = await api.post('/auth/register', {
        token: firebaseToken,
        user: userData
      });
      
      // Step 6: Store user data
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
      
    } catch (error) {
      console.error('Complete registration error:', error);
      
      if (error.code) {
        throw { error: error.message };
      }
      throw error.response?.data || error;
    }
  },

  // Check email verification status
  checkEmailVerification: async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user signed in');
      }

      // Reload user to get fresh verification status
      await reload(auth.currentUser);
      
      return {
        emailVerified: auth.currentUser.emailVerified,
        email: auth.currentUser.email
      };
      
    } catch (error) {
      console.error('Check email verification error:', error);
      throw error;
    }
  },

  // Resend email verification
  resendEmailVerification: async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user signed in');
      }

      if (auth.currentUser.emailVerified) {
        throw new Error('Email is already verified');
      }

      await sendEmailVerification(auth.currentUser);
      
      return {
        message: 'Verification email sent successfully',
        email: auth.currentUser.email
      };
      
    } catch (error) {
      console.error('Resend email verification error:', error);
      throw error;
    }
  },

  // Login user with Firebase + Backend (with email verification check)
  login: async (email, password) => {
    try {
      // Step 1: Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Step 2: Reload user to get latest verification status
      await reload(userCredential.user);
      
      // Step 3: Check if email is verified
      if (!userCredential.user.emailVerified) {
        throw { 
          error: 'Email not verified', 
          message: 'Please verify your email address to login.',
          requiresEmailVerification: true,
          email: userCredential.user.email
        };
      }
      
      // Step 4: Get Firebase token
      const firebaseToken = await userCredential.user.getIdToken(true); // Force refresh
      
      // Step 5: Login with backend
      const response = await api.post('/auth/login', {
        token: firebaseToken,
        usernameOrEmail: email,
        password: password
      });
      
      // Step 6: Store user data
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.code) {
        let errorMessage = error.message;
        
        // Provide user-friendly error messages
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed login attempts. Please try again later.';
            break;
          default:
            errorMessage = error.message;
        }
        
        throw { error: errorMessage };
      }
      
      throw error.response?.data || error;
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
    const userData = localStorage.getItem('userData');
    const firebaseUser = auth.currentUser;
    
    return userData !== null && firebaseUser !== null && firebaseUser.emailVerified;
  },

  // Get Firebase auth state
  getFirebaseUser: () => {
    return auth.currentUser;
  },

  // Wait for Firebase auth state to initialize
  waitForAuthState: () => {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
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
  },

  // Verify Firebase token with backend
  verifyTokenWithBackend: async (token) => {
    try {
      const response = await api.post('/auth/verify-token', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};