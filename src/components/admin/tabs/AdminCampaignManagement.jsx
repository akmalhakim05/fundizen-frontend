// src/components/admin/tabs/AdminCampaignManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/adminService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import { 
  DollarSign, Eye, CheckCircle, XCircle, FileText, 
  Download, Filter, ChevronLeft, ChevronRight, Search 
} from 'lucide-react';

const AdminCampaignManagement = () => {
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

  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
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

  const handleBulkApprove = async () => {
    if (selectedCampaigns.length === 0) return alert('Please select campaigns to approve');
    if (!window.confirm(`Approve ${selectedCampaigns.length} campaigns?`)) return;
    try {
      const result = await adminService.bulkApproveCampaigns(selectedCampaigns);
      setSelectedCampaigns([]);
      fetchCampaigns();
      alert(`Approved ${result.successCount}, ${result.failureCount} failed`);
    } catch (err) {
      alert('Failed to approve: ' + (err.error || err.message));
    }
  };

  const handleBulkReject = async () => {
    if (selectedCampaigns.length === 0) return alert('Please select campaigns to reject');
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    if (!window.confirm(`Reject ${selectedCampaigns.length} campaigns?`)) return;
    try {
      const result = await adminService.bulkRejectCampaigns(selectedCampaigns, reason);
      setSelectedCampaigns([]);
      fetchCampaigns();
      alert(`Rejected ${result.successCount}, ${result.failureCount} failed`);
    } catch (err) {
      alert('Failed to reject: ' + (err.error || err.message));
    }
  };

  const handleApproveCampaign = async (id) => {
    try {
      await adminService.approveCampaign(id);
      fetchCampaigns();
      alert('Campaign approved!');
    } catch (err) {
      alert('Failed: ' + (err.error || err.message));
    }
  };

  const handleRejectCampaign = async (id) => {
    const reason = prompt('Reason (optional):');
    if (reason === null) return;
    try {
      await adminService.rejectCampaign(id, reason || '');
      fetchCampaigns();
      alert('Campaign rejected!');
    } catch (err) {
      alert('Failed: ' + (err.error || err.message));
    }
  };

  const handleSelectCampaign = (id, checked) => {
    setSelectedCampaigns(prev => 
      checked ? [...prev, id] : prev.filter(x => x !== id)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedCampaigns(checked ? campaigns.map(c => c.id) : []);
  };

  const handleExport = async () => {
    try {
      await adminService.exportData('campaigns', 'csv');
      alert('Exported successfully!');
    } catch (err) {
      alert('Export failed: ' + (err.error || err.message));
    }
  };

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount || 0);

  const formatDate = (date) => 
    new Date(date).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading && campaigns.length === 0) return <LoadingSpinner message="Loading campaigns..." />;
  if (error && campaigns.length === 0) return <ErrorMessage message={error} onRetry={fetchCampaigns} />;

  return (
    <div className="admin-campaign-management">
      {/* Header */}
      <div className="campaign-header">
        <h2><FileText size={36} /> Campaign Management</h2>
        <p>Review, approve, and manage all fundraising campaigns</p>
      </div>

      {/* Controls */}
      <div className="campaign-controls">
        <div className="filters-left">
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value, page: 0})}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>

          <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value, page: 0})}>
            <option value="all">All Categories</option>
            <option value="medical">Medical</option>
            <option value="education">Education</option>
            <option value="community">Community</option>
            <option value="emergency">Emergency</option>
            <option value="environment">Environment</option>
            <option value="animals">Animals</option>
          </select>

          <select value={filters.size} onChange={e => setFilters({...filters, size: +e.target.value, page: 0})}>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          <button onClick={handleExport} className="export-btn">
            <Download size={18} /> Export CSV
          </button>
        </div>

        {selectedCampaigns.length > 0 && (
          <div className="bulk-actions-bar">
            <span className="selected-text">{selectedCampaigns.length} selected</span>
            <button onClick={handleBulkApprove} className="bulk-btn approve">
              <CheckCircle size={18} /> Bulk Approve
            </button>
            <button onClick={handleBulkReject} className="bulk-btn reject">
              <XCircle size={18} /> Bulk Reject
            </button>
            <button onClick={() => setSelectedCampaigns([])} className="bulk-btn clear">
              Clear
            </button>
          </div>
        )}
      </div>

      {/* List Header */}
      <div className="list-header">
        <label className="select-all-label">
          <input
            type="checkbox"
            checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
            onChange={e => handleSelectAll(e.target.checked)}
          />
          <span>Select All</span>
        </label>
        <span className="results-count">
          {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} • 
          {pagination && ` Page ${filters.page + 1} of ${pagination.totalPages}`}
        </span>
      </div>

      {/* Campaigns Grid */}
      <div className="campaigns-grid">
        {campaigns.map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            isSelected={selectedCampaigns.includes(campaign.id)}
            onSelect={handleSelectCampaign}
            onApprove={handleApproveCampaign}
            onReject={handleRejectCampaign}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setFilters(prev => ({...prev, page: Math.max(0, prev.page - 1)}))}
            disabled={filters.page === 0}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          <span>Page {filters.page + 1} of {pagination.totalPages}</span>
          <button
            onClick={() => setFilters(prev => ({...prev, page: Math.min(pagination.totalPages - 1, prev.page + 1)}))}
            disabled={filters.page >= pagination.totalPages - 1}
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      )}

      <style jsx>{`
        .admin-campaign-management {
          padding: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .campaign-header h2 {
          font-size: 2.6rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 0 0 8px 0;
        }

        .campaign-header p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .campaign-controls {
          background: white;
          padding: 28px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 32px;
        }

        .filters-left {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }

        .filters-left select, .export-btn {
          padding: 12px 18px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: white;
          font-weight: 500;
        }

        .export-btn {
          background: #1e6cff;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .bulk-actions-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #f8fafc;
          padding: 12px 20px;
          border-radius: 16px;
        }

        .selected-text {
          font-weight: 600;
          color: #475569;
        }

        .bulk-btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          cursor: pointer;
        }

        .bulk-btn.approve { background: #10b981; color: white; }
        .bulk-btn.reject { background: #ef4444; color: white; }
        .bulk-btn.clear { background: #64748b; color: white; }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 0 8px;
        }

        .select-all-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .results-count {
          color: #64748b;
          font-weight: 500;
        }

        .campaigns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
          gap: 28px;
          margin-bottom: 40px;
        }

        .admin-campaign-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          transition: all 0.4s ease;
        }

        .admin-campaign-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }

        .admin-campaign-card.selected {
          border: 2px solid #1e6cff;
          box-shadow: 0 0 0 4px rgba(30,108,255,0.15);
        }

        .campaign-card-header {
          padding: 24px 28px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .campaign-id {
          font-family: 'JetBrains Mono', monospace;
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 0.85rem;
          color: #64748b;
        }

        .status-badge {
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .status-badge.pending { background: #fff7ed; color: #c2410c; }
        .status-badge.approved { background: #ecfdf5; color: #047857; }
        .status-badge.active { background: #dbeafe; color: #1d4ed8; }
        .status-badge.rejected { background: #fee2e2; color: #991b1b; }

        .campaign-thumbnail-wrapper {
          height: 240px;
          overflow: hidden;
          background: #f8fafc;
        }

        .campaign-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .admin-campaign-card:hover .campaign-thumbnail {
          transform: scale(1.1);
        }

        .campaign-content {
          padding: 28px;
        }

        .campaign-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 12px 0;
          line-height: 1.3;
        }

        .campaign-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          color: #64748b;
          font-size: 0.95rem;
        }

        .campaign-meta strong {
          color: #1e293b;
        }

        .progress-ring {
          position: relative;
          width: 90px;
          height: 90px;
          margin-left: auto;
        }

        .progress-ring circle {
          cx: 45; cy: 45; r: 40;
          fill: none;
          stroke-width: 10;
        }

        .progress-ring .bg { stroke: #e2e8f0; }
        .progress-ring .progress { 
          stroke: #10b981; 
          stroke-linecap: round; 
          transform: rotate(-90deg); 
          transform-origin: 45px 45px;
          transition: stroke-dashoffset 0.6s ease;
        }

        .progress-text {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
        }

        .campaign-card-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .action-btn {
          flex: 1;
          padding: 14px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }

        .action-btn.view { background: #f8fafc; color: #475569; }
        .action-btn.approve { background: #10b981; color: white; }
        .action-btn.reject { background: #ef4444; color: white; }

        .action-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          margin-top: 40px;
          font-weight: 600;
        }

        .pagination button {
          padding: 12px 24px;
          border-radius: 16px;
          background: #1e6cff;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .pagination button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .campaign-controls { flex-direction: column; align-items: stretch; }
          .filters-left { justify-content: center; }
          .campaigns-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

const CampaignCard = ({ campaign, isSelected, onSelect, onApprove, onReject, formatCurrency, formatDate }) => {
  const progress = campaign.completionPercentage || 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`admin-campaign-card ${isSelected ? 'selected' : ''}`}>
      <div className="campaign-card-header">
        <span className="campaign-id">#{campaign.id}</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={e => onSelect(campaign.id, e.target.checked)}
          />
          <span className={`status-badge ${campaign.status}`}>{campaign.status}</span>
        </label>
      </div>

      <div className="campaign-thumbnail-wrapper">
        {campaign.imageUrl ? (
          <img src={campaign.imageUrl} alt={campaign.name} className="campaign-thumbnail" />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
            <FileText size={80} color="#94a3b8" />
          </div>
        )}
      </div>

      <div className="campaign-content">
        <h3 className="campaign-name">{campaign.name}</h3>
        <div className="campaign-meta">
          <span><strong>By:</strong> {campaign.creatorUsername || 'Unknown'}</span>
          <span><strong>Category:</strong> {campaign.category}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
              {formatCurrency(campaign.raisedAmount)}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.95rem' }}>
              of {formatCurrency(campaign.goalAmount)}
            </div>
          </div>

          <div className="progress-ring">
            <svg width="90" height="90">
              <circle className="bg" cx="45" cy="45" r="40" />
              <circle 
                className="progress" 
                cx="45" cy="45" r="40"
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
              <button onClick={() => onApprove(campaign.id)} className="action-btn approve">
                <CheckCircle size={18} /> Approve
              </button>
              <button onClick={() => onReject(campaign.id)} className="action-btn reject">
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