import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, userData } = useAuth();

  // Show loading or redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if email is verified
  if (currentUser && !currentUser.emailVerified) {
    return (
      <div className="verification-notice">
        <h3>Email Verification Required</h3>
        <p>Please check your email and verify your account before accessing this page.</p>
        <p>Didn't receive the email? Check your spam folder or contact support.</p>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;