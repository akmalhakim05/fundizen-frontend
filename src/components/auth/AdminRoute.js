// src/routes/AdminRoute.js (or wherever it is)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // FIXED: Accept both lowercase/uppercase and missing fields
  const isAdmin = 
    userData?.isAdmin === true || 
    userData?.role === 'admin' || 
    userData?.role === 'ADMIN' ||      // ← this is the most common case
    userData?.role === 'Admin';

  if (!isAdmin) {
    console.warn('AdminRoute: Access denied →', { userData }); // debug helper
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;