// src/components/admin/tabs/AdminUserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import userService from '../../../services/userService'; // <-- Now using dedicated userService
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import {
  Users, Shield, Crown, UserCheck, UserX, Search, RefreshCw,
  Download, Filter, ChevronLeft, ChevronRight, MoreVertical,
  Trash2, UserPlus, UserMinus, CheckCircle, XCircle, Eye, EyeOff
} from 'lucide-react';

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
  const [userDetailsMap, setUserDetailsMap] = useState({}); // { userId: details }

  // Debounced search
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getAllUsersForAdmin(filters);
      setUsers(response.users || []);
      setPagination(response.pagination || null);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchUserDetails = async (userId) => {
    if (userDetailsMap[userId]) return userDetailsMap[userId];

    try {
      const details = await userService.getUserDetails(userId);
      setUserDetailsMap(prev => ({ ...prev, [userId]: details }));
      return details;
    } catch (err) {
      console.error('Failed to load user details:', err);
      return null;
    }
  };

  const handlePromoteUser = async (id) => {
    if (!window.confirm('Promote this user to Administrator?')) return;
    try {
      await userService.promoteUserToAdmin(id);
      fetchUsers();
      alert('User promoted successfully!');
    } catch (err) {
      alert('Failed to promote: ' + (err.error || err.message || 'Unknown error'));
    }
  };

  const handleDemoteUser = async (id) => {
    if (!window.confirm('Demote this admin to regular user?')) return;
    try {
      await userService.demoteAdminToUser(id);
      fetchUsers();
      alert('User demoted successfully!');
    } catch (err) {
      alert('Failed to demote: ' + (err.error || err.message || 'Unknown error'));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    try {
      await userService.deleteUser(id);
      fetchUsers();
      alert('User deleted successfully!');
    } catch (err) {
      alert('Failed to delete: ' + (err.error || err.message || 'Unknown error'));
    }
  };

  const handleBulkRoleUpdate = async (newRole) => {
    if (selectedUsers.length === 0) return alert('Please select at least one user');
    if (!window.confirm(`Change role of ${selectedUsers.length} user(s) to ${newRole.toUpperCase()}?`)) return;

    try {
      setBulkActionLoading(true);
      const result = await userService.bulkUpdateUserRoles(selectedUsers, newRole);
      setSelectedUsers([]);
      fetchUsers();
      alert(`Success: ${result.successCount} | Failed: ${result.failureCount}`);
    } catch (err) {
      alert('Bulk update failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectUser = (id, checked) => {
    setSelectedUsers(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  };

  const handleSelectAll = (checked) => {
    setSelectedUsers(checked ? users.map(u => u.id) : []);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
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

  if (loading && users.length === 0) return <LoadingSpinner message="Loading users..." />;
  if (error && users.length === 0) return <ErrorMessage message={error} onRetry={fetchUsers} />;

  return (
    <div className="admin-user-management">
      <style jsx>{`
        .admin-user-management {
          padding: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .page-header h1 {
          font-size: 2.8rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 18px;
          margin: 0 0 12px 0;
        }

        .page-header p {
          font-size: 1.2rem;
          color: #64748b;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 28px;
          margin: 48px 0;
        }

        .stat-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 24px;
          transition: all 0.4s ease;
        }

        .stat-card:hover { transform: translateY(-10px); }

        .stat-card.blue { border-left: 6px solid #3b82f6; }
        .stat-card.purple { border-left: 6px solid #8b5cf6; }
        .stat-card.emerald { border-left: 6px solid #10b981; }
        .stat-card.orange { border-left: 6px solid #f97316; }

        .stat-card .label {
          font-size: 1rem;
          color: #64748b;
          margin-bottom: 4px;
        }

        .stat-card .value {
          font-size: 2.4rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .quick-actions {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.08);
          margin-bottom: 40px;
        }

        .quick-actions h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 24px;
          color: #0f172a;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .action-buttons button {
          padding: 16px 20px;
          border-radius: 18px;
          background: linear-gradient(135deg, #1e6cff, #4c8aff);
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s;
        }

        .action-buttons button:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(30,108,255,0.3);
        }

        .controls-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
          margin-bottom: 32px;
          background: white;
          padding: 24px;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-box input {
          width: 100%;
          padding: 16px 20px 16px 52px;
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          font-size: 1rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #1e6cff;
          box-shadow: 0 0 0 5px rgba(30,108,255,0.15);
        }

        .search-box svg {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .filters select {
          padding: 14px 18px;
          border-radius: 16px;
          border: 2px solid #e2e8f0;
          background: white;
          font-weight: 500;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: #fff7ed;
          border-radius: 18px;
          font-weight: 600;
        }

        .bulk-actions button {
          padding: 10px 16px;
          border-radius: 14px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .users-grid {
          display: grid;
          gap: 28px;
        }

        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          font-weight: 600;
          color: #475569;
        }

        .user-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 15px 40px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          transition: all 0.4s ease;
        }

        .user-card:hover { transform: translateY(-12px); box-shadow: 0 25px 60px rgba(0,0,0,0.15); }
        .user-card.selected { border: 3px solid #3b82f6; }

        .card-header {
          background: linear-gradient(135deg, #1e6cff, #4c8aff);
          color: white;
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
        }

        .badges {
          display: flex;
          gap: 12px;
        }

        .badge {
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .badge.admin { background: #fbbf24; }
        .badge.user { background: #64748b; color: white; }
        .badge.verified { background: #10b981; color: white; }
        .badge.unverified { background: #ef4444; color: white; }

        .card-body {
          padding: 32px;
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 32px;
          align-items: start;
        }

        .avatar {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #1e6cff, #4c8aff);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2.5rem;
          font-weight: 800;
          box-shadow: 0 10px 30px rgba(30,108,255,0.4);
        }

        .user-info h3 {
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #0f172a;
        }

        .user-info p {
          color: #64748b;
          margin: 4px 0;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 20px;
          font-size: 0.95rem;
        }

        .meta-item {
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 12px;
        }

        .meta-label { color: #64748b; font-weight: 500; }
        .meta-value { color: #0f172a; font-weight: 600; margin-top: 4px; display: block; }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-btn {
          padding: 14px 20px;
          border-radius: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .action-btn.promote { background: #fbbf24; color: #000; }
        .action-btn.demote { background: #64748b; color: white; }
        .action-btn.delete { background: #ef4444; color: white; }
        .action-btn.details { background: #f1f5f9; color: #475569; }

        .action-btn:hover { transform: translateY(-4px); }

        .details-panel {
          background: #f8fafc;
          padding: 28px 32px;
          border-top: 1px solid #e2e8f0;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          margin: 60px 0 20px;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .pagination button {
          padding: 14px 28px;
          border-radius: 18px;
          background: #1e6cff;
          color: white;
          border: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .pagination button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .card-body { grid-template-columns: 1fr; gap: 24px; }
          .actions { flex-direction: row; justify-content: center; }
        }

        @media (max-width: 640px) {
          .admin-user-management { padding: 24px; }
          .controls-bar { flex-direction: column; align-items: stretch; }
          .search-box { min-width: auto; }
        }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <h1><Users size={42} /> User Management</h1>
        <p>Manage roles, verification status, and user accounts</p>
      </div>

      {/* Search & Filters Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 0 }))}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="user">Users Only</option>
          </select>

          <select
            value={filters.verified}
            onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value, page: 0 }))}
          >
            <option value="all">All Status</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>

          <button onClick={fetchUsers} className="refresh-btn">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedUsers.length} selected</span>
          <div>
            <button onClick={() => handleBulkRoleUpdate('admin')} disabled={bulkActionLoading}>
              <Crown size={18} /> Make Admin
            </button>
            <button onClick={() => handleBulkRoleUpdate('user')} disabled={bulkActionLoading}>
              <UserMinus size={18} /> Make User
            </button>
          </div>
        </div>
      )}

      {/* Users Grid */}
      <div className="users-grid">
        {users.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', fontSize: '1.2rem', color: '#64748b' }}>
            No users found matching your criteria.
          </p>
        ) : (
          users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isSelected={selectedUsers.includes(user.id)}
              onSelect={(checked) => handleSelectUser(user.id, checked)}
              onPromote={() => handlePromoteUser(user.id)}
              onDemote={() => handleDemoteUser(user.id)}
              onDelete={() => handleDeleteUser(user.id)}
              onFetchDetails={() => fetchUserDetails(user.id)}
              details={userDetailsMap[user.id]}
              formatDate={formatDate}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 0}
          >
            <ChevronLeft size={20} /> Previous
          </button>

          <span>
            Page {pagination.currentPage + 1} of {pagination.totalPages} 
            ({pagination.totalElements.toLocaleString()} total)
          </span>

          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page >= pagination.totalPages - 1}
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

// Reusable User Card Component
const UserCard = ({ user, isSelected, onSelect, onPromote, onDemote, onDelete, onFetchDetails, details, formatDate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const toggleDetails = async () => {
    if (!showDetails && !details) {
      setLoadingDetails(true);
      await onFetchDetails();
      setLoadingDetails(false);
    }
    setShowDetails(prev => !prev);
  };

  return (
    <div className={`user-card ${isSelected ? 'selected' : ''}`}>
      <div className="card-header">
        <label>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
          />
          Select
        </label>
        <div className="badges">
          <span className={`badge ${user.role}`}>
            {user.role === 'admin' ? <Crown size={16} /> : <Users size={16} />}
            {user.role.toUpperCase()}
          </span>
          <span className={`badge ${user.verified ? 'verified' : 'unverified'}`}>
            {user.verified ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {user.verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="avatar">
          {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
        </div>

        <div className="user-info">
          <h3>{user.username || 'No Username'}</h3>
          <p>{user.email}</p>
          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">Joined</span>
              <span className="meta-value">{formatDate(user.createdAt)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">User ID</span>
              <span className="meta-value">{user.id.slice(0, 10)}...</span>
            </div>
          </div>
        </div>

        <div className="actions">
          <button onClick={toggleDetails} className="action-btn details" disabled={loadingDetails}>
            {loadingDetails ? 'Loading...' : (showDetails ? <EyeOff size={18} /> : <Eye size={18} />)}
            {showDetails ? 'Hide' : 'View'} Details
          </button>

          {user.role === 'user' && (
            <button onClick={onPromote} className="action-btn promote">
              <Crown size={18} /> Promote to Admin
            </button>
          )}
          {user.role === 'admin' && (
            <button onClick={onDemote} className="action-btn demote">
              <UserMinus size={18} /> Demote to User
            </button>
          )}
          <button onClick={onDelete} className="action-btn delete">
            <Trash2 size={18} /> Delete User
          </button>
        </div>
      </div>

      {showDetails && details && (
        <div className="details-panel">
          <h4>User Details</h4>
          <p><strong>Full Name:</strong> {details.user?.fullName || 'N/A'}</p>
          <p><strong>Phone:</strong> {details.user?.phone || 'Not provided'}</p>
          <p><strong>Location:</strong> {details.user?.location || 'Not set'}</p>
          <p><strong>Total Campaigns:</strong> {details.statistics?.totalCampaigns || 0}</p>
          <p><strong>Active Campaigns:</strong> {details.statistics?.activeCampaigns || 0}</p>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;