// src/services/authService.js
import api from './api';
import { auth } from '../configs/firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  getIdToken
} from 'firebase/auth';

const authService = {
  /**
   * Admin Login - Authenticates with Firebase + Backend
   */
  login: async (email, password) => {
    try {
      // Step 1: Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const firebaseToken = await getIdToken(user, true);

      // Store token early for API interceptor
      localStorage.setItem('authToken', firebaseToken);

      // Step 2: Backend sync (get user role, profile, etc.)
      try {
        const response = await api.post('/auth/login', {
          token: firebaseToken,
          usernameOrEmail: email,
          password // optional, depending on your backend
        });

        const userData = response.data.user || response.data;

        // Save to localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(userData));

        return {
          success: true,
          user: userData,
          firebaseUser: user
        };
      } catch (backendError) {
        console.warn('Backend auth failed, falling back to Firebase-only mode', backendError);

        // Fallback: still allow login if backend is down or not required
        const fallbackUser = {
          id: user.uid,
          email: user.email,
          username: user.displayName || email.split('@')[0],
          role: 'user',
          isAdmin: false
        };

        localStorage.setItem('userData', JSON.stringify(fallbackUser));

        return {
          success: true,
          user: fallbackUser,
          firebaseUser: user,
          warning: 'Connected in limited mode (backend unreachable)'
        };
      }
    } catch (error) {
      let message = 'Login failed. Please try again.';

      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            message = 'Incorrect email or password.';
            break;
          case 'auth/invalid-email':
            message = 'Please enter a valid email address.';
            break;
          case 'auth/too-many-requests':
            message = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            message = 'Network error. Please check your connection.';
            break;
        }
      }

      throw new Error(message);
    }
  },

  /**
   * Logout from Firebase + clear local data
   */
  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Firebase logout failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  },

  /**
   * Refresh Firebase ID token
   */
  refreshToken: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const token = await getIdToken(user, true);
    localStorage.setItem('authToken', token);
    return token;
  }
};

export default authService;