// src/components/admin/tabs/AdminUserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import userService from '../../../services/userService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import {
  Users, Crown, Search, RefreshCw, Eye, EyeOff,
  Trash2, Calendar, Mail, IdCard, MapPin, Phone, Trophy
} from 'lucide-react';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [userDetailsMap, setUserDetailsMap] = useState({});
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [statistics, setStatistics] = useState({
    totalVerified: 0,
    totalUnverified: 0,
    totalUsersByRole: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm.trim(), page: 0 }));
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getAllUsersForAdmin(filters);
      setUsers(response.users || []);
      setPagination(response.pagination || null);

      if (response.statistics) {
        setStatistics({
          totalVerified: response.statistics.totalVerified ?? 0,
          totalUnverified: response.statistics.totalUnverified ?? 0,
          totalUsersByRole: response.statistics.totalUsersByRole ?? 0,
        });
      }
    } catch (err) {
      setError('Failed to load users.');
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
      return null;
    }
  };

  const handlePromote = async (id) => {
    if (!window.confirm('Promote this user to Admin?')) return;
    await userService.promoteUserToAdmin(id);
    fetchUsers();
  };

  const handleDemote = async (id) => {
    if (!window.confirm('Demote this Admin to regular User?')) return;
    await userService.demoteAdminToUser(id);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    await userService.deleteUser(id);
    fetchUsers();
  };

  const toggleDetails = async (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
      if (!userDetailsMap[userId]) await fetchUserDetails(userId);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading && users.length === 0) return <LoadingSpinner message="Loading users..." />;
  if (error && users.length === 0) return <ErrorMessage message={error} onRetry={fetchUsers} />;

  return (
    <div className="admin-users-container">
      <style jsx>{`
        .admin-users-container {
          padding: 2.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f5 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        /* Header */
        .header h1 {
          font-size: 2.8rem;
          font-weight: 900;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0 0 0.5rem;
        }
        .header p { color: #64748b; font-size: 1.2rem; }

        /* Statistics Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 2rem;
          margin: 3rem 0 2.5rem;
        }
        .stat-card {
          background: white;
          padding: 2.2rem;
          border-radius: 2rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.09);
          text-align: center;
          transition: all 0.4s ease;
          border: 1px solid rgba(226,232,240,0.6);
        }
        .stat-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.16);
        }
        .stat-value {
          font-size: 3.4rem;
          font-weight: 900;
          line-height: 1;
        }
        .stat-verified { color: #10b981; }
        .stat-unverified { color: #f59e0b; }
        .stat-total {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label {
          color: #64748b;
          font-weight: 600;
          font-size: 1.15rem;
          margin-top: 0.8rem;
          letter-spacing: 0.5px;
        }

        /* Controls */
        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: center;
          background: white;
          padding: 1.8rem 2.2rem;
          border-radius: 1.8rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          margin-bottom: 3rem;
        }
        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 320px;
        }
        .search-wrapper input {
          width: 100%;
          padding: 1.1rem 1.2rem 1.1rem 3.8rem;
          border: 2px solid #e2e8f0;
          border-radius: 1.5rem;
          font-size: 1.05rem;
        }
        .search-wrapper input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 6px rgba(99,102,241,0.15);
        }
        .search-wrapper svg {
          position: absolute;
          left: 1.4rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .filter-select, .refresh-btn {
          padding: 1rem 1.8rem;
          border-radius: 1.4rem;
          font-weight: 600;
        }
        .filter-select { border: 2px solid #e2e8f0; background: white; }
        .refresh-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        /* Users Grid */
        .users-grid {
          display: grid;
          gap: 2rem;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        }
        .user-card {
          background: white;
          border-radius: 2rem;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(226,232,240,0.8);
          transition: all 0.4s ease;
          position: relative;
        }
        .user-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 6px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
          border-radius: 2rem 2rem 0 0;
        }
        .user-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.18);
        }

        /* Card Header */
        .card-header {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1));
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .user-name { font-size: 1.6rem; font-weight: 800; color: #1e293b; }
        .user-email { color: #64748b; font-size: 1rem; }

        .badge-group { display: flex; gap: 0.8rem; flex-wrap: wrap; }
        .badge {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.85rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .badge-admin { background: rgba(251,187,36,0.15); color: #d97706; border: 1px solid rgba(251,187,36,0.3); }
        .badge-user { background: rgba(100,116,139,0.15); color: #475569; border: 1px solid rgba(100,116,139,0.3); }
        .badge-verified { background: rgba(16,185,129,0.15); color: #059669; border: 1px solid rgba(16,185,129,0.3); }
        .badge-unverified { background: rgba(239,68,68,0.15); color: #dc2626; border: 1px solid rgba(239,68,68,0.3); }

        /* Card Body */
        .card-body { padding: 2rem; }
        .card-body-layout { display: flex; gap: 1.8rem; align-items: flex-start; }
        .avatar-section { flex-shrink: 0; position: relative; }
        .user-info-main { flex: 1; min-width: 0; }
        .user-info-main .user-name { font-size: 1.75rem; margin: 0 0 0.4rem; word-break: break-all; }
        .user-info-main .user-email { font-size: 1.05rem; margin: 0; color: #64748b; opacity: 0.9; }

        .avatar-wrapper {
          position: relative;
          width: 112px;
          height: 112px;
          border-radius: 50%;
          overflow: hidden;
          border: 5px solid white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .profile-image, .avatar-fallback { width: 100%; height: 100%; object-fit: cover; }
        .avatar-fallback {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.6rem;
          font-weight: 800;
          color: white;
        }
        .online-indicator {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          background: #10b981;
          border: 4px solid white;
          border-radius: 50%;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1.5rem 0;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 1.2rem;
        }
        .info-item { display: flex; align-items: center; gap: 0.8rem; color: #475569; }
        .info-label { color: #94a3b8; font-size: 0.9rem; font-weight: 500; }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          margin-top: 2rem;
        }
        .btn {
          flex: 1;
          min-width: 120px;
          padding: 0.9rem;
          border-radius: 1.4rem;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          cursor: pointer;
          border: none;
          transition: transform 0.2s ease;
        }
        .btn:hover { transform: translateY(-4px); }
        .btn-details { background: #f1f5f9; color: #475569; }
        .btn-promote { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; }
        .btn-demote { background: #64748b; color: white; }
        .btn-delete { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }

        .details-panel {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-top: 2px dashed #e2e8f0;
          padding: 2rem;
          margin: 2.5rem 2rem 2rem;
          border-radius: 1.5rem;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.2rem;
        }
        .detail-item {
          padding: 1rem;
          background: white;
          border-radius: 1.2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .detail-label { color: #64748b; font-size: 0.9rem; font-weight: 600; }
        .detail-value { color: #1e293b; font-weight: 700; font-size: 1.1rem; margin-top: 0.4rem; }

        .no-users {
          text-align: center;
          padding: 5rem;
          color: #94a3b8;
          font-size: 1.4rem;
          grid-column: 1/-1;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin: 4rem 0;
          font-weight: 600;
        }
        .pagination button {
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .pagination button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .users-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
          .info-grid, .detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="header">
        <h1><Users size={44} /> User Management</h1>
        <p>Manage roles, view profiles, and monitor platform activity</p>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value stat-verified">
            {statistics.totalVerified.toLocaleString()}
          </div>
          <div className="stat-label">Verified Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-unverified">
            {statistics.totalUnverified.toLocaleString()}
          </div>
          <div className="stat-label">Unverified Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-total">
            {statistics.totalUsersByRole.toLocaleString()}
          </div>
          <div className="stat-label">Total Users</div>
        </div>
      </div>

      <div className="controls">
        <div className="search-wrapper">
          <Search size={24} />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="filter-select" value={filters.role} onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 0 }))}>
          <option value="all">All Roles</option>
          <option value="admin">Admins Only</option>
          <option value="user">Users Only</option>
        </select>

        <select className="filter-select" value={filters.verified} onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value, page: 0 }))}>
          <option value="all">All Status</option>
          <option value="true">Verified Only</option>
          <option value="false">Unverified Only</option>
        </select>

        <button onClick={fetchUsers} className="refresh-btn">
          <RefreshCw size={20} /> Refresh
        </button>
      </div>

      <div className="users-grid">
        {users.length === 0 ? (
          <div className="no-users">No users found matching your filters.</div>
        ) : (
          users.map(user => (
            <div key={user.id} className="user-card">
              <div className="card-header">
                <div>
                  <h3 className="user-name">{user.username || 'No Username'}</h3>
                  <p className="user-email">{user.email}</p>
                </div>
                <div className="badge-group">
                  <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                    {user.role === 'admin' ? <Crown size={16} /> : <Users size={16} />}
                    {user.role.toUpperCase()}
                  </span>
                  <span className={`badge ${user.verified ? 'badge-verified' : 'badge-unverified'}`}>
                    {user.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="card-body-layout">
                  <div className="avatar-section">
                    <div className="avatar-wrapper">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.username}
                          className="profile-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.email)}&background=6366f1&color=fff&bold=true&size=256`;
                          }}
                        />
                      ) : (
                        <div className="avatar-fallback">
                          {(user.username?.[0] || user.email[0]).toUpperCase()}
                        </div>
                      )}
                      <div className="online-indicator" />
                    </div>
                  </div>
                  <div className="user-info-main">
                    <h3 className="user-name">{user.username || 'No Username'}</h3>
                    <p className="user-email">
                      <Mail size={16} style={{ marginRight: '0.4rem', opacity: 0.7 }} />
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="info-grid" style={{ marginTop: '1.5rem' }}>
                  <div className="info-item">
                    <Calendar size={18} />
                    <div>
                      <div className="info-label">Joined</div>
                      <div>{formatDate(user.createdAt)}</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <IdCard size={18} />
                    <div>
                      <div className="info-label">User ID</div>
                      <div style={{ fontFamily: 'monospace' }}>{user.id.slice(0, 12)}...</div>
                    </div>
                  </div>
                </div>

                <div className="actions">
                  <button onClick={() => toggleDetails(user.id)} className="btn btn-details">
                    {expandedUserId === user.id ? <EyeOff size={18} /> : <Eye size={18} />}
                    {expandedUserId === user.id ? 'Hide' : 'View'} Details
                  </button>

                  {user.role === 'user' && (
                    <button onClick={() => handlePromote(user.id)} className="btn btn-promote">
                      <Crown size={18} /> Promote
                    </button>
                  )}

                  {user.role === 'admin' && (
                    <button onClick={() => handleDemote(user.id)} className="btn btn-demote">
                      Demote
                    </button>
                  )}

                  <button onClick={() => handleDelete(user.id)} className="btn btn-delete">
                    <Trash2 size={18} /> Delete
                  </button>
                </div>

                {expandedUserId === user.id && userDetailsMap[user.id] && (
                  <div className="details-panel">
                    <div className="detail-grid">
                      {userDetailsMap[user.id].user?.phone && (
                        <div className="detail-item">
                          <Phone size={18} style={{ color: '#64748b' }} />
                          <div className="detail-label">Phone</div>
                          <div className="detail-value">{userDetailsMap[user.id].user.phone}</div>
                        </div>
                      )}
                      {userDetailsMap[user.id].user?.location && (
                        <div className="detail-item">
                          <MapPin size={18} style={{ color: '#64748b' }} />
                          <div className="detail-label">Location</div>
                          <div className="detail-value">{userDetailsMap[user.id].user.location}</div>
                        </div>
                      )}
                      {userDetailsMap[user.id].statistics && (
                        <>
                          <div className="detail-item">
                            <Trophy size={18} style={{ color: '#f59e0b' }} />
                            <div className="detail-label">Total Campaigns</div>
                            <div className="detail-value">{userDetailsMap[user.id].statistics.totalCampaigns || 0}</div>
                          </div>
                          <div className="detail-item">
                            <div className="detail-label">Active Campaigns</div>
                            <div className="detail-value" style={{ color: '#10b981' }}>
                              {userDetailsMap[user.id].statistics.activeCampaigns || 0}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} disabled={filters.page === 0}>
            Previous
          </button>
          <span>
            Page {filters.page + 1} of {pagination.totalPages} • {pagination.totalElements.toLocaleString()} users
          </span>
          <button onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} disabled={filters.page >= pagination.totalPages - 1}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;