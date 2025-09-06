import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, userData } = useAuth();

  // Check if user is logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if user is admin
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin;
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;