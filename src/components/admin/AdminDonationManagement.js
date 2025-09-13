import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/components/AdminDonationManagement.css';

const AdminDonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
    search: ''
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, [filters]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await paymentService.getAllDonations(filters);
      setDonations(response.donations || []);
      setPagination(response.pagination || null);
      
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDonation = async (donationId) => {
    try {
      await paymentService.verifyDonation(donationId);
      fetchDonations(); // Refresh list
      alert('Donation verified successfully!');
    } catch (error) {
      console.error('Error verifying donation:', error);
      alert('Failed to verify donation: ' + (error.error || error.message));
    }
  };

  const handleRefundDonation = async (donationId, amount = null) => {
    const reason = prompt('Please provide a reason for the refund:');
    if (reason === null) return; // User cancelled

    try {
      await paymentService.createRefund(donationId, amount, reason);
      fetchDonations(); // Refresh list
      alert('Refund processed successfully!');
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Failed to process refund: ' + (error.error || error.message));
    }
  };

  const formatCurrency = (amount) => {
    return paymentService.formatCurrency(amount);
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

  if (loading && donations.length === 0) {
    return <LoadingSpinner message="Loading donations..." />;
  }

  if (error && donations.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchDonations} />;
  }

  return (
    <div className="admin-donation-management">
      <div className="donation-management-header">
        <h2>💰 Donation Management</h2>
        <p>Monitor and manage all donation transactions</p>
      </div>

      {/* Filters and Controls */}
      <div className="donation-controls">
        <div className="donation-filters">
          <input
            type="text"
            placeholder="Search donations..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value, page: 0})}
            className="search-input"
          />

          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 0})}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select 
            value={filters.paymentMethod} 
            onChange={(e) => setFilters({...filters, paymentMethod: e.target.value, page: 0})}
          >
            <option value="all">All Payment Methods</option>
            <option value="stripe">Credit/Debit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
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
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        <button 
          className="refresh-btn"
          onClick={fetchDonations}
          disabled={loading}
        >
          🔄 {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Donation List */}
      <div className="donation-list">
        <div className="donation-list-header">
          <span className="donation-count">
            {donations.length} donations found
          </span>
        </div>

        {loading && <LoadingSpinner message="Loading donations..." />}
        
        {error && <ErrorMessage message={error} onRetry={fetchDonations} />}

        {donations.length === 0 && !loading && !error && (
          <div className="no-donations">
            <h3>No donations found</h3>
            <p>No donations match the current filters.</p>
          </div>
        )}

        <div className="donations-grid">
          {donations.map(donation => (
            <DonationManagementCard
              key={donation.id}
              donation={donation}
              onVerify={() => handleVerifyDonation(donation.id)}
              onRefund={() => handleRefundDonation(donation.id)}
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

// Donation Management Card Component
const DonationManagementCard = ({ 
  donation, 
  onVerify, 
  onRefund, 
  formatCurrency, 
  formatDate 
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'failed': return '❌';
      case 'refunded': return '↩️';
      default: return '❓';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'stripe': return '💳';
      case 'bank_transfer': return '🏦';
      default: return '💰';
    }
  };

  return (
    <div className="admin-donation-card">
      <div className="donation-card-header">
        <div className="donation-amount">{formatCurrency(donation.amount)}</div>
        <div className={`donation-status ${donation.status}`}>
          {getStatusIcon(donation.status)} {donation.status}
        </div>
      </div>

      <div className="donation-card-content">
        <div className="donation-details">
          <div className="detail-row">
            <span className="label">ID:</span>
            <span className="value">{donation.id}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Campaign:</span>
            <span className="value">{donation.campaignName}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Donor:</span>
            <span className="value">
              {donation.isAnonymous ? 'Anonymous' : donation.donorName}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{donation.donorEmail}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Method:</span>
            <span className="value">
              {getPaymentMethodIcon(donation.paymentMethod)} 
              {donation.paymentMethod === 'stripe' ? 'Credit/Debit Card' : 
               donation.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 
               donation.paymentMethod}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="label">Date:</span>
            <span className="value">{formatDate(donation.createdAt)}</span>
          </div>
          
          {donation.transactionId && (
            <div className="detail-row">
              <span className="label">Transaction:</span>
              <span className="value transaction-id">{donation.transactionId}</span>
            </div>
          )}
          
          {donation.message && (
            <div className="detail-row message-row">
              <span className="label">Message:</span>
              <span className="value">"{donation.message}"</span>
            </div>
          )}
        </div>
      </div>

      <div className="donation-card-actions">
        <button className="action-btn view-details">
          👁️ View Details
        </button>
        
        {donation.status === 'pending' && donation.paymentMethod === 'bank_transfer' && (
          <button 
            onClick={onVerify}
            className="action-btn verify"
          >
            ✅ Verify
          </button>
        )}
        
        {(donation.status === 'completed' || donation.status === 'pending') && (
          <button 
            onClick={onRefund}
            className="action-btn refund"
          >
            ↩️ Refund
          </button>
        )}
        
        {donation.receiptUrl && (
          <a 
            href={donation.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn receipt"
          >
            📄 Receipt
          </a>
        )}
      </div>
    </div>
  );
};

export default AdminDonationManagement;