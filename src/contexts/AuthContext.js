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
          // Get Firebase ID token
          const idToken = await getIdToken(user);
          
          // Store token in localStorage for API calls
          localStorage.setItem('authToken', idToken);
          
          // Fetch user data (which will check stored data first)
          await fetchUserData();
          
          setCurrentUser(user);
        } catch (error) {
          console.error('Error getting user token:', error);
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

  const fetchUserData = async () => {
    try {
      // First, try to get stored user data
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        
        // Still try to fetch fresh data from backend, but don't fail if it doesn't work
        try {
          const response = await api.get('/auth/me');
          const freshUserData = response.data.user || response.data;
          
          // Update with fresh data if available
          localStorage.setItem('userData', JSON.stringify(freshUserData));
          setUserData(freshUserData);
        } catch (error) {
          console.warn('Could not fetch fresh user data, using stored data:', error);
          // Keep using stored data if backend is unavailable
        }
      } else {
        // No stored data, try to fetch from backend
        const response = await api.get('/auth/me');
        const userData = response.data.user || response.data;
        localStorage.setItem('userData', JSON.stringify(userData));
        setUserData(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Don't remove token here as it might be a temporary server issue
      // Only clear if it's an auth error
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUserData(null);
      }
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting Firebase login...');
      
      // Step 1: Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase login successful:', user);
      
      // Step 2: Get Firebase token
      const firebaseToken = await getIdToken(user, true);
      console.log('Got Firebase ID token');
      
      // Store token for API calls
      localStorage.setItem('authToken', firebaseToken);
      
      // Step 3: Backend authentication with role data
      try {
        const response = await api.post('/auth/login', {
          token: firebaseToken,
          usernameOrEmail: email,
          password: password
        });
        
        console.log('Backend login successful:', response.data);
        
        const backendUserData = response.data.user || response.data;
        
        // Step 4: Store user data WITH ROLE INFORMATION
        if (backendUserData) {
          localStorage.setItem('userData', JSON.stringify(backendUserData));
          setUserData(backendUserData);
        }
        
        return backendUserData;
      } catch (backendError) {
        console.error('Backend login failed, but Firebase succeeded:', backendError);
        
        // Even if backend fails, we can still use Firebase user data
        const basicUserData = {
          id: user.uid,
          email: user.email,
          username: user.displayName || user.email,
          role: 'user', // Default role
          isAdmin: false
        };
        
        localStorage.setItem('userData', JSON.stringify(basicUserData));
        setUserData(basicUserData);
        return basicUserData;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Transform Firebase errors to user-friendly messages
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Wrong username or password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
      }
      
      throw { error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Try to notify backend (optional)
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Backend logout error (non-critical):', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clean up local state
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setCurrentUser(null);
      setUserData(null);
    }
  };

  // Helper function to refresh token when needed
  const refreshToken = async () => {
    if (currentUser) {
      try {
        const idToken = await getIdToken(currentUser, true); // Force refresh
        localStorage.setItem('authToken', idToken);
        return idToken;
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    }
    throw new Error('No current user');
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
      {children}
    </AuthContext.Provider>
  );
};