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
        return <PendingApprovalsTab data={dashboardData} onRefresh={fetchDashboardData} />;
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
const PendingApprovalsTab = ({ data, onRefresh }) => {
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchPendingCampaigns();
  }, []);

  const fetchPendingCampaigns = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getPendingCampaigns();
      setPendingCampaigns(response.campaigns || []);
    } catch (error) {
      console.error('Error fetching pending campaigns:', error);
      setError('Failed to load pending campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campaignId) => {
    try {
      setActionLoading(prev => ({ ...prev, [campaignId]: 'approving' }));
      await adminService.approveCampaign(campaignId);
      
      // Remove from pending list
      setPendingCampaigns(prev => prev.filter(c => c.id !== campaignId));
      
      // Refresh dashboard data
      if (onRefresh) onRefresh();
      
      alert('Campaign approved successfully!');
    } catch (error) {
      console.error('Error approving campaign:', error);
      alert('Failed to approve campaign: ' + (error.error || error.message));
    } finally {
      setActionLoading(prev => ({ ...prev, [campaignId]: null }));
    }
  };

  const handleReject = async (campaignId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    try {
      setActionLoading(prev => ({ ...prev, [campaignId]: 'rejecting' }));
      await adminService.rejectCampaign(campaignId, reason || '');
      
      // Remove from pending list
      setPendingCampaigns(prev => prev.filter(c => c.id !== campaignId));
      
      // Refresh dashboard data
      if (onRefresh) onRefresh();
      
      alert('Campaign rejected successfully!');
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      alert('Failed to reject campaign: ' + (error.error || error.message));
    } finally {
      setActionLoading(prev => ({ ...prev, [campaignId]: null }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="pending-tab">
      <div className="pending-header">
        <h2>⏳ Pending Approvals</h2>
        <p>Review and approve campaigns waiting for verification</p>
        <button onClick={fetchPendingCampaigns} className="refresh-btn" disabled={loading}>
          🔄 {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && <LoadingSpinner message="Loading pending campaigns..." />}
      
      {error && <ErrorMessage message={error} onRetry={fetchPendingCampaigns} />}

      {!loading && !error && (
        <>
          <div className="pending-stats">
            <div className="stat-card pending-count">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pending Campaigns</h3>
                <div className="stat-number">{pendingCampaigns.length}</div>
                <div className="stat-description">Awaiting your review</div>
              </div>
            </div>
            
            <div className="stat-card total-pending-value">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Pending Value</h3>
                <div className="stat-number">
                  {formatCurrency(
                    pendingCampaigns.reduce((sum, c) => sum + (c.goalAmount || 0), 0)
                  )}
                </div>
                <div className="stat-description">Goal amount sum</div>
              </div>
            </div>
          </div>

          {pendingCampaigns.length === 0 ? (
            <div className="no-pending">
              <div className="no-pending-icon">✅</div>
              <h3>All caught up!</h3>
              <p>There are no campaigns pending approval at the moment.</p>
            </div>
          ) : (
            <div className="pending-campaigns-list">
              {pendingCampaigns.map(campaign => (
                <PendingCampaignCard 
                  key={campaign.id}
                  campaign={campaign}
                  onApprove={() => handleApprove(campaign.id)}
                  onReject={() => handleReject(campaign.id)}
                  isLoading={actionLoading[campaign.id]}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Pending Campaign Card Component
const PendingCampaignCard = ({ 
  campaign, 
  onApprove, 
  onReject, 
  isLoading,
  formatCurrency,
  formatDate 
}) => {
  return (
    <div className="pending-campaign-card">
      <div className="campaign-header">
        <div className="campaign-image">
          {campaign.imageUrl ? (
            <img src={campaign.imageUrl} alt={campaign.name} />
          ) : (
            <div className="no-image-placeholder">📋</div>
          )}
        </div>
        
        <div className="campaign-info">
          <h3 className="campaign-name">{campaign.name}</h3>
          <p className="campaign-creator">
            <strong>Creator:</strong> {campaign.creatorUsername || 'Unknown'}
          </p>
          <p className="campaign-category">
            <strong>Category:</strong> {campaign.category}
          </p>
          <p className="campaign-submitted">
            <strong>Submitted:</strong> {formatDate(campaign.createdAt)}
          </p>
        </div>
      </div>

      <div className="campaign-details">
        <div className="campaign-description">
          <h4>Description</h4>
          <p>{campaign.description}</p>
        </div>

        <div className="campaign-metrics">
          <div className="metric">
            <span className="metric-label">Goal Amount</span>
            <span className="metric-value">{formatCurrency(campaign.goalAmount)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Duration</span>
            <span className="metric-value">
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Campaign Length</span>
            <span className="metric-value">{campaign.daysRemaining} days</span>
          </div>
        </div>

        {campaign.documentUrl && (
          <div className="campaign-documents">
            <h4>Supporting Documents</h4>
            <a 
              href={campaign.documentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="document-link"
            >
              📄 View Document
            </a>
          </div>
        )}
      </div>

      <div className="campaign-actions">
        <button 
          onClick={onApprove}
          disabled={isLoading}
          className={`action-btn approve ${isLoading === 'approving' ? 'loading' : ''}`}
        >
          {isLoading === 'approving' ? (
            <>
              <span className="spinner"></span>
              Approving...
            </>
          ) : (
            <>
              ✅ Approve Campaign
            </>
          )}
        </button>
        
        <button 
          onClick={onReject}
          disabled={isLoading}
          className={`action-btn reject ${isLoading === 'rejecting' ? 'loading' : ''}`}
        >
          {isLoading === 'rejecting' ? (
            <>
              <span className="spinner"></span>
              Rejecting...
            </>
          ) : (
            <>
              ❌ Reject Campaign
            </>
          )}
        </button>
      </div>
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