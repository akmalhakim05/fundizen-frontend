import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import { adminService } from '../../services/adminService';

// EXAMPLE: Updated AdminDashboard with Icons (not emojis)
// This demonstrates the improved UI structure

const AdminDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = userData?.role === 'admin' || userData?.isAdmin;

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getDashboardStats();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-content">
          <i className="fas fa-ban" style={{ fontSize: '4rem', color: 'var(--accent-red)', marginBottom: '1rem' }}></i>
          <h2>Access Denied</h2>
          <p>You don't have administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className={`admin-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* TOP HEADER */}
      <header className="admin-header">
        <div className="admin-header-content">
          {/* Mobile Menu Toggle */}
          <button 
            className="admin-mobile-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Brand/Logo */}
          <div className="admin-brand">
            <div className="admin-brand-icon">
              <i className="fas fa-rocket"></i>
            </div>
            <span className="admin-brand-text">Fundizen Admin</span>
          </div>

          {/* Search Bar */}
          <div className="admin-header-search">
            <i className="fas fa-search admin-header-search-icon"></i>
            <input 
              type="text" 
              className="admin-header-search-input" 
              placeholder="Search campaigns, users..."
            />
          </div>

          {/* Header Actions */}
          <div className="admin-header-actions">
            <button className="admin-header-btn" title="Notifications">
              <i className="fas fa-bell"></i>
              <span className="admin-header-btn-badge"></span>
            </button>
            
            <button className="admin-header-btn" title="Settings">
              <i className="fas fa-cog"></i>
            </button>

            {/* User Menu */}
            <div className="admin-header-user">
              <div className="admin-header-user-avatar">
                {userData?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="admin-header-user-info">
                <div className="admin-header-user-name">
                  {userData?.username || currentUser?.email}
                </div>
                <div className="admin-header-user-role">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-inner">
          {/* Main Navigation */}
          <nav className="admin-nav-section">
            <div className="admin-nav-title">Main Menu</div>
            <ul className="admin-nav-list">
              <li className="admin-nav-item">
                <a 
                  href="#"
                  className={`admin-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
                >
                  <span className="admin-nav-icon">
                    <i className="fas fa-chart-line"></i>
                  </span>
                  <span className="admin-nav-text">Overview</span>
                </a>
              </li>
              
              <li className="admin-nav-item">
                <a 
                  href="#"
                  className={`admin-nav-link ${activeTab === 'campaigns' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setActiveTab('campaigns'); }}
                >
                  <span className="admin-nav-icon">
                    <i className="fas fa-clipboard-list"></i>
                  </span>
                  <span className="admin-nav-text">Campaigns</span>
                </a>
              </li>
              
              <li className="admin-nav-item">
                <a 
                  href="#"
                  className={`admin-nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setActiveTab('pending'); }}
                >
                  <span className="admin-nav-icon">
                    <i className="fas fa-hourglass-half"></i>
                  </span>
                  <span className="admin-nav-text">Pending Approvals</span>
                  {dashboardData?.campaigns?.pending > 0 && (
                    <span className="admin-nav-badge">
                      {dashboardData.campaigns.pending}
                    </span>
                  )}
                </a>
              </li>
              
              <li className="admin-nav-item">
                <a 
                  href="#"
                  className={`admin-nav-link ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}
                >
                  <span className="admin-nav-icon">
                    <i className="fas fa-users"></i>
                  </span>
                  <span className="admin-nav-text">Users</span>
                </a>
              </li>
              
              <li className="admin-nav-item">
                <a 
                  href="#"
                  className={`admin-nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); }}
                >
                  <span className="admin-nav-icon">
                    <i className="fas fa-chart-bar"></i>
                  </span>
                  <span className="admin-nav-text">Analytics</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* System Menu */}
          <nav className="admin-nav-section">
            <div className="admin-nav-title">System</div>
            <ul className="admin-nav-list">
              <li className="admin-nav-item">
                <a 
                  href="#"
                  className={`admin-nav-link ${activeTab === 'system' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setActiveTab('system'); }}
                >
                  <span className="admin-nav-icon">
                    <i className="fas fa-cog"></i>
                  </span>
                  <span className="admin-nav-text">Settings</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <div className="admin-main-inner">
          {/* Page Header */}
          <div className="admin-page-header">
            <h1 className="admin-page-title">
              <span className="admin-page-title-icon">
                <i className="fas fa-tachometer-alt"></i>
              </span>
              Dashboard Overview
            </h1>
            <p className="admin-page-description">
              Monitor your platform's performance and manage key operations
            </p>
            <div className="admin-page-actions">
              <button className="btn btn-primary" onClick={fetchDashboardData}>
                <i className="fas fa-sync-alt"></i>
                Refresh Data
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-download"></i>
                Export Report
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="admin-stats-grid">
            {/* Total Campaigns */}
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <div className="admin-stat-card-trend up">
                  <i className="fas fa-arrow-up"></i> 12%
                </div>
              </div>
              <div className="admin-stat-card-body">
                <div className="admin-stat-card-label">Total Campaigns</div>
                <div className="admin-stat-card-value">
                  {dashboardData?.campaigns?.total || 0}
                </div>
              </div>
              <div className="admin-stat-card-footer">
                <i className="fas fa-check-circle"></i>
                {dashboardData?.campaigns?.active || 0} Active
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="admin-stat-card variant-orange">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">
                  <i className="fas fa-hourglass-half"></i>
                </div>
                <div className="admin-stat-card-trend">
                  <i className="fas fa-clock"></i> Needs attention
                </div>
              </div>
              <div className="admin-stat-card-body">
                <div className="admin-stat-card-label">Pending Approvals</div>
                <div className="admin-stat-card-value">
                  {dashboardData?.activity?.pendingApprovals || 0}
                </div>
              </div>
              <div className="admin-stat-card-footer">
                <i className="fas fa-exclamation-triangle"></i>
                Requires review
              </div>
            </div>

            {/* Total Users */}
            <div className="admin-stat-card variant-green">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="admin-stat-card-trend up">
                  <i className="fas fa-arrow-up"></i> 8%
                </div>
              </div>
              <div className="admin-stat-card-body">
                <div className="admin-stat-card-label">Total Users</div>
                <div className="admin-stat-card-value">
                  {dashboardData?.users?.total || 0}
                </div>
              </div>
              <div className="admin-stat-card-footer">
                <i className="fas fa-user-plus"></i>
                25 New this week
              </div>
            </div>

            {/* System Status */}
            <div className="admin-stat-card variant-purple">
              <div className="admin-stat-card-header">
                <div className="admin-stat-card-icon">
                  <i className="fas fa-server"></i>
                </div>
                <div className="admin-stat-card-trend up">
                  <i className="fas fa-check"></i> Healthy
                </div>
              </div>
              <div className="admin-stat-card-body">
                <div className="admin-stat-card-label">System Status</div>
                <div className="admin-stat-card-value" style={{ fontSize: '1.5rem' }}>
                  All Systems Go
                </div>
              </div>
              <div className="admin-stat-card-footer">
                <i className="fas fa-clock"></i>
                Updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-bolt"></i> Quick Actions
              </h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary">
                  <i className="fas fa-clipboard-check"></i>
                  Review Pending Campaigns
                </button>
                <button className="btn btn-secondary">
                  <i className="fas fa-file-download"></i>
                  Generate Reports
                </button>
                <button className="btn btn-outline">
                  <i className="fas fa-cog"></i>
                  System Settings
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-history"></i> Recent Activity
              </h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="alert alert-info">
                  <i className="fas fa-clipboard-list alert-icon"></i>
                  <div className="alert-content">
                    <div className="alert-title">New campaign submitted</div>
                    <div>2 minutes ago</div>
                  </div>
                </div>
                
                <div className="alert alert-success">
                  <i className="fas fa-check-circle alert-icon"></i>
                  <div className="alert-content">
                    <div className="alert-title">Campaign approved</div>
                    <div>1 hour ago</div>
                  </div>
                </div>
                
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle alert-icon"></i>
                  <div className="alert-content">
                    <div className="alert-title">System maintenance scheduled</div>
                    <div>3 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;