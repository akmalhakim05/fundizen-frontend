import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import { adminService } from '../../services/adminService';
import AdminCampaignManagement from './AdminCampaignManagement';
import AdminUserManagement from './AdminUserManagement';
import AdminSystemStats from './AdminSystemStats';

const AdminDashboard = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const isAdmin = userData?.role === 'admin' || userData?.isAdmin;

  // Handle navigation based on route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/campaigns')) {
      setActiveTab('campaigns');
    } else if (path.includes('/users')) {
      setActiveTab('users');
    } else if (path.includes('/analytics')) {
      setActiveTab('analytics');
    } else if (path.includes('/settings')) {
      setActiveTab('system');
    } else if (path === '/admin' || path === '/admin/') {
      setActiveTab('overview');
    }
  }, [location]);

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

  const fetchPendingCampaigns = async () => {
    try {
      setPendingLoading(true);
      const data = await adminService.getPendingCampaigns();
      setPendingCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching pending campaigns:', error);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleNavigation = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
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

  if (loading && !dashboardData) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  if (error && !dashboardData) {
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
              {dashboardData?.activity?.pendingApprovals > 0 && (
                <span className="admin-header-btn-badge"></span>
              )}
            </button>
            
            <button 
              className="admin-header-btn" 
              title="Settings"
              onClick={() => handleNavigation('system', '/admin/settings')}
            >
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
                  onClick={(e) => { e.preventDefault(); handleNavigation('overview', '/admin'); }}
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
                  onClick={(e) => { e.preventDefault(); handleNavigation('campaigns', '/admin/campaigns'); }}
                >
                  <span className="admin-nav-icon">
                    <i className="fas fa-clipboard-list"></i>
                  </span>
                  <span className="admin-nav-text">Campaigns</span>
                  {dashboardData?.campaigns?.total > 0 && (
                    <span className="admin-nav-badge">
                      {dashboardData.campaigns.total}
                    </span>
                  )}
                </a>
              </li>
              
              <li className="admin-nav-item">
                <a 
                  href="#"
                  className={`admin-nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    fetchPendingCampaigns();
                    setActiveTab('pending');
                  }}
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
                  onClick={(e) => { e.preventDefault(); handleNavigation('users', '/admin/users'); }}
                >
                  <span className="admin-nav-icon">
                    <i className="fas fa-users"></i>
                  </span>
                  <span className="admin-nav-text">Users</span>
                  {dashboardData?.users?.total > 0 && (
                    <span className="admin-nav-badge">
                      {dashboardData.users.total}
                    </span>
                  )}
                </a>
              </li>
              
              <li className="admin-nav-item">
                <a 
                  href="#"
                  className={`admin-nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavigation('analytics', '/admin/analytics'); }}
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
                  onClick={(e) => { e.preventDefault(); handleNavigation('system', '/admin/settings'); }}
                >
                  <span className="admin-nav-icon">
                    <i className="fas fa-cog"></i>
                  </span>
                  <span className="admin-nav-text">Settings</span>
                </a>
              </li>
              
              <li className="admin-nav-item">
                <a 
                  href="#"
                  className="admin-nav-link"
                  onClick={(e) => { e.preventDefault(); handleLogout(); }}
                >
                  <span className="admin-nav-icon">
                    <i className="fas fa-sign-out-alt"></i>
                  </span>
                  <span className="admin-nav-text">Logout</span>
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
          {/* Render content based on active tab */}
          {activeTab === 'overview' && (
            <OverviewTab 
              dashboardData={dashboardData} 
              fetchDashboardData={fetchDashboardData}
              onNavigate={handleNavigation}
            />
          )}
          
          {activeTab === 'campaigns' && (
            <AdminCampaignManagement />
          )}
          
          {activeTab === 'pending' && (
            <PendingApprovalsTab 
              campaigns={pendingCampaigns}
              loading={pendingLoading}
              onRefresh={fetchPendingCampaigns}
            />
          )}
          
          {activeTab === 'users' && (
            <AdminUserManagement />
          )}
          
          {activeTab === 'analytics' && (
            <AdminSystemStats />
          )}
          
          {activeTab === 'system' && (
            <SettingsTab />
          )}
        </div>
      </main>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ dashboardData, fetchDashboardData, onNavigate }) => {
  return (
    <>
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
        <div 
          className="admin-stat-card"
          onClick={() => onNavigate('campaigns', '/admin/campaigns')}
          style={{ cursor: 'pointer' }}
        >
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
        <div 
          className="admin-stat-card variant-orange"
          onClick={() => onNavigate('pending', '/admin')}
          style={{ cursor: 'pointer' }}
        >
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
        <div 
          className="admin-stat-card variant-green"
          onClick={() => onNavigate('users', '/admin/users')}
          style={{ cursor: 'pointer' }}
        >
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
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('pending', '/admin')}
            >
              <i className="fas fa-clipboard-check"></i>
              Review Pending Campaigns
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => onNavigate('analytics', '/admin/analytics')}
            >
              <i className="fas fa-chart-bar"></i>
              View Analytics
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => onNavigate('users', '/admin/users')}
            >
              <i className="fas fa-users"></i>
              Manage Users
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => onNavigate('system', '/admin/settings')}
            >
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
    </>
  );
};

// Pending Approvals Tab Component
const PendingApprovalsTab = ({ campaigns, loading, onRefresh }) => {
  const [processingId, setProcessingId] = useState(null);

  const handleApprove = async (campaignId) => {
    if (!window.confirm('Are you sure you want to approve this campaign?')) return;

    try {
      setProcessingId(campaignId);
      await adminService.approveCampaign(campaignId);
      alert('Campaign approved successfully!');
      onRefresh();
    } catch (error) {
      console.error('Error approving campaign:', error);
      alert('Failed to approve campaign: ' + (error.error || error.message));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (campaignId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setProcessingId(campaignId);
      await adminService.rejectCampaign(campaignId, reason);
      alert('Campaign rejected successfully!');
      onRefresh();
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      alert('Failed to reject campaign: ' + (error.error || error.message));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading pending campaigns..." />;
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <span className="admin-page-title-icon">
            <i className="fas fa-hourglass-half"></i>
          </span>
          Pending Approvals
        </h1>
        <p className="admin-page-description">
          Review and approve campaigns waiting for verification
        </p>
        <div className="admin-page-actions">
          <button className="btn btn-primary" onClick={onRefresh} disabled={loading}>
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: 'var(--secondary-green)', marginBottom: '1rem' }}></i>
            <h3>All caught up!</h3>
            <p>There are no pending campaigns to review at the moment.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {campaigns.map(campaign => (
            <div key={campaign.id} className="card">
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  {campaign.imageUrl ? (
                    <img 
                      src={campaign.imageUrl} 
                      alt={campaign.name}
                      style={{ 
                        width: '120px', 
                        height: '90px', 
                        objectFit: 'cover', 
                        borderRadius: 'var(--radius-md)' 
                      }}
                    />
                  ) : (
                    <div style={{ 
                      width: '120px', 
                      height: '90px', 
                      background: 'var(--bg-tertiary)', 
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem'
                    }}>
                      📋
                    </div>
                  )}
                  
                  <div>
                    <h3 style={{ marginBottom: '0.5rem' }}>{campaign.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <strong>Creator:</strong> {campaign.creatorUsername || 'Unknown'}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
                      <strong>Category:</strong> {campaign.category}
                    </p>
                  </div>
                </div>

                <p style={{ marginBottom: '1.5rem' }}>{campaign.description}</p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleApprove(campaign.id)}
                    disabled={processingId === campaign.id}
                  >
                    <i className="fas fa-check"></i>
                    Approve
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleReject(campaign.id)}
                    disabled={processingId === campaign.id}
                  >
                    <i className="fas fa-times"></i>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// Settings Tab Component
const SettingsTab = () => {
  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <span className="admin-page-title-icon">
            <i className="fas fa-cog"></i>
          </span>
          System Settings
        </h1>
        <p className="admin-page-description">
          Configure and manage system preferences
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">General Settings</h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Platform Name</label>
            <input type="text" className="form-input" defaultValue="Fundizen" />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input type="email" className="form-input" defaultValue="admin@fundizen.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Approval Threshold (MYR)</label>
            <input type="number" className="form-input" defaultValue="10000" />
          </div>
          <button className="btn btn-primary">
            <i className="fas fa-save"></i>
            Save Settings
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card-header">
          <h3 className="card-title">Security Settings</h3>
        </div>
        <div className="card-body">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id="twoFactor" />
            <label className="form-check-label" htmlFor="twoFactor">
              Enable two-factor authentication
            </label>
          </div>
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id="emailNotif" defaultChecked />
            <label className="form-check-label" htmlFor="emailNotif">
              Email notifications for new campaigns
            </label>
          </div>
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id="autoBackup" defaultChecked />
            <label className="form-check-label" htmlFor="autoBackup">
              Automatic daily backups
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;