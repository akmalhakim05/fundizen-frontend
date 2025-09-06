import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { adminService } from '../../services/adminService';
import '../../styles/components/AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  // Check if user is admin
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'campaigns', label: 'Campaigns', icon: '📋' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'pending', label: 'Pending Approvals', icon: '⏳' },
    { id: 'system', label: 'System', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={dashboardData} onRefresh={fetchDashboardData} />;
      case 'campaigns':
        return <CampaignsTab />;
      case 'users':
        return <UsersTab />;
      case 'pending':
        return <PendingApprovalsTab />;
      case 'system':
        return <SystemTab />;
      default:
        return <OverviewTab data={dashboardData} onRefresh={fetchDashboardData} />;
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-content">
          <h2>🚫 Access Denied</h2>
          <p>You don't have administrator privileges to access this page.</p>
          <p>Please contact your system administrator if you believe this is an error.</p>
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
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🛠️ Admin Dashboard</h1>
        <p>Manage campaigns, users, and system settings</p>
        <div className="admin-user-info">
          <span>Welcome, {userData?.username || currentUser?.email}</span>
          <span className="admin-badge">Administrator</span>
        </div>
      </div>

      <div className="admin-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.id === 'pending' && dashboardData?.campaigns?.pending > 0 && (
              <span className="notification-badge">{dashboardData.campaigns.pending}</span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ data, onRefresh }) => {
  if (!data) return <LoadingSpinner message="Loading overview..." />;

  return (
    <div className="overview-tab">
      <div className="overview-header">
        <h2>📊 System Overview</h2>
        <button onClick={onRefresh} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card campaigns">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Campaigns</h3>
            <div className="stat-number">{data.campaigns?.total || 0}</div>
            <div className="stat-breakdown">
              <span>Active: {data.campaigns?.active || 0}</span>
              <span>Pending: {data.campaigns?.pending || 0}</span>
              <span>Approved: {data.campaigns?.approved || 0}</span>
            </div>
          </div>
        </div>

        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Users</h3>
            <div className="stat-number">{data.users?.total || 0}</div>
            <div className="stat-breakdown">
              <span>Verified: {data.users?.verified || 0}</span>
              <span>Admins: {data.users?.admins || 0}</span>
              <span>Recent: {data.users?.recentSignups || 0}</span>
            </div>
          </div>
        </div>

        <div className="stat-card activity">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Activity</h3>
            <div className="stat-number">{data.activity?.pendingApprovals || 0}</div>
            <div className="stat-breakdown">
              <span>Pending Work: {data.activity?.totalPendingWork || 0}</span>
              <span>Recent Users: {data.activity?.recentUsersCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="stat-card system">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <h3>System Status</h3>
            <div className="stat-status healthy">Healthy</div>
            <div className="stat-breakdown">
              <span>Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>🚀 Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary">
            📋 Review Pending Campaigns
          </button>
          <button className="action-btn secondary">
            👥 Manage Users
          </button>
          <button className="action-btn tertiary">
            📊 Generate Reports
          </button>
        </div>
      </div>

      <div className="recent-activity">
        <h3>📈 Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">📋</span>
            <span className="activity-text">New campaign submitted for review</span>
            <span className="activity-time">2 minutes ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">👤</span>
            <span className="activity-text">New user registered</span>
            <span className="activity-time">15 minutes ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">✅</span>
            <span className="activity-text">Campaign approved</span>
            <span className="activity-time">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Campaigns Tab Component
const CampaignsTab = () => {
  return (
    <div className="campaigns-tab">
      <h2>📋 Campaign Management</h2>
      <p>Campaign management functionality will be implemented here.</p>
    </div>
  );
};

// Users Tab Component
const UsersTab = () => {
  return (
    <div className="users-tab">
      <h2>👥 User Management</h2>
      <p>User management functionality will be implemented here.</p>
    </div>
  );
};

// Pending Approvals Tab Component
const PendingApprovalsTab = () => {
  return (
    <div className="pending-tab">
      <h2>⏳ Pending Approvals</h2>
      <p>Pending approvals functionality will be implemented here.</p>
    </div>
  );
};

// System Tab Component
const SystemTab = () => {
  return (
    <div className="system-tab">
      <h2>⚙️ System Management</h2>
      <p>System management functionality will be implemented here.</p>
    </div>
  );
};

export default AdminDashboard;