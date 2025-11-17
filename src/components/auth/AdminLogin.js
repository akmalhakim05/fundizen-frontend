import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import { 
  Shield, 
  Mail, 
  Lock, 
  AlertCircle,
  LogIn 
} from 'lucide-react'; // Using lucide-react (lightweight & beautiful)
import '../../styles/components/AdminAuth.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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
    setLoading(true);

    try {
      console.log('Starting Firebase login process...');
      const user = await login(formData.email, formData.password);
      console.log('Login successful, user:', user);
      
      if (user && (user.role === 'admin' || user.isAdmin)) {
        navigate('/admin');
      } else {
        setError('Access denied. Admin privileges required.');
      }
    } catch (error) {
      console.error('Login error in component:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.error) errorMessage = error.error;
      else if (error.message) errorMessage = error.message;
      else if (typeof error === 'string') errorMessage = error;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-container">
        <div className="admin-login-card">
          {/* Header */}
          <div className="admin-login-header">
            <div className="admin-logo">
              <Shield size={48} className="shield-icon" />
              <div>
                <h1>Admin Portal</h1>
                <p className="subtitle">Secure Access Control Panel</p>
              </div>
            </div>
            <p className="description">
              Sign in with your administrator credentials to access the dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="admin-error-alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="email">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="password">
                <Lock size={16} />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="admin-submit-btn"
              disabled={loading}
            >
              <LogIn size={18} />
              {loading ? 'Signing In...' : 'Sign In as Administrator'}
            </button>
          </form>

          {/* Footer */}
          <div className="admin-login-footer">
            <Shield size={14} />
            <span>Authorized Personnel Only • Restricted Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;