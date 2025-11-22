// src/components/admin/auth/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import authService from '../../../services/authService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import { 
  Shield, 
  Mail, 
  Lock, 
  AlertCircle,
  LogIn,
  Sparkles
} from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(formData.email, formData.password);

      // Check admin privileges
      const isAdmin = 
        result.user?.isAdmin === true || 
        ['admin', 'ADMIN', 'Admin'].includes(result.user?.role);

      if (!isAdmin) {
        setError('Access denied. Administrator privileges required.');
        await authService.logout();
        setLoading(false);
        return;
      }

      // Success → redirect
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Authenticating administrator..." />;
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-container">
        <div className="admin-login-card">
          {/* Animated Background Orbs */}
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />

          {/* Header */}
          <div className="admin-login-header">
            <div className="admin-logo">
              <div className="shield-wrapper">
                <Shield size={56} className="shield-icon" />
                <Sparkles size={24} className="sparkle" />
              </div>
              <div>
                <h1>Fundizen Admin</h1>
                <p className="subtitle">Secure Control Center</p>
              </div>
            </div>
            <p className="description">
              Sign in with your administrator credentials to access the platform dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="admin-error-alert">
              <AlertCircle size={22} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label>
                <Mail size={18} />
                Administrator Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@fundizen.my"
                autoComplete="email"
              />
            </div>

            <div className="admin-form-group">
              <label>
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your secure password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              <LogIn size={20} />
              <span>{loading ? 'Authenticating...' : 'Access Admin Portal'}</span>
            </button>
          </form>

          {/* Footer */}
          <div className="admin-login-footer">
            <Shield size={16} />
            <span>Restricted Access • Authorized Administrators Only</span>
            <Shield size={16} />
          </div>
        </div>
      </div>

      {/* Same beautiful CSS as before */}
      <style jsx>{`
        /* ... (keep all your existing gorgeous CSS unchanged) */
        .admin-login-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #1e3a8a 80%, #1e40af 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow: hidden;
        }
        /* ... rest of your amazing glassmorphism CSS ... */
      `}</style>
    </div>
  );
};

export default AdminLogin;