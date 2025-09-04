import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/components/EmailVerification.css';

const EmailVerification = () => {
  const [status, setStatus] = useState('checking'); // checking, verified, unverified, error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get registration data from navigation state
  const registrationData = location.state?.registrationData;

  useEffect(() => {
    checkVerificationStatus();
    
    // Start cooldown timer if there's a cooldown
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const checkVerificationStatus = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await authService.checkEmailVerification();
      
      if (result.emailVerified) {
        setStatus('verified');
        setUserEmail(result.email);
        
        // If we have registration data, complete the registration
        if (registrationData) {
          await completeRegistration();
        } else {
          // Just redirect to login for existing users
          setTimeout(() => {
            navigate('/login', { 
              state: { message: 'Email verified successfully! Please login.' }
            });
          }, 2000);
        }
      } else {
        setStatus('unverified');
        setUserEmail(result.email);
      }
      
    } catch (error) {
      console.error('Error checking verification status:', error);
      setStatus('error');
      setError(error.message || 'Error checking verification status');
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await authService.completeRegistration(registrationData);
      
      setSuccess('Account created successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error completing registration:', error);
      setError(error.error || error.message || 'Error completing registration');
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await authService.resendEmailVerification();
      
      setSuccess('Verification email sent! Please check your inbox.');
      setResendCooldown(60); // 60 second cooldown
      
    } catch (error) {
      console.error('Error resending verification email:', error);
      setError(error.message || 'Error sending verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = () => {
    setStatus('checking');
    checkVerificationStatus();
  };

  if (status === 'checking') {
    return (
      <div className="email-verification-container">
        <div className="verification-card">
          <LoadingSpinner message="Checking email verification status..." />
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <div className="verification-card">
        {status === 'verified' && (
          <div className="verification-success">
            <div className="verification-icon success">✅</div>
            <h2>Email Verified Successfully!</h2>
            <p>Your email address <strong>{userEmail}</strong> has been verified.</p>
            {registrationData ? (
              <>
                {loading ? (
                  <LoadingSpinner message="Completing your registration..." />
                ) : success ? (
                  <div className="success-message">{success}</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <p>Completing your account setup...</p>
                )}
              </>
            ) : (
              <p>You can now login to your account.</p>
            )}
          </div>
        )}

        {status === 'unverified' && (
          <div className="verification-pending">
            <div className="verification-icon pending">📧</div>
            <h2>Email Verification Required</h2>
            <p>
              We've sent a verification email to <strong>{userEmail}</strong>. 
              Please check your inbox and click the verification link to activate your account.
            </p>
            
            <div className="verification-instructions">
              <h3>What to do next:</h3>
              <ol>
                <li>Check your email inbox for a message from Fundizen</li>
                <li>Click the verification link in the email</li>
                <li>Return to this page and click "Check Status"</li>
              </ol>
              
              <div className="help-text">
                <p><strong>Can't find the email?</strong></p>
                <ul>
                  <li>Check your spam/junk folder</li>
                  <li>Make sure you entered the correct email address</li>
                  <li>Wait a few minutes for the email to arrive</li>
                </ul>
              </div>
            </div>

            <div className="verification-actions">
              <button 
                className="btn btn-primary"
                onClick={handleRefreshStatus}
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
              
              <button 
                className="btn btn-outline"
                onClick={resendVerificationEmail}
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0 
                  ? `Resend Email (${resendCooldown}s)` 
                  : loading 
                    ? 'Sending...' 
                    : 'Resend Email'
                }
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </div>
        )}

        {status === 'error' && (
          <div className="verification-error">
            <div className="verification-icon error">❌</div>
            <h2>Verification Error</h2>
            <p>We encountered an error while checking your email verification status.</p>
            
            <div className="error-message">{error}</div>
            
            <div className="verification-actions">
              <button 
                className="btn btn-primary"
                onClick={handleRefreshStatus}
                disabled={loading}
              >
                Try Again
              </button>
              
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/register')}
              >
                Back to Registration
              </button>
            </div>
          </div>
        )}

        <div className="verification-footer">
          <p>
            Need help? <a href="/contact">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;