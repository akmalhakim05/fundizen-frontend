import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import '../../styles/components/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationError, setVerificationError] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success messages from other pages
  useEffect(() => {
    if (location.state?.message) {
      setResendSuccess(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationError(null);
    setResendSuccess('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if it's an email verification error
      if (error.requiresEmailVerification) {
        setVerificationError({
          message: error.message || error.error,
          email: error.email || formData.email
        });
      } else {
        // Handle other types of errors
        if (error.error) {
          setError(error.error);
        } else if (error.message) {
          setError(error.message);
        } else if (typeof error === 'string') {
          setError(error);
        } else {
          setError('Login failed. Please check your credentials and try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      setResendSuccess('');
      setError('');

      await authService.resendEmailVerification();
      setResendSuccess('Verification email sent! Please check your inbox.');
      
    } catch (error) {
      console.error('Resend verification error:', error);
      setError(error.message || 'Error sending verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoToVerification = () => {
    navigate('/verify-email');
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login to Fundizen</h2>
        
        {error && <div className="error-message">{error}</div>}
        {resendSuccess && <div className="success-message">{resendSuccess}</div>}
        
        {verificationError && (
          <div className="login-error verification-required">
            <strong>📧 Email Verification Required</strong>
            <p>{verificationError.message}</p>
            
            <div className="verification-help">
              <h4>What can you do?</h4>
              <ul>
                <li>Check your email inbox for a verification message</li>
                <li>Look in your spam/junk folder</li>
                <li>Click the verification link in the email</li>
                <li>Request a new verification email if needed</li>
              </ul>
            </div>
            
            <div className="verification-actions">
              <button 
                className="btn btn-primary"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <button 
                className="btn btn-outline"
                onClick={handleGoToVerification}
              >
                Check Verification Status
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email or Username</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email or username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Sign up here</Link>
        </p>
        
        <p className="auth-link">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;