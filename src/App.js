import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminCampaignManagement from './components/admin/AdminCampaignManagement';
import AdminRoute from './components/admin/AdminRoute';

// Simple admin login component
const AdminLogin = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Admin Login</h1>
    <p>Admin authentication interface</p>
  </div>
);

function App() {
  return (
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
  );
}

export default App;