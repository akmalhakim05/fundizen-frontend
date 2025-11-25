// src/components/admin/tabs/AdminDonationManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import donationService from '../../../services/donationService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import { 
  DollarSign, Search, ChevronLeft, ChevronRight,
  CheckCircle, User, Calendar, CreditCard, SearchX,
  TrendingUp, Users, Calculator, PiggyBank, Receipt
} from 'lucide-react';

const AdminDonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
    status: 'all'
  });
  const [pagination, setPagination] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const apiFilters = { ...filters };
      if (apiFilters.status === 'all') delete apiFilters.status;

      const response = await donationService.getAllDonations(apiFilters);
      setDonations(response.donations || []);
      setPagination(response.pagination || null);
      setGlobalStats(response.statistics || null);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load donations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      donationService.searchDonations(searchQuery, 0, filters.size)
        .then(res => {
          setDonations(res.donations || []);
          setPagination(res.pagination || null);
          setGlobalStats(res.statistics || null);
        })
        .catch(() => setError('Search failed'));
    } else {
      fetchDonations();
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters(prev => ({ ...prev, status: 'all', page: 0 }));
  };

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount || 0);

  const formatDate = (date) => 
    date ? new Date(date).toLocaleDateString('en-MY', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) : '—';

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'succeeded': return 'status-badge succeeded';
      case 'pending': return 'status-badge pending';
      case 'failed': return 'status-badge failed';
      case 'refunded': return 'status-badge refunded';
      default: return 'status-badge';
    }
  };

  if (loading && donations.length === 0) return <LoadingSpinner message="Loading donations..." />;
  if (error && donations.length === 0) return <ErrorMessage message={error} onRetry={fetchDonations} />;

  const hasActiveFilters = searchQuery || filters.status !== 'all';

  return (
    <div className="admin-donation-management">
      {/* Header */}
      <div className="donation-header">
        <h2><DollarSign size={36} /> Donation Management</h2>
        <p>Monitor and review all donations across Fundizen</p>
      </div>

      {/* GLOBAL PLATFORM STATISTICS - NOW AT THE TOP */}
      {globalStats && (
        <div className="global-stats-container">
          <h3 className="stats-title">
            <TrendingUp size={28} />
            Platform Overview
          </h3>
          <div className="global-stats-grid">
            <div className="stat-card total-raised">
              <div className="icon-wrapper"><DollarSign size={32} /></div>
              <div className="stat-content">
                <div className="label">Total Raised</div>
                <div className="value">{formatCurrency(globalStats.totalRaised || 0)}</div>
              </div>
            </div>

            <div className="stat-card total-donations">
              <div className="icon-wrapper"><Users size={32} /></div>
              <div className="stat-content">
                <div className="label">Total Donations</div>
                <div className="value">{(globalStats.totalDonations || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="stat-card average-donation">
              <div className="icon-wrapper"><Calculator size={32} /></div>
              <div className="stat-content">
                <div className="label">Average Donation</div>
                <div className="value">
                  {formatCurrency(
                    globalStats.totalDonations ? globalStats.totalRaised / globalStats.totalDonations : 0
                  )}
                </div>
              </div>
            </div>

            <div className="stat-card net-to-campaigns">
              <div className="icon-wrapper"><PiggyBank size={32} /></div>
              <div className="stat-content">
                <div className="label">Net to Campaigns</div>
                <div className="value">
                  {formatCurrency(
                    (globalStats.totalRaised || 0) - (globalStats.platformFees || 0) - (globalStats.stripeFees || 0)
                  )}
                </div>
              </div>
            </div>

            <div className="stat-card total-fees">
              <div className="icon-wrapper"><Receipt size={32} /></div>
              <div className="stat-content">
                <div className="label">Total Fees Collected</div>
                <div className="value">
                  {formatCurrency((globalStats.platformFees || 0) + (globalStats.stripeFees || 0))}
                </div>
                <div className="fee-details">
                  Platform: {formatCurrency(globalStats.platformFees || 0)} • 
                  Stripe: {formatCurrency(globalStats.stripeFees || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="donation-controls">
        <div className="filters-group">
          <div className="filter-item search-item">
            <label>Search</label>
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Donor, email, campaign, Payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div className="filter-item">
            <label>Status</label>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value, page: 0})}>
              <option value="all">All Status</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Per Page</label>
            <select value={filters.size} onChange={e => setFilters({...filters, size: +e.target.value, page: 0})}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="results-summary">
          <span>
            {pagination?.totalElements || donations.length} donation{donations.length !== 1 ? 's' : ''}
            {pagination && ` • Page ${filters.page + 1} of ${pagination.totalPages}`}
          </span>
        </div>
      </div>

      {/* This Page Summary Cards */}
      {pagination && (
        <div className="summary-grid">
          <div className="summary-card total">
            <div className="value">{formatCurrency(pagination.pageUserPayments || 0)}</div>
            <div className="label">This Page Total</div>
          </div>
          <div className="summary-card net">
            <div className="value">{formatCurrency(pagination.pageNetToCampaigns || 0)}</div>
            <div className="label">Net to Campaigns</div>
          </div>
          <div className="summary-card fees">
            <div className="value">−{formatCurrency(pagination.pageFees || 0)}</div>
            <div className="label">Platform Fees</div>
          </div>
        </div>
      )}

      {/* Donations Grid */}
      <div className="donations-grid">
        {donations.length > 0 ? (
          donations.map(donation => (
            <DonationCard
              key={donation.id}
              donation={donation}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              {hasActiveFilters ? <SearchX size={80} /> : <DollarSign size={80} />}
            </div>
            <h3>{hasActiveFilters ? 'No donations found' : 'No donations yet'}</h3>
            <p>
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : hasActiveFilters
                  ? 'Try adjusting your search or filters.'
                  : 'Donations will appear here when supporters contribute.'
              }
            </p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="clear-btn">
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
            disabled={filters.page === 0}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          <span>Page {filters.page + 1} of {pagination.totalPages}</span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages - 1, prev.page + 1) }))}
            disabled={filters.page >= pagination.totalPages - 1}
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      )}

      <style jsx>{`
        .admin-donation-management {
          padding: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .donation-header h2 {
          font-size: 2.6rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 0 0 8px 0;
        }
        .donation-header p { color: #64748b; font-size: 1.1rem; }

        /* GLOBAL STATS - ENHANCED & MOVED TO TOP */
        .global-stats-container {
          margin: 32px 0;
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .stats-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 28px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .global-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          padding: 28px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .stat-content {
          flex: 1;
          min-width: 0;
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .icon-wrapper {
          width: 76px;
          height: 76px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .total-raised .icon-wrapper { background: linear-gradient(135deg, #dbeafe, #93c5fd); color: #1d4ed8; }
        .total-donations .icon-wrapper { background: linear-gradient(135deg, #e9d5ff, #c4b5fd); color: #7c3aed; }
        .average-donation .icon-wrapper { background: linear-gradient(135deg, #fed7aa, #fdba74); color: #f97316; }
        .net-to-campaigns .icon-wrapper { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #10b981; }
        .total-fees .icon-wrapper { background: linear-gradient(135deg, #fecaca, #fca5a5); color: #ef4444; }

        .stat-content .label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        .stat-content .value {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .fee-details {
          margin-top: 8px;
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 500;
          white-space: normal;
          word-wrap: break-word;
          line-height: 1.4;
        }

        /* Controls */
        .donation-controls {
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

        /* Rest of your existing styles (unchanged for brevity) */
        .filters-group { display: flex; gap: 24px; flex-wrap: wrap; align-items: end; }
        .filter-item { display: flex; flex-direction: column; gap: 8px; }
        .filter-item label { font-size: 0.9rem; font-weight: 600; color: #475569; }
        .filter-item select {
          padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0;
          background: white; font-size: 0.95rem; min-width: 160px;
        }

        .search-wrapper { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 14px; color: #94a3b8; pointer-events: none; }
        .search-item input {
          padding: 12px 16px 12px 44px; border-radius: 12px; border: 1.5px solid #e2e8f0;
          font-size: 0.95rem; width: 320px; outline: none;
        }
        .search-item input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

        .results-summary span { font-weight: 500; color: #64748b; }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .summary-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          padding: 28px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          text-align: center;
          transition: all 0.3s ease;
        }

        .summary-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
        }

        .summary-card .value {
          font-size: 2.2rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .summary-card .label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .summary-card.total .value { color: #1d4ed8; }
        .summary-card.net .value { color: #10b981; }
        .summary-card.fees .value { color: #ef4444; }

        .donations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
          gap: 28px;
          margin-bottom: 40px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 40px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        .empty-icon {
          color: #cbd5e1;
          margin-bottom: 24px;
        }

        .empty-state h3 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 12px;
        }

        .empty-state p {
          font-size: 1.1rem;
          color: #64748b;
          margin-bottom: 24px;
        }

        .clear-btn {
          padding: 12px 32px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
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
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .pagination button:hover:not(:disabled) {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .pagination button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination span {
          color: #64748b;
          font-size: 1rem;
        }

        @media (max-width: 1400px) {
          .global-stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          }
          .stat-card {
            padding: 24px;
          }
          .icon-wrapper {
            width: 64px;
            height: 64px;
          }
          .stat-content .value {
            font-size: 1.8rem;
          }
        }

        @media (max-width: 1024px) {
          .admin-donation-management {
            padding: 24px;
          }
          .donation-controls {
            flex-direction: column;
            align-items: stretch;
          }
          .filters-group {
            width: 100%;
          }
          .search-item input {
            width: 100%;
          }
          .donations-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .admin-donation-management {
            padding: 16px;
          }
          .donation-header h2 {
            font-size: 2rem;
          }
          .global-stats-grid {
            grid-template-columns: 1fr;
          }
          .stat-card {
            flex-direction: row;
          }
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// DonationCard remains unchanged
const DonationCard = ({ donation, formatCurrency, formatDate, getStatusBadgeClass }) => {
  return (
    <div className="donation-card">
      <div className="card-header">
        <span className="donation-id">#{donation.id.slice(-8)}</span>
        <span className={getStatusBadgeClass(donation.status)}>
          {donation.status}
        </span>
      </div>

      <div className="donor-info">
        <User size={48} className="donor-avatar" />
        <div>
          <div className="donor-name">{donation.donorName || 'Anonymous'}</div>
          <div className="donor-email">{donation.donorEmail || '—'}</div>
        </div>
      </div>

      <div className="amount-section">
        <div className="main-amount">{formatCurrency(donation.userPayment)}</div>
        {donation.netToCampaign !== donation.userPayment && (
          <div className="net-amount">→ {formatCurrency(donation.netToCampaign)} net</div>
        )}
      </div>

      <div className="campaign-info">
        <strong>Campaign:</strong> {donation.campaignName || `ID: ${donation.campaignId}`}
      </div>

      {donation.message && (
        <div className="message-box">
          <p>"{donation.message}"</p>
        </div>
      )}

      <div className="meta-grid">
        <div>
          <Calendar size={16} />
          <span>{formatDate(donation.createdAt)}</span>
          <small>{donation.timeAgo}</small>
        </div>
        {donation.completedAt && (
          <div>
            <CheckCircle size={16} />
            <span>{formatDate(donation.completedAt)}</span>
            <small>Completed</small>
          </div>
        )}
      </div>

      <div className="payment-id">
        <CreditCard size={18} />
        <code>{donation.stripePaymentIntentId}</code>
      </div>

      <style jsx>{`
        .donation-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          transition: all 0.4s ease;
        }
        .donation-card:hover { transform: translateY(-12px); box-shadow: 0 25px 50px rgba(0,0,0,0.15); }

        .card-header {
          padding: 20px 28px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .donation-id {
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
        .status-badge.succeeded { background: #ecfdf5; color: #047857; }
        .status-badge.pending { background: #fff7ed; color: #c2410c; }
        .status-badge.failed { background: #fee2e2; color: #991b1b; }
        .status-badge.refunded { background: #f3e8ff; color: #9333ea; }

        .donor-info {
          padding: 28px 28px 0;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .donor-avatar {
          width: 64px;
          height: 64px;
          background: #f1f5f9;
          border-radius: 50%;
          padding: 8px;
          color: #64748b;
        }
        .donor-name { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
        .donor-email { color: #64748b; font-size: 0.95rem; }

        .amount-section {
          padding: 20px 28px;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          text-align: center;
        }
        .main-amount {
          font-size: 2.4rem;
          font-weight: 800;
          color: #1d4ed8;
        }
        .net-amount {
          font-size: 1.1rem;
          color: #1e40af;
          margin-top: 8px;
        }

        .campaign-info {
          padding: 0 28px;
          margin: 20px 0;
          font-size: 1.1rem;
          color: #475569;
        }
        .campaign-info strong { color: #1e293b; }

        .message-box {
          margin: 20px 28px;
          padding: 20px;
          background: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          border-radius: 0 12px 12px 0;
        }
        .message-box p {
          margin: 0;
          font-style: italic;
          color: #0c4a6e;
          line-height: 1.6;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 20px 28px;
          background: #f8fafc;
          font-size: 0.95rem;
        }
        .meta-grid > div { display: flex; flex-direction: column; gap: 4px; }
        .meta-grid svg { color: #64748b; }
        .meta-grid span { font-weight: 600; color: #1e293b; }
        .meta-grid small { color: #94a3b8; }

        .payment-id {
          padding: 20px 28px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: #475569;
        }
        .payment-id code {
          background: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default AdminDonationManagement;