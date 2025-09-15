import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminCampaignManagement from './components/admin/AdminCampaignManagement';
import AdminRoute from './components/admin/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/campaigns" 
              element={
                <AdminRoute>
                  <AdminCampaignManagement />
                </AdminRoute>
              } 
            />
            <Route path="*" element={<AdminLogin />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;