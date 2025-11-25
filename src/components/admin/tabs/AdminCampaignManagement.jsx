// src/components/admin/tabs/AdminCampaignManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import campaignService from '../../../services/campaignService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import { 
  DollarSign, Eye, CheckCircle, XCircle, FileText, 
  ChevronLeft, ChevronRight, Filter, TrendingUp, BarChart3,
  LayoutDashboard, Calendar, Users
} from 'lucide-react';

const CATEGORIES = [
  'Healthcare', 'Education', 'Technology', 'Environment', 'Community',
  'Arts & Culture', 'Sports', 'Emergency', 'Animals', 'Memorial', 'Nonprofit', 'Others'
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'public', label: 'Public' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_STYLES = {
  pending:   { bg: '#FFFBEB', border: '#F59E0B', color: '#92400E' },
  approved:  { bg: '#ECFDF5', border: '#10B981', color: '#065F46' },
  public:    { bg: '#DBEAFE', border: '#2563EB', color: '#1E40AF' },
  rejected:  { bg: '#FEE2E2', border: '#EF4444', color: '#991B1B' },
  completed: { bg: '#F3E8FF', border: '#7C3AED', color: '#6B21A8' },
};

const AdminCampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

      const response = await campaignService.getAllCampaigns(apiFilters);
      setCampaigns(response.campaigns || []);
      setPagination(response.pagination || null);
      setStatistics(response.statistics || null);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleApproveCampaign = async (id) => {
    if (!window.confirm('Approve this campaign?')) return;
    try {
      await campaignService.approveCampaign(id);
      fetchCampaigns();
      alert('Campaign approved successfully!');
    } catch (err) {
      alert('Failed to approve: ' + (err.message || 'Unknown error'));
    }
  };

  const handleRejectCampaign = async (id) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return;
    if (!window.confirm('Reject this campaign?')) return;
    try {
      await campaignService.rejectCampaign(id, reason || 'No reason provided');
      fetchCampaigns();
      alert('Campaign rejected.');
    } catch (err) {
      alert('Failed to reject: ' + (err.message || 'Unknown error'));
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
      {/* Modern Top Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <LayoutDashboard size={40} className="title-icon" />
            <div>
              <h1>Campaign Management</h1>
              <p>Review, approve, and monitor all fundraising campaigns</p>
            </div>
          </div>
          <div className="header-meta">
            <div className="meta-item">
              <Calendar size={20} />
              <span>{new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="stats-grid">
          <div className="stat-card main">
            <TrendingUp size={32} />
            <div>
              <div className="stat-number">{statistics.totalCampaigns}</div>
              <div className="stat-title">Total Campaigns</div>
            </div>
          </div>

          <div className="stat-card wide">
            <BarChart3 size={32} />
            <div className="stat-title">Campaigns by Status</div>
            <div className="status-list">
              {Object.entries(statistics.campaignsByStatus).map(([status, count]) => (
                <div key={status} className="status-row">
                  <span className="status-dot" style={{ backgroundColor: STATUS_STYLES[status]?.border || '#6B7280' }}></span>
                  <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card wide">
            <div className="stat-title">Top Categories</div>
            <div className="category-chart">
              {Object.entries(statistics.campaignsByCategory)
                .sort(([,a],[,b]) => b - a)
                .slice(0, 6)
                .map(([cat, count]) => {
                  const max = Math.max(...Object.values(statistics.campaignsByCategory));
                  const percentage = (count / max) * 100;
                  return (
                    <div key={cat} className="category-bar-item">
                      <div className="bar-label">{cat}</div>
                      <div className="bar-wrapper">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="bar-value">{count}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="filters-left">
          <div className="filter-group">
            <label>Status</label>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value, page: 0})}>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value, page: 0})}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Items per page</label>
            <select value={filters.size} onChange={e => setFilters({...filters, size: +e.target.value, page: 0})}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          Showing {pagination ? `${filters.page * filters.size + 1}-${Math.min((filters.page + 1) * filters.size, pagination.totalElements)}` : campaigns.length} of {pagination?.totalElements || campaigns.length} campaigns
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="campaigns-grid">
        {campaigns.map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onApprove={handleApproveCampaign}
            onReject={handleRejectCampaign}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => setFilters(prev => ({...prev, page: Math.max(0, prev.page - 1)}))}
            disabled={filters.page === 0}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          <span className="page-info">
            Page <strong>{filters.page + 1}</strong> of <strong>{pagination.totalPages}</strong>
          </span>
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
          padding: 32px 40px;
          background: #F8FAFC;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Header */
        .page-header {
          background: white;
          border-radius: 20px;
          padding: 32px 40px;
          margin-bottom: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1px solid #E5E7EB;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .title-icon {
          color: #2563EB;
        }

        .header-title h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111827;
          margin: 0;
        }

        .header-title p {
          color: #6B7280;
          font-size: 1.1rem;
          margin: 8px 0 0;
        }

        .header-meta {
          display: flex;
          gap: 32px;
          align-items: center;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #4B5563;
          font-size: 0.95rem;
        }

        .meta-item svg {
          color: #6B7280;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1.5fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          border: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .stat-card.main {
          background: linear-gradient(135deg, #2563EB, #3B82F6);
          color: white;
        }

        .stat-card.main svg {
          color: rgba(255,255,255,0.9);
        }

        .stat-number {
          font-size: 3.5rem-font;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .stat-title {
          font-size: 1.05rem;
          font-weight: 600;
          opacity: 0.9;
        }

        .status-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
          width: 100%;
        }

        .status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.95rem;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-name {
          color: #374151;
          font-weight: 500;
        }

        .status-count {
          font-weight: 700;
          color: #111827;
        }

        .category-chart {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .category-bar-item {
          display: grid;
          grid-template-columns: 120px 1fr 50px;
          align-items: center;
          gap: 12px;
          font-size: 0.95rem;
        }

        .bar-label {
          font-weight: 600;
          color: #4B5563;
        }

        .bar-wrapper {
          height: 8px;
          background: #E5E7EB;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563EB, #10B981);
          border-radius: 4px;
          transition: width 0.7s ease;
        }

        .bar-value {
          font-weight: 700;
          text-align: right;
          color: #111827;
        }

        /* Filters */
        .filters-bar {
          background: white;
          border-radius: 18px;
          padding: 24px 32px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          border: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .filters-left {
          display: flex;
          gap: 24px;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .filter-group select {
          padding: 12px 16px;
          border: 1.5px solid #D1D5DB;
          border-radius: 12px;
          background: white;
          font-size: 0.95rem;
          min-width: 180px;
          transition: all 0.2s;
        }

        .filter-group select:focus {
          outline: none;
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .results-info {
          color: #6B7280;
          font-weight: 500;
        }

        /* Grid & Cards */
        .campaigns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
          gap: 28px;
          margin-bottom: 48px;
        }

        /* Pagination */
        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 32px;
          font-size: 1rem;
          font-weight: 600;
        }

        .pagination-controls button {
          padding: 12px 28px;
          background: #2563EB;
          color: white;
          border: none;
          border-radius:  16px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .pagination-controls button:hover:not(:disabled) {
          background: #1D4ED8;
          transform: translateY(-2px);
        }

        .pagination-controls button:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
        }

        .page-info {
          color: #374151;
        }

        @850px {
          .stats-grid { grid-template-columns: 1fr; }
          .header-content { flex-direction: column; align-items: flex-start; gap: 20px; }
          .header-meta { justify-content: flex-start; }
        }
      `}</style>
    </div>
  );
};

/* Reusable Campaign Card – Clean & Modern */
const CampaignCard = ({ campaign, onApprove, onReject, formatCurrency, formatDate }) => {
  const progress = campaign.completionPercentage || 0;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="campaign-card">
      <div className="card-header">
        <div className="campaign-id">#{campaign.id.slice(-8)}</div>
        <div className="status-badge" style={{
          backgroundColor: STATUS_STYLES[campaign.status]?.bg || '#F3F4F6',
          color: STATUS_STYLES[campaign.status]?.color || '#374151',
          border: `2px solid ${STATUS_STYLES[campaign.status]?.border || '#D1D5DB'}`
        }}>
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </div>
      </div>

      {campaign.imageUrl ? (
        <img src={campaign.imageUrl} alt={campaign.name} className="thumbnail" />
      ) : (
        <div className="thumbnail placeholder">
          <FileText size={64} color="#9CA3AF" />
        </div>
      )}

      <div className="card-content">
        <h3 className="campaign-title">{campaign.name}</h3>
        <div className="campaign-meta">
          <span><strong>Creator:</strong> {campaign.username || 'Anonymous'}</span>
          <span><strong>Category:</strong> {campaign.category}</span>
        </div>

        <div className="progress-section">
          <div className="amount-info">
            <div className="raised">{formatCurrency(campaign.raisedAmount)}</div>
            <div className="goal">of {formatCurrency(campaign.goalAmount)}</div>
          </div>
          <div className="ring-container">
            <svg width="100" height="100">
              <circle cx="50" cy="50" r="42" stroke="#E5E7EB" strokeWidth="10" fill="none" />
              <circle 
                cx="50" cy="50" r="42" 
                stroke="#10B981" 
                strokeWidth="10" 
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="percentage">{Math.round(progress)}%</div>
          </div>
        </div>

        <div className="card-actions">
          <button className="btn-view">
            <Eye size={18} /> View Details
          </button>
          {campaign.status === 'pending' && (
            <>
              <button onClick={() => onApprove(campaign.id)} className="btn-approve">
                <CheckCircle size={18} /> Approve
              </button>
              <button onClick={() => onReject(campaign.id)} className="btn-reject">
                <XCircle size={18} /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .campaign-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #E5E7EB;
          transition: all 0.35s ease;
        }

        .campaign-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .card-header {
          padding: 20px 28px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .campaign-id {
          font-family: 'JetBrains Mono', monospace;
          background: #F3F4F6;
          color: #6B7280;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-badge {
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .thumbnail {
          width: 100%;
          height: 240px;
          object-fit: cover;
        }

        .thumbnail.placeholder {
          background: #F9FAFB;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-content {
          padding: 28px;
        }

        .campaign-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 14px 0;
          line-height: 1.3;
        }

        .campaign-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #6B7280;
          font-size: 0.95rem;
          margin-bottom: 20px;
        }

        .campaign-meta strong {
          color: #374151;
        }

        .progress-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 24px 0;
        }

        .amount-info .raised {
          font-size: 1.8rem;
          font-weight: 800;
          color: #111827;
        }

        .amount-info .goal {
          color: #9CA3AF;
          font-size: 0.95rem;
        }

        .ring-container {
          position: relative;
        }

        .percentage {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.3rem;
          font-weight: 800;
          color: #111827;
        }

        .card-actions {
          display: grid;
          grid-template-columns: ${campaign.status === 'pending' ? '1fr 1fr 1fr' : '1fr'};
          gap: 12px;
          margin-top: 28px;
        }

        .btn-view, .btn-approve, .btn-reject {
          padding: 14px 16px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-view {
          background: #F9FAFB;
          color: #4B5563;
        }

        .btn-approve {
          background: #10B981;
          color: white;
        }

        .btn-reject {
          background: #EF4444;
          color: white;
        }

        .btn-view:hover { background: #E5E7EB; }
        .btn-approve:hover { background: #059669; }
        .btn-reject:hover { background: #DC2626; }
      `}</style>
    </div>
  );
};

export default AdminCampaignManagement;