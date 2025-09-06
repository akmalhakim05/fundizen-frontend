import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/components/AdminUserManagement.css';

const AdminUserManagement = () => {
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 0 }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
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

  const handlePromoteUser = async (userId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to promote this user to admin?')) return;

    try {
      await adminService.promoteUserToAdmin(userId);
      fetchUsers();
      alert('User promoted to admin successfully!');
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user: ' + (error.error || error.message));
    }
  };

  const handleDemoteUser = async (userId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to demote this admin to regular user?')) return;

    try {
      await adminService.demoteAdminToUser(userId);
      fetchUsers();
      alert('User demoted successfully!');
    } catch (error) {
      console.error('Error demoting user:', error);
      alert('Failed to demote user: ' + (error.error || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await adminService.deleteUser(userId);
      fetchUsers();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + (error.error || error.message));
    }
  };

  const handleBulkRoleUpdate = async (newRole) => {
    if (selectedUsers.length === 0) {
      alert('Please select users to update');
      return;
    }

    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Are you sure you want to change the role of ${selectedUsers.length} users to ${newRole}?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      await adminService.bulkUpdateUserRoles(selectedUsers, newRole);
      setSelectedUsers([]);
      fetchUsers();
      alert('User roles updated successfully!');
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
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Are you sure you want to ${action} ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      await adminService.bulkUpdateUserVerification(selectedUsers, verified);
      setSelectedUsers([]);
      fetchUsers();
      alert(`Users ${action}ed successfully!`);
    } catch (error) {
      console.error('Error updating user verification:', error);
      alert(`Failed to ${action} users: ` + (error.error || error.message));
    } finally {
      setBulkActionLoading(false);
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner message="Loading users..." />;
  }

  if (error && users.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchUsers} />;
  }

  return (
    <div className="admin-user-management">
      <div className="user-management-header">
        <h2>👥 User Management</h2>
        <p>Manage user accounts, roles, and permissions</p>
      </div>

      {/* Search and Filters */}
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
        </div>

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
            </>
          )}
        </div>
      </div>

      {/* User List */}
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
          </span>
        </div>

        {loading && <LoadingSpinner message="Loading users..." />}
        
        {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

        {users.length === 0 && !loading && !error && (
          <div className="no-users">
            <h3>No users found</h3>
            <p>No users match the current search and filters.</p>
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
            
            <span className="pagination-info">
              Page {filters.page + 1} of {pagination.totalPages}
            </span>
            
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
          <span>{user.username ? user.username[0].toUpperCase() : '?'}</span>
        </div>

        <div className="user-details">
          <h3 className="user-name">{user.username}</h3>
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
          >
            👑 Promote
          </button>
        )}

        {user.role === 'admin' && (
          <button 
            onClick={onDemote}
            className="action-btn demote"
          >
            👤 Demote
          </button>
        )}

        <button 
          onClick={onDelete}
          className="action-btn delete"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default AdminUserManagement;