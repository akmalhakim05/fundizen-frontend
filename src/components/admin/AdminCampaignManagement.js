import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import '../../styles/components/AdminCampaignManagement.css';
import { DollarSign, Eye, Users, MessageCircle, CheckCircle, XCircle, FileText } from 'lucide-react';

const AdminCampaignManagement = () => {
  // State management
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
    status: 'all',
    category: 'all'
  });
  const [pagination, setPagination] = useState(null);

  // Fetch campaigns
  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Filter out 'all' values
      const apiFilters = { ...filters };
      if (apiFilters.status === 'all') delete apiFilters.status;
      if (apiFilters.category === 'all') delete apiFilters.category;
      
      const response = await adminService.getAllCampaignsForAdmin(apiFilters);
      setCampaigns(response.campaigns || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Bulk approve campaigns
  const handleBulkApprove = async () => {
    if (selectedCampaigns.length === 0) {
      alert('Please select campaigns to approve');
      return;
    }

    if (!window.confirm(`Are you sure you want to approve ${selectedCampaigns.length} campaigns?`)) {
      return;
    }

    try {
      const result = await adminService.bulkApproveCampaigns(selectedCampaigns);
      setSelectedCampaigns([]);
      fetchCampaigns();
      alert(`Successfully approved ${result.successCount} campaigns. ${result.failureCount} failed.`);
    } catch (error) {
      console.error('Error bulk approving campaigns:', error);
      alert('Failed to approve campaigns: ' + (error.error || error.message));
    }
  };

  // Bulk reject campaigns
  const handleBulkReject = async () => {
    if (selectedCampaigns.length === 0) {
      alert('Please select campaigns to reject');
      return;
    }

    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    if (!window.confirm(`Are you sure you want to reject ${selectedCampaigns.length} campaigns?`)) {
      return;
    }

    try {
      const result = await adminService.bulkRejectCampaigns(selectedCampaigns, reason);
      setSelectedCampaigns([]);
      fetchCampaigns();
      alert(`Successfully rejected ${result.successCount} campaigns. ${result.failureCount} failed.`);
    } catch (error) {
      console.error('Error bulk rejecting campaigns:', error);
      alert('Failed to reject campaigns: ' + (error.error || error.message));
    }
  };

  // Individual campaign actions
  const handleApproveCampaign = async (campaignId) => {
    try {
      await adminService.approveCampaign(campaignId);
      fetchCampaigns();
      alert('Campaign approved successfully!');
    } catch (error) {
      console.error('Error approving campaign:', error);
      alert('Failed to approve campaign: ' + (error.error || error.message));
    }
  };

  const handleRejectCampaign = async (campaignId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return;

    try {
      await adminService.rejectCampaign(campaignId, reason);
      fetchCampaigns();
      alert('Campaign rejected successfully!');
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      alert('Failed to reject campaign: ' + (error.error || error.message));
    }
  };

  // Selection handlers
  const handleSelectCampaign = (campaignId, isSelected) => {
    if (isSelected) {
      setSelectedCampaigns([...selectedCampaigns, campaignId]);
    } else {
      setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaignId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedCampaigns(campaigns.map(c => c.id));
    } else {
      setSelectedCampaigns([]);
    }
  };

  // Export campaigns
  const handleExport = async () => {
    try {
      await adminService.exportData('campaigns', 'csv');
      alert('Campaign data exported successfully!');
    } catch (error) {
      console.error('Error exporting campaigns:', error);
      alert('Failed to export campaign data: ' + (error.error || error.message));
    }
  };

  // Utility functions
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

  if (loading && campaigns.length === 0) {
    return <LoadingSpinner message="Loading campaigns..." />;
  }

  if (error && campaigns.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchCampaigns} />;
  }

  return (
    <div className="admin-campaign-management">
      {/* Header */}
      <div className="campaign-management-header">
        <h2>📋 Campaign Management</h2>
        <p>Review, approve, and manage all campaigns on the platform</p>
      </div>

      {/* Controls */}
      <div className="campaign-controls">
        {/* Filters */}
        <div className="campaign-filters">
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 0})}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>

          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value, page: 0})}
          >
            <option value="all">All Categories</option>
            <option value="medical">Medical</option>
            <option value="education">Education</option>
            <option value="community">Community</option>
            <option value="emergency">Emergency</option>
            <option value="environment">Environment</option>
            <option value="animals">Animals</option>
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
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="goalAmount-desc">Highest Goal</option>
            <option value="goalAmount-asc">Lowest Goal</option>
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

          <button onClick={handleExport} className="export-btn">
            📊 Export
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedCampaigns.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">
              {selectedCampaigns.length} selected
            </span>
            <button onClick={handleBulkApprove} className="bulk-btn approve">
              ✅ Bulk Approve
            </button>
            <button onClick={handleBulkReject} className="bulk-btn reject">
              ❌ Bulk Reject
            </button>
            <button onClick={() => setSelectedCampaigns([])} className="bulk-btn clear">
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Campaign List */}
      <div className="campaign-list">
        <div className="campaign-list-header">
          <label className="select-all">
            <input
              type="checkbox"
              checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span>Select All</span>
          </label>
          <span className="campaign-count">
            {campaigns.length} campaigns found
            {pagination && ` (Page ${pagination.currentPage + 1} of ${pagination.totalPages})`}
          </span>
        </div>

        {loading && <LoadingSpinner message="Loading campaigns..." />}
        
        {error && <ErrorMessage message={error} onRetry={fetchCampaigns} />}

        {campaigns.length === 0 && !loading && !error && (
          <div className="no-campaigns">
            <h3>No campaigns found</h3>
            <p>No campaigns match the current filters.</p>
          </div>
        )}

        <div className="campaigns-grid">
          {campaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              isSelected={selectedCampaigns.includes(campaign.id)}
              onSelect={(isSelected) => handleSelectCampaign(campaign.id, isSelected)}
              onApprove={() => handleApproveCampaign(campaign.id)}
              onReject={() => handleRejectCampaign(campaign.id)}
              formatCurrency={formatCurrency}
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
              <span>({pagination.totalElements} total campaigns)</span>
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

// Campaign Card Component
const CampaignCard = ({ campaign, isSelected, onSelect, onApprove, onReject, formatCurrency, formatDate }) => {
  const progress = campaign.completionPercentage || 0;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`admin-campaign-card ${isSelected ? 'selected' : ''}`}>
      <div className="campaign-card-header">
        <span className="campaign-id">#{campaign.id}</span>
        <span className={`status-badge ${campaign.status}`}>
          {campaign.status}
        </span>
      </div>

      <div className="campaign-thumbnail-wrapper">
        {campaign.imageUrl ? (
          <img src={campaign.imageUrl} alt={campaign.name} className="campaign-thumbnail" />
        ) : (
          <div style={{height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <FileText size={64} color="#94a3b8" />
          </div>
        )}
      </div>

      <div className="campaign-content">
        <h3 className="campaign-name">{campaign.name}</h3>
        <div className="campaign-meta">
          <span><strong>By:</strong> {campaign.creatorUsername || 'Unknown'}</span>
          <span><strong>Category:</strong> {campaign.category}</span>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '20px', margin: '16px 0'}}>
          <div>
            <div style={{fontSize: '1.1rem', fontWeight: 600}}>{formatCurrency(campaign.raisedAmount)}</div>
            <div style={{color: '#64748b', fontSize: '0.9rem'}}>of {formatCurrency(campaign.goalAmount)}</div>
          </div>
          <div className="progress-ring">
            <svg width="80" height="80">
              <circle className="bg" cx="40" cy="40" r="36" />
              <circle 
                className="progress" 
                cx="40" cy="40" r="36"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="progress-text">{progress.toFixed(0)}%</div>
          </div>
        </div>
        <div className="campaign-card-actions">
          <button className="action-btn view">
            <Eye size={18} /> View Details
          </button>
          {campaign.status === 'pending' && (
            <>
              <button onClick={onApprove} className="action-btn approve">
                <CheckCircle size={18} /> Approve
              </button>
              <button onClick={onReject} className="action-btn reject">
                <XCircle size={18} /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCampaignManagement;