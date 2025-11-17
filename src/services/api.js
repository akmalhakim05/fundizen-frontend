import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log('API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    // Handle 401 errors (token expired/invalid)
    if (error.response?.status === 401) {
      // Try to refresh token if we have Firebase auth
      try {
        const { auth } = await import('../configs/firebase');
        const { getIdToken } = await import('firebase/auth');
        
        if (auth.currentUser) {
          console.log('Attempting to refresh Firebase token...');
          const newToken = await getIdToken(auth.currentUser, true);
          localStorage.setItem('authToken', newToken);
          
          // Retry the original request with new token
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // If refresh fails or no current user, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      if (window.location.pathname !== '/admin/login' && window.location.pathname !== '/login') {
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Test function for Firebase authentication (for debugging)
export const testLogin = async (email, password) => {
  try {
    console.log('Testing Firebase-based login...');
    
    // Import Firebase dynamically to avoid issues if not configured
    const { signInWithEmailAndPassword, getIdToken } = await import('firebase/auth');
    const { auth } = await import('../configs/firebase');
    
    // Step 1: Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Step 2: Get Firebase token
    const firebaseToken = await getIdToken(userCredential.user, true);
    
    // Step 3: Test backend login with Firebase token and credentials
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      token: firebaseToken,
      usernameOrEmail: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Firebase test login failed:', error);
    throw error;
  }
};