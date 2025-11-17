// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { auth } from '../configs/firebase';
import api from '../services/api';

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
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await getIdToken(user);
          localStorage.setItem('authToken', idToken);

          // Try to get user data from localStorage first
          const stored = localStorage.getItem('userData');
          if (stored) {
            setUserData(JSON.parse(stored));
          }

          setCurrentUser(user);
        } catch (error) {
          console.error('Error setting up auth:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setCurrentUser(null);
          setUserData(null);
        }
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Logging in with Firebase...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const firebaseToken = await getIdToken(user, true);

      localStorage.setItem('authToken', firebaseToken);

      // Call your backend to get role & user info
      try {
        const response = await api.post('/auth/login', {
          token: firebaseToken,
          usernameOrEmail: email,
          password: password
        });

        const backendUserData = response.data.user || response.data;
        localStorage.setItem('userData', JSON.stringify(backendUserData));
        setUserData(backendUserData);
        return backendUserData;
      } catch (backendError) {
        console.warn('Backend /auth/login failed, using Firebase-only user', backendError);
        // Fallback: still allow login with basic info
        const basicUser = {
          id: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          role: 'user',
          isAdmin: false
        };
        localStorage.setItem('userData', JSON.stringify(basicUser));
        setUserData(basicUser);
        return basicUser;
      }
    } catch (error) {
      console.error('Login failed:', error);
      let message = 'Login failed. Please try again.';
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          message = 'Incorrect email or password.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Try again later.';
          break;
      }
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase logout error:', error);
    } finally {
      // Always clear local data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setCurrentUser(null);
      setUserData(null);
    }
  };

  const refreshToken = async () => {
    if (currentUser) {
      try {
        const token = await getIdToken(currentUser, true);
        localStorage.setItem('authToken', token);
        return token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
      }
    }
    throw new Error('No user logged in');
  };

  const value = {
    currentUser,
    userData,
    login,
    logout,
    refreshToken,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};