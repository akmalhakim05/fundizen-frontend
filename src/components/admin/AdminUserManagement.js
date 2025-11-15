import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import '../../styles/components/AdminUserManagement.css';

const AdminUserManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    verified: 'all',
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
    search: ''
  });
  const [pagination, setPagination] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [userStats, setUserStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 0 }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  // Initial data loading
  useEffect(() => {
    fetchUserStats();
    fetchRecentUsers();
  }, []);

  // Fetch functions
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getAllUsersForAdmin(filters);
      setUsers(response.users || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchUserStats = async () => {
    try {
      const stats = await adminService.getUserStatistics();
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const recent = await adminService.getRecentUsers(7);
      setRecentUsers(recent.users || []);
    } catch (error) {
      console.error('Error fetching recent users:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    if (userDetails[userId]) return userDetails[userId];
    
    try {
      const details = await adminService.getUserDetails(userId);
      setUserDetails(prev => ({ ...prev, [userId]: details }));
      return details;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  // User action handlers
  const handlePromoteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to admin?')) return;

    try {
      await adminService.promoteUserToAdmin(userId);
      fetchUsers();
      fetchUserStats();
      alert('User promoted to admin successfully!');
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user: ' + (error.error || error.message));
    }
  };

  const handleDemoteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to demote this admin to regular user?')) return;

    try {
      await adminService.demoteAdminToUser(userId);
      fetchUsers();
      fetchUserStats();
      alert('User demoted successfully!');
    } catch (error) {
      console.error('Error demoting user:', error);
      alert('Failed to demote user: ' + (error.error || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await adminService.deleteUser(userId);
      fetchUsers();
      fetchUserStats();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + (error.error || error.message));
    }
  };

  // Bulk action handlers
  const handleBulkRoleUpdate = async (newRole) => {
    if (selectedUsers.length === 0) {
      alert('Please select users to update');
      return;
    }

    if (!window.confirm(`Are you sure you want to change the role of ${selectedUsers.length} users to ${newRole}?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      const result = await adminService.bulkUpdateUserRoles(selectedUsers, newRole);
      setSelectedUsers([]);
      fetchUsers();
      fetchUserStats();
      alert(`User roles updated successfully! ${result.successCount} succeeded, ${result.failureCount} failed.`);
    } catch (error) {
      console.error('Error updating user roles:', error);
      alert('Failed to update user roles: ' + (error.error || error.message));
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkVerificationUpdate = async (verified) => {
    if (selectedUsers.length === 0) {
      alert('Please select users to update');
      return;
    }

    const action = verified ? 'verify' : 'unverify';
    if (!window.confirm(`Are you sure you want to ${action} ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      const result = await adminService.bulkUpdateUserVerification(selectedUsers, verified);
      setSelectedUsers([]);
      fetchUsers();
      alert(`Users ${action}ed successfully! ${result.successCount} succeeded, ${result.failureCount} failed.`);
    } catch (error) {
      console.error('Error updating user verification:', error);
      alert(`Failed to ${action} users: ` + (error.error || error.message));
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Selection handlers
  const handleSelectUser = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Search and export handlers
  const handleQuickSearch = async (searchType) => {
    try {
      setLoading(true);
      let results = [];
      
      switch (searchType) {
        case 'admins':
          results = await adminService.getUsersByRole('admin');
          break;
        case 'recent':
          const recentData = await adminService.getRecentUsers(30);
          results = recentData.users || [];
          break;
        case 'unverified':
          setFilters(prev => ({ ...prev, verified: 'false', page: 0 }));
          return;
        default:
          return;
      }
      
      // Update the users list with search results
      setUsers(results);
      setPagination(null); // Clear pagination for search results
    } catch (error) {
      console.error(`Error performing quick search ${searchType}:`, error);
      setError(`Failed to search ${searchType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      await adminService.exportData('users', 'csv');
      alert('User data exported successfully!');
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export user data: ' + (error.error || error.message));
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render loading state
  if (loading && users.length === 0) {
    return <LoadingSpinner message="Loading users..." />;
  }

  // Render error state
  if (error && users.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchUsers} />;
  }

  return (
    <div className="admin-user-management">
      {/* Header Section */}
      <div className="user-management-header">
        <h2>👥 User Management</h2>
        <p>Manage user accounts, roles, and permissions</p>
      </div>

      {/* Statistics Section */}
      <div className="user-stats-section">
        <div className="stats-grid">
          <div className="stat-card total-users">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <div className="stat-number">{userStats?.totalUsers || 0}</div>
              <div className="stat-description">Registered users</div>
            </div>
          </div>
          
          <div className="stat-card admin-users">
            <div className="stat-icon">👑</div>
            <div className="stat-content">
              <h3>Administrators</h3>
              <div className="stat-number">{userStats?.adminUsers || 0}</div>
              <div className="stat-description">Admin accounts</div>
            </div>
          </div>
          
          <div className="stat-card recent-users">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Recent Users</h3>
              <div className="stat-number">{recentUsers.length}</div>
              <div className="stat-description">This week</div>
            </div>
          </div>
          
          <div className="stat-card selected-users">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Selected</h3>
              <div className="stat-number">{selectedUsers.length}</div>
              <div className="stat-description">Users selected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h3>🚀 Quick Actions</h3>
        <div className="quick-action-buttons">
          <button 
            onClick={() => handleQuickSearch('admins')} 
            className="quick-action-btn"
            disabled={loading}
          >
            👑 View All Admins
          </button>
          <button 
            onClick={() => handleQuickSearch('recent')} 
            className="quick-action-btn"
            disabled={loading}
          >
            📅 Recent Users (30 days)
          </button>
          <button 
            onClick={() => handleQuickSearch('unverified')} 
            className="quick-action-btn"
            disabled={loading}
          >
            ⚠️ Unverified Users
          </button>
          <button 
            onClick={handleExportUsers} 
            className="quick-action-btn"
            disabled={loading}
          >
            📊 Export Users
          </button>
          <button 
            onClick={fetchUsers} 
            className="quick-action-btn"
            disabled={loading}
          >
            🔄 Refresh All
          </button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="user-controls">
        <div className="user-search">
          <input
            type="text"
            placeholder="Search users by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="user-filters">
          <select 
            value={filters.role} 
            onChange={(e) => setFilters({...filters, role: e.target.value, page: 0})}
          >
            <option value="all">All Roles</option>
            <option value="user">Regular Users</option>
            <option value="admin">Administrators</option>
          </select>

          <select 
            value={filters.verified} 
            onChange={(e) => setFilters({...filters, verified: e.target.value, page: 0})}
          >
            <option value="all">All Verification Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

          <select 
            value={`${filters.sortBy}-${filters.sortDir}`}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split('-');
              setFilters({...filters, sortBy, sortDir, page: 0});
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="username-asc">Username A-Z</option>
            <option value="username-desc">Username Z-A</option>
            <option value="email-asc">Email A-Z</option>
            <option value="email-desc">Email Z-A</option>
          </select>

          <select 
            value={filters.size}
            onChange={(e) => setFilters({...filters, size: parseInt(e.target.value), page: 0})}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>

        {/* Bulk Actions */}
        <div className="bulk-actions">
          {selectedUsers.length > 0 && (
            <>
              <span className="selected-count">
                {selectedUsers.length} selected
              </span>
              <button 
                onClick={() => handleBulkRoleUpdate('admin')}
                disabled={bulkActionLoading}
                className="bulk-btn promote"
              >
                👑 Make Admin
              </button>
              <button 
                onClick={() => handleBulkRoleUpdate('user')}
                disabled={bulkActionLoading}
                className="bulk-btn demote"
              >
                👤 Make User
              </button>
              <button 
                onClick={() => handleBulkVerificationUpdate(true)}
                disabled={bulkActionLoading}
                className="bulk-btn verify"
              >
                ✅ Verify
              </button>
              <button 
                onClick={() => handleBulkVerificationUpdate(false)}
                disabled={bulkActionLoading}
                className="bulk-btn unverify"
              >
                ⚠️ Unverify
              </button>
              <button 
                onClick={() => setSelectedUsers([])}
                disabled={bulkActionLoading}
                className="bulk-btn clear"
              >
                ❌ Clear Selection
              </button>
            </>
          )}
        </div>
      </div>

      {/* User List Section */}
      <div className="user-list">
        <div className="user-list-header">
          <label className="select-all">
            <input
              type="checkbox"
              checked={selectedUsers.length === users.length && users.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span>Select All</span>
          </label>
          <span className="user-count">
            {users.length} users found
            {pagination && ` (Page ${pagination.currentPage + 1} of ${pagination.totalPages})`}
          </span>
        </div>

        {loading && <LoadingSpinner message="Loading users..." />}
        
        {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

        {users.length === 0 && !loading && !error && (
          <div className="no-users">
            <h3>No users found</h3>
            <p>No users match the current search and filters.</p>
            <button onClick={fetchUsers} className="retry-button">
              Refresh
            </button>
          </div>
        )}

        <div className="users-grid">
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isSelected={selectedUsers.includes(user.id)}
              onSelect={(isSelected) => handleSelectUser(user.id, isSelected)}
              onPromote={() => handlePromoteUser(user.id)}
              onDemote={() => handleDemoteUser(user.id)}
              onDelete={() => handleDeleteUser(user.id)}
              onFetchDetails={() => fetchUserDetails(user.id)}
              userDetails={userDetails[user.id]}
              formatDate={formatDate}
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setFilters({...filters, page: Math.max(0, filters.page - 1)})}
              disabled={filters.page === 0}
              className="pagination-btn"
            >
              ← Previous
            </button>
            
            <div className="pagination-info">
              <span>Page {filters.page + 1} of {pagination.totalPages}</span>
              <span>({pagination.totalElements} total users)</span>
            </div>
            
            <button
              onClick={() => setFilters({...filters, page: Math.min(pagination.totalPages - 1, filters.page + 1)})}
              disabled={filters.page >= pagination.totalPages - 1}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// User Card Component
const UserCard = ({ 
  user, 
  isSelected, 
  onSelect, 
  onPromote, 
  onDemote, 
  onDelete,
  onFetchDetails,
  userDetails,
  formatDate 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleToggleDetails = async () => {
    if (!showDetails && !userDetails) {
      setDetailsLoading(true);
      await onFetchDetails();
      setDetailsLoading(false);
    }
    setShowDetails(!showDetails);
  };

  return (
    <div className={`admin-user-card ${isSelected ? 'selected' : ''}`}>
      <div className="user-card-header">
        <label className="user-select">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
          />
        </label>
        <div className="user-badges">
          <div className={`role-badge ${user.role}`}>
            {user.role === 'admin' ? '👑' : '👤'} {user.role}
          </div>
          <div className={`verification-badge ${user.verified ? 'verified' : 'unverified'}`}>
            {user.verified ? '✅' : '⚠️'} {user.verified ? 'Verified' : 'Unverified'}
          </div>
        </div>
      </div>

      <div className="user-card-content">
        <div className="user-avatar">
          <span>{user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}</span>
        </div>

        <div className="user-details">
          <h3 className="user-name">{user.username || 'No username'}</h3>
          <p className="user-email">{user.email}</p>
          
          <div className="user-meta">
            <div className="meta-item">
              <span className="meta-label">Member Since:</span>
              <span className="meta-value">{formatDate(user.createdAt)}</span>
            </div>
            {user.updatedAt !== user.createdAt && (
              <div className="meta-item">
                <span className="meta-label">Last Updated:</span>
                <span className="meta-value">{formatDate(user.updatedAt)}</span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-label">User ID:</span>
              <span className="meta-value">{user.id}</span>
            </div>
          </div>

          {showDetails && userDetails && (
            <div className="user-extended-details">
              <div className="detail-section">
                <h4>📊 Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{userDetails.statistics?.totalCampaigns || 0}</span>
                    <span className="stat-label">Campaigns</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{userDetails.statistics?.activeCampaigns || 0}</span>
                    <span className="stat-label">Active</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{userDetails.statistics?.approvedCampaigns || 0}</span>
                    <span className="stat-label">Approved</span>
                  </div>
                </div>
              </div>

              {userDetails.campaigns && userDetails.campaigns.length > 0 && (
                <div className="detail-section">
                  <h4>📋 Recent Campaigns</h4>
                  <div className="user-campaigns">
                    {userDetails.campaigns.slice(0, 3).map(campaign => (
                      <div key={campaign.id} className="campaign-item">
                        <span className="campaign-name">{campaign.name}</span>
                        <span className={`campaign-status ${campaign.status}`}>
                          {campaign.status}
                        </span>
                      </div>
                    ))}
                    {userDetails.campaigns.length > 3 && (
                      <div className="campaign-item more-campaigns">
                        <span className="campaign-name">
                          +{userDetails.campaigns.length - 3} more campaigns
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {userDetails.user && (
                <div className="detail-section">
                  <h4>🔍 Additional Info</h4>
                  <div className="additional-info">
                    <div className="info-item">
                      <span className="info-label">Firebase UID:</span>
                      <span className="info-value">{userDetails.user.uid || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Account Type:</span>
                      <span className="info-value">
                        {userDetails.user.isAdmin ? 'Administrator' : 'Regular User'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="user-card-actions">
        <button 
          onClick={handleToggleDetails}
          disabled={detailsLoading}
          className="details-btn"
        >
          {detailsLoading ? '⏳' : showDetails ? '🔼' : '🔽'} 
          {showDetails ? 'Hide' : 'Show'} Details
        </button>

        {user.role === 'user' && (
          <button 
            onClick={onPromote}
            className="action-btn promote"
            title="Promote to Administrator"
          >
            👑 Promote
          </button>
        )}

        {user.role === 'admin' && (
          <button 
            onClick={onDemote}
            className="action-btn demote"
            title="Demote to Regular User"
          >
            👤 Demote
          </button>
        )}

        <button 
          onClick={onDelete}
          className="action-btn delete"
          title="Delete User Account"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default AdminUserManagement;