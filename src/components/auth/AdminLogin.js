// src/components/admin/auth/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';
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
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      
      if (user && (user.role === 'admin' || user.isAdmin)) {
        navigate('/admin');
      } else {
        setError('Access denied. Administrator privileges required.');
      }
    } catch (err) {
      const msg = err.error || err.message || 'Invalid credentials. Please try again.';
      setError(msg);
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

      {/* Premium 2025 CSS-in-JS — Cinematic Glassmorphism Masterpiece */}
      <style jsx>{`
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

        /* Animated Floating Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          animation: float 20s infinite ease-in-out;
        }
        .orb-1 {
          width: 600px;
          height: 600px;
          background: #3b82f6;
          top: -10%;
          left: -10%;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 800px;
          height: 800px;
          background: #8b5cf6;
          bottom: -20%;
          right: -15%;
          animation-delay: 7s;
        }
        .orb-3 {
          width: 500px;
          height: 500px;
          background: #ec4899;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -50px) rotate(120deg); }
          66% { transform: translate(-40px, 40px) rotate(240deg); }
        }

        .admin-login-container {
          width: 100%;
          max-width: 480px;
          z-index: 10;
        }

        .admin-login-card {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 56px 48px;
          box-shadow: 
            0 32px 80px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-login-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.05) 100%);
          pointer-events: none;
        }

        .admin-login-card:hover {
          transform: translateY(-12px);
          box-shadow: 
            0 40px 100px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(59, 130, 246, 0.3);
        }

        /* Header */
        .admin-login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .admin-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .shield-wrapper {
          position: relative;
        }

        .shield-icon {
          color: #60a5fa;
          filter: drop-shadow(0 0 30px rgba(59, 130, 246, 0.6));
        }

        .sparkle {
          position: absolute;
          top: -10px;
          right: -10px;
          color: #fbbf24;
          animation: sparkle 3s infinite;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        .admin-login-header h1 {
          font-size: 3.2rem;
          font-weight: 900;
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          letter-spacing: -1px;
        }

        .subtitle {
          font-size: 1.3rem;
          font-weight: 700;
          color: #e0e7ff;
          margin: 12px 0 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .description {
          color: #cbd5e1;
          font-size: 1.02rem;
          line-height: 1.7;
          margin: 20px 0 0;
          opacity: 0.9;
        }

        /* Error Alert */
        .admin-error-alert {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 16px 20px;
          border-radius: 16px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-weight: 600;
          backdrop-filter: blur(10px);
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        /* Form */
        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .admin-form-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .admin-form-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          color: #e0e7ff;
          font-size: 1rem;
        }

        .admin-form-group label svg {
          color: #94a3b8;
        }

        .admin-form-group input {
          padding: 18px 20px;
          border: 2px solid rgba(148, 163, 184, 0.3);
          border-radius: 18px;
          font-size: 1.05rem;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .admin-form-group input::placeholder {
          color: #94a3b8;
        }

        .admin-form-group input:focus {
          outline: none;
          border-color: #60a5fa;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.2);
        }

        /* Submit Button */
        .admin-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          color: white;
          border: none;
          padding: 20px 32px;
          border-radius: 20px;
          font-size: 1.15rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 16px;
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .admin-submit-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.7s;
        }

        .admin-submit-btn:hover::before {
          left: 100%;
        }

        .admin-submit-btn:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(59, 130, 246, 0.6);
        }

        .admin-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* Footer */
        .admin-login-footer {
          text-align: center;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px dashed rgba(148, 163, 184, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #94a3b8;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .admin-login-footer svg {
          color: #fbbf24;
        }

        @media (max-width: 480px) {
          .admin-login-card {
            padding: 40px 32px;
          }
          .admin-login-header h1 {
            font-size: 2.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;