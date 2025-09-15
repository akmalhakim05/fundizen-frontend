import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
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
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      // Only redirect to login if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Alternative login function to test different request formats
export const testLogin = async (email, password) => {
  try {
    console.log('Testing login with different formats...');
    
    // Test 1: Current format
    console.log('Test 1: Standard format');
    const response1 = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    return response1.data;
  } catch (error1) {
    console.log('Test 1 failed, trying alternative formats...');
    
    try {
      // Test 2: Form data format
      console.log('Test 2: Form data format');
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      
      const response2 = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      return response2.data;
    } catch (error2) {
      console.log('Test 2 failed, trying URL encoded...');
      
      try {
        // Test 3: URL encoded format
        console.log('Test 3: URL encoded format');
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('password', password);
        
        const response3 = await axios.post(`${API_BASE_URL}/auth/login`, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true
        });
        
        return response3.data;
      } catch (error3) {
        console.log('All formats failed. Original error:', error1.response?.data);
        throw error1;
      }
    }
  }
};