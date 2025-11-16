import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/global.css';
import './styles/admin-layout.css';
import AdminLogin from './components/auth/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminCampaignManagement from './components/admin/AdminCampaignManagement';
import AdminUserManagement from './components/admin/AdminUserManagement';
import AdminSystemStats from './components/admin/AdminSystemStats';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Main Admin Dashboard - handles overview and pending approvals */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* Campaign Management */}
            <Route 
              path="/admin/campaigns" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* User Management */}
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* Analytics/System Stats */}
            <Route 
              path="/admin/analytics" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* Settings */}
            <Route 
              path="/admin/settings" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* Fallback to login */}
            <Route path="*" element={<AdminLogin />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;