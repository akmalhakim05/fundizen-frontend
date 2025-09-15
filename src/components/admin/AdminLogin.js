import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { testLogin } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/components/AdminAuth.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    setLoading(true);

    try {
      console.log('Starting Firebase login process...');
      setDebugInfo('Attempting Firebase authentication...');
      
      const user = await login(formData.email, formData.password);
      
      console.log('Login successful, user:', user);
      setDebugInfo('Login successful! Checking admin privileges...');
      
      // Check if user is admin
      if (user && (user.role === 'admin' || user.isAdmin)) {
        setDebugInfo('Admin access granted, redirecting...');
        navigate('/admin');
      } else {
        setError('Access denied. Admin privileges required.');
        setDebugInfo(`User role: ${user?.role}, isAdmin: ${user?.isAdmin}`);
      }
    } catch (error) {
      console.error('Login error in component:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      let debugMessage = `Error details: ${JSON.stringify(error, null, 2)}`;
      
      if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      setDebugInfo(debugMessage);
    } finally {
      setLoading(false);
    }
  };

  // Test function to try Firebase authentication
  const handleTestLogin = async () => {
    setError('');
    setDebugInfo('');
    setLoading(true);

    try {
      setDebugInfo('Testing Firebase authentication...');
      const result = await testLogin(formData.email, formData.password);
      setDebugInfo(`Firebase test successful: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setError('Firebase test failed');
      setDebugInfo(`Firebase test error: ${JSON.stringify(error.response?.data || error.message, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-logo">
            <span className="admin-logo-icon">🛠️</span>
            <h1>Admin Portal</h1>
          </div>
          <p>Sign in with your Firebase credentials</p>
        </div>

        {error && (
          <div className="admin-error-alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {debugInfo && (
          <div style={{
            background: '#e7f3ff',
            border: '1px solid #b8daff',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <strong>Debug Info:</strong><br />
            {debugInfo}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter Firebase email"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter Firebase password"
            />
          </div>

          <button 
            type="submit" 
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In with Firebase'}
          </button>

          <button 
            type="button" 
            onClick={handleTestLogin}
            className="admin-submit-btn"
            style={{ 
              background: '#28a745', 
              marginTop: '10px' 
            }}
            disabled={loading}
          >
            Test Firebase Connection
          </button>
        </form>

        <div className="admin-login-footer">
          <p>⚠️ Authorized personnel only</p>
          <div style={{ 
            marginTop: '10px', 
            fontSize: '12px', 
            color: '#666',
            fontFamily: 'monospace'
          }}>
            API URL: {process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}<br/>
            Firebase Project: {process.env.REACT_APP_FIREBASE_PROJECT_ID || 'Not configured'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;