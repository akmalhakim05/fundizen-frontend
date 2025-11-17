// src/components/admin/tabs/AdminDonationManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import donationService from '../../../services/donationService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import { 
  DollarSign, CreditCard, Search, Filter, Download, 
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle, XCircle,
  Clock, User, Calendar, SearchX
} from 'lucide-react';

const AdminDonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDonations, setSelectedDonations] = useState([]);
  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
    status: 'all',
    campaignId: '',
    userId: ''
  });
  const [pagination, setPagination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const apiFilters = { ...filters };
      if (apiFilters.status === 'all') delete apiFilters.status;
      if (!apiFilters.campaignId) delete apiFilters.campaignId;
      if (!apiFilters.userId) delete apiFilters.userId;

      const response = await donationService.getAllDonations(apiFilters);
      setDonations(response.donations || []);
      setPagination(response.pagination || null);
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
      donationService.searchDonations(searchQuery, 0, 20)
        .then(res => {
          setDonations(res.donations || []);
          setPagination(res.pagination || null);
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

  const handleExport = async () => {
    try {
      await donationService.exportDonations('csv', filters);
      alert('Donations exported successfully!');
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleSelectDonation = (id, checked) => {
    setSelectedDonations(prev => 
      checked ? [...prev, id] : prev.filter(x => x !== id)
    );
  };

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount || 0);

  const formatDate = (date) => 
    new Date(date).toLocaleDateString('en-MY', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <p>Monitor, search, and export all donations across the platform</p>
      </div>

      {/* Controls */}
      <div className="donation-controls">
        <div className="filters-left">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by donor, email, campaign ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-btn">Search</button>
          </div>

          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value, page: 0})}>
            <option value="all">All Status</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
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

        <div className="bulk-actions">
          <span>{selectedDonations.length} selected</span>
          {selectedDonations.length > 0 && (
            <button className="refund-btn">
              <AlertCircle size={18} /> Refund Selected
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {pagination && (
        <div className="donation-summary">
          <div className="summary-card">
            <strong>{pagination.totalElements.toLocaleString()}</strong> Total Donations
          </div>
          <div className="summary-card">
            <strong>{formatCurrency(pagination.pageUserPayments || 0)}</strong> This Page
          </div>
          <div className="summary-card">
            <strong>{formatCurrency(pagination.pageNetToCampaigns || 0)}</strong> Net to Campaigns
          </div>
          <div className="summary-card">
            <strong>{formatCurrency(pagination.pageFees || 0)}</strong> Fees
          </div>
        </div>
      )}

      {/* Donations Grid + Empty State */}
      <div className="donations-grid">
        {donations.length > 0 ? (
          donations.map(donation => (
            <DonationCard
              key={donation.id}
              donation={donation}
              isSelected={selectedDonations.includes(donation.id)}
              onSelect={handleSelectDonation}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
            />
          ))
        ) : (
          <div className="empty-donations-state">
            <div className="empty-icon">
              {hasActiveFilters ? <SearchX size={84} /> : <DollarSign size={84} />}
            </div>
            <h3>
              {hasActiveFilters 
                ? `No donations match your search` 
                : 'No donations yet'
              }
            </h3>
            <p className="empty-subtitle">
              {searchQuery 
                ? `We couldn't find any donations matching "${searchQuery}"`
                : hasActiveFilters
                  ? 'Try adjusting your filters or search term.'
                  : 'When supporters start donating, their contributions will appear here automatically.'
              }
            </p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="clear-filters-btn">
                Clear all filters
              </button>
            )}
            {error && (
              <button onClick={fetchDonations} className="retry-btn">
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && donations.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={filters.page === 0}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          <span>Page {filters.page + 1} of {pagination.totalPages}</span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page + 1 >= pagination.totalPages}
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      )}

      <style jsx>{`
        /* ... your existing styles ... */

        .empty-donations-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 100px 40px;
          background: white;
          border-radius: 32px;
          border: 3px dashed #cbd5e1;
          color: #64748b;
          margin: 40px 0;
        }

        .empty-icon {
          width: 160px;
          height: 160px;
          margin: 0 auto 32px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          box-shadow: inset 0 15px 40px rgba(0,0,0,0.08);
        }

        .empty-donations-state h3 {
          font-size: 2.4rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 20px 0;
        }

        .empty-subtitle {
          font-size: 1.2rem;
          line-height: 1.7;
          max-width: 640px;
          margin: 0 auto 36px;
          color: #475569;
        }

        .clear-filters-btn,
        .retry-btn {
          padding: 16px 36px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          margin: 0 12px;
        }

        .clear-filters-btn {
          background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
          color: #475569;
        }

        .clear-filters-btn:hover {
          background: linear-gradient(135deg, #cbd5e1, #94a3b8);
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(148, 163, 184, 0.3);
        }

        .retry-btn {
          background: linear-gradient(135deg, #1e6cff, #4c8aff);
          color: white;
        }

        .retry-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(30, 108, 255, 0.4);
        }

        @media (max-width: 768px) {
          .empty-donations-state {
            padding: 80px 20px;
          }
          .empty-icon {
            width: 130px;
            height: 130px;
          }
          .empty-donations-state h3 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

const DonationCard = ({ donation, isSelected, onSelect, formatCurrency, formatDate, getStatusColor }) => {
  return (
    <div className={`donation-card ${isSelected ? 'selected' : ''}`}>
      <div className="donation-card-header">
        <label>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(donation.id, e.target.checked)}
          />
        </label>
        <span className={`status-badge ${getStatusColor(donation.status)}`}>
          {donation.status}
        </span>
      </div>

      <div className="donation-info">
        <div className="donor-info">
          <User size={20} />
          <div>
            <strong>{donation.donorName || 'Anonymous'}</strong>
            {donation.donorEmail && <small>{donation.donorEmail}</small>}
          </div>
        </div>

        <div className="amount-info">
          <div className="main-amount">
            <DollarSign size={24} />
            <strong>{formatCurrency(donation.userPayment)}</strong>
          </div>
          {donation.netToCampaign !== donation.userPayment && (
            <small>→ {formatCurrency(donation.netToCampaign)} net</small>
          )}
        </div>

        <div className="campaign-info">
          <strong>Campaign:</strong> #{donation.campaignId}
        </div>

        <div className="donation-meta">
          <span><Calendar size={16} /> {formatDate(donation.createdAt)}</span>
          {donation.message && <span><Clock size={16} /> Has message</span>}
        </div>

        {donation.message && (
          <div className="donation-message">
            <p>"{donation.message}"</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .donation-card {
          background: white;
          border-radius: 24px;
          padding: 28px;
          border: 2px solid #e2e8f0;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .donation-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          border-color: #1e6cff;
        }

        .donation-card.selected {
          border-color: #1e6cff;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }

        .donation-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .donation-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .donor-info, .donation-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #475569;
        }

        .amount-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .main-amount {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0f172a;
        }

        .donation-message {
          margin-top: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 16px;
          border-left: 4px solid #1e6cff;
        }

        .donation-message p {
          margin: 0;
          font-style: italic;
          color: #475569;
        }
      `}</style>
    </div>
  );
};

export default AdminDonationManagement;