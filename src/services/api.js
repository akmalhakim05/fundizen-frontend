// src/services/api.js
import axios from 'axios';

// Update this when deploying
// const API_BASE_URL = 'https://fundizen.app/api';
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ========================
// REQUEST INTERCEPTOR ONLY (kept – very useful)
// ========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional debug log (remove in production if you don't want it)
    console.log('%cAPI Request →', 'color: #10b981; font-weight: bold', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      params: config.params,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('%cRequest Setup Error', 'color: #ef4444', error);
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR HAS BEEN COMPLETELY REMOVED
// → No more automatic redirect to /admin/login on 401
// → Errors will now bubble up normally to your components (LoadingSpinner / ErrorMessage will handle them)


// ========================
// DEBUG / TEST LOGIN (keep for development if you need it)
// ========================
export const testLogin = async (email, password) => {
  try {
    const { signInWithEmailAndPassword, getIdToken } = await import('firebase/auth');
    const { auth } = await import('../configs/firebase');

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseToken = await getIdToken(userCredential.user, true);

    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        token: firebaseToken,
        usernameOrEmail: email,
        password: password,
      },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error('Test login failed:', error);
    throw error;
  }
};

export default api;