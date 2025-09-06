import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import OptimizedImage from '../common/OptimizedImage';
import './AdminCampaignManagement.css';

const AdminCampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getAllCampaignsForAdmin(filters);
      setCampaigns(response.campaigns || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campaignId) => {
    try {
      await adminService.approveCampaign(campaignId);
      fetchCampaigns(); // Refresh list
      alert('Campaign approved successfully!');
    } catch (error) {
      console.error('Error approving campaign:', error);
      alert('Failed to approve campaign: ' + (error.error || error.message));
    }
  };

  const handleReject = async (campaignId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await adminService.rejectCampaign(campaignId, reason || '');
      fetchCampaigns(); // Refresh list
      alert('Campaign rejected successfully!');
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      alert('Failed to reject campaign: ' + (error.error || error.message));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedCampaigns.length === 0) {
      alert('Please select campaigns to approve');
      return;
    }

    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Are you sure you want to approve ${selectedCampaigns.length} campaigns?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      await adminService.bulkApproveCampaigns(selectedCampaigns);
      setSelectedCampaigns([]);
      fetchCampaigns();
      alert('Campaigns approved successfully!');
    } catch (error) {
      console.error('Error bulk approving campaigns:', error);
      alert('Failed to approve campaigns: ' + (error.error || error.message));
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedCampaigns.length === 0) {
      alert('Please select campaigns to reject');
      return;
    }

    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return; // User cancelled

    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Are you sure you want to reject ${selectedCampaigns.length} campaigns?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      await adminService.bulkRejectCampaigns(selectedCampaigns, reason);
      setSelectedCampaigns([]);
      fetchCampaigns();
      alert('Campaigns rejected successfully!');
    } catch (error) {
      console.error('Error bulk rejecting campaigns:', error);
      alert('Failed to reject campaigns: ' + (error.error || error.message));
    } finally {
      setBulkActionLoading(false);
    }
  };

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

  const getStatusBadge = (campaign) => {
    if (campaign.status === 'pending') return 'pending';
    if (campaign.status === 'approved' && campaign.isActive) return 'active';
    if (campaign.status === 'approved' && !campaign.isActive) return 'approved';
    if (campaign.status === 'rejected') return 'rejected';
    return 'unknown';
  };

  if (loading && campaigns.length === 0) {
    return <LoadingSpinner message="Loading campaigns..." />;
  }

  if (error && campaigns.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchCampaigns} />;
  }

  return (
    <div className="admin-campaign-management">
      <div className="campaign-management-header">
        <h2>📋 Campaign Management</h2>
        <p>Review, approve, and manage all campaigns on the platform</p>
      </div>

      {/* Filters and Controls */}
      <div className="campaign-controls">
        <div className="campaign-filters">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 0})}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select 
            value={filters.category} 
            onChange={(e) => setFilters({...filters, category: e.target.value, page: 0})}
          >
            <option value="all">All Categories</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
            <option value="Environment">Environment</option>
            <option value="Community">Community</option>
            <option value="Arts & Culture">Arts & Culture</option>
            <option value="Sports">Sports</option>
            <option value="Emergency">Emergency</option>
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
        </div>

        <div className="bulk-actions">
          {selectedCampaigns.length > 0 && (
            <>
              <span className="selected-count">
                {selectedCampaigns.length} selected
              </span>
              <button 
                onClick={handleBulkApprove}
                disabled={bulkActionLoading}
                className="bulk-btn approve"
              >
                ✅ Bulk Approve
              </button>
              <button 
                onClick={handleBulkReject}
                disabled={bulkActionLoading}
                className="bulk-btn reject"
              >
                ❌ Bulk Reject
              </button>
            </>
          )}
        </div>
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
              onApprove={() => handleApprove(campaign.id)}
              onReject={() => handleReject(campaign.id)}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
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

// Campaign Card Component
const CampaignCard = ({ 
  campaign, 
  isSelected, 
  onSelect, 
  onApprove, 
  onReject, 
  formatCurrency, 
  formatDate, 
  getStatusBadge 
}) => {
  const statusBadge = getStatusBadge(campaign);
  
  return (
    <div className={`admin-campaign-card ${isSelected ? 'selected' : ''}`}>
      <div className="campaign-card-header">
        <label className="campaign-select">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
          />
        </label>
        <div className={`status-badge ${statusBadge}`}>
          {campaign.status}
        </div>
      </div>

      <div className="campaign-card-content">
        <div className="campaign-image-section">
          {campaign.imageUrl ? (
            <OptimizedImage
              src={campaign.imageUrl}
              alt={campaign.name}
              width={100}
              height={80}
              crop="fill"
              className="campaign-thumbnail"
            />
          ) : (
            <div className="no-image-placeholder">
              <span>📋</span>
            </div>
          )}
        </div>

        <div className="campaign-details">
          <h3 className="campaign-name">{campaign.name}</h3>
          <p className="campaign-creator">
            <strong>Creator:</strong> {campaign.creatorUsername || 'Unknown'}
          </p>
          <p className="campaign-category">
            <strong>Category:</strong> {campaign.category}
          </p>
          
          <div className="campaign-metrics">
            <div className="metric">
              <span className="metric-label">Goal:</span>
              <span className="metric-value">{formatCurrency(campaign.goalAmount)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Raised:</span>
              <span className="metric-value">{formatCurrency(campaign.raisedAmount)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Progress:</span>
              <span className="metric-value">{campaign.completionPercentage?.toFixed(1)}%</span>
            </div>
          </div>

          <div className="campaign-dates">
            <div className="date-item">
              <span className="date-label">Created:</span>
              <span className="date-value">{formatDate(campaign.createdAt)}</span>
            </div>
            <div className="date-item">
              <span className="date-label">End Date:</span>
              <span className="date-value">{formatDate(campaign.endDate)}</span>
            </div>
            <div className="date-item">
              <span className="date-label">Days Left:</span>
              <span className="date-value">
                {campaign.daysRemaining > 0 ? `${campaign.daysRemaining} days` : 'Ended'}
              </span>
            </div>
          </div>

          {campaign.description && (
            <div className="campaign-description">
              <strong>Description:</strong>
              <p>{campaign.description.substring(0, 150)}...</p>
            </div>
          )}
        </div>
      </div>

      <div className="campaign-card-actions">
        <button className="view-btn">
          👁️ View Details
        </button>
        
        {campaign.status === 'pending' && (
          <>
            <button 
              onClick={onApprove}
              className="action-btn approve"
            >
              ✅ Approve
            </button>
            <button 
              onClick={onReject}
              className="action-btn reject"
            >
              ❌ Reject
            </button>
          </>
        )}
        
        {campaign.status === 'approved' && (
          <span className="approved-indicator">
            ✅ Approved
          </span>
        )}
        
        {campaign.status === 'rejected' && (
          <span className="rejected-indicator">
            ❌ Rejected
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminCampaignManagement;