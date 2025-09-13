import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { campaignService } from '../../services/campaignService';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/components/DonationSuccess.css';

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  const sessionId = searchParams.get('session_id');
  const donationId = searchParams.get('donation_id');

  useEffect(() => {
    if (sessionId || donationId) {
      fetchDonationDetails();
    } else {
      setError('Invalid donation reference');
      setLoading(false);
    }
  }, [sessionId, donationId]);

  const fetchDonationDetails = async () => {
    try {
      setLoading(true);
      
      let donationData;
      
      if (sessionId) {
        // Handle Stripe checkout success
        donationData = await paymentService.getDonationBySessionId(sessionId);
      } else if (donationId) {
        // Handle direct donation reference
        donationData = await paymentService.getDonationById(donationId);
      }

      if (donationData) {
        setDonation(donationData);
        
        // Fetch campaign details
        const campaignData = await campaignService.getCampaignById(donationData.campaignId);
        setCampaign(campaignData);
      }
      
    } catch (error) {
      console.error('Error fetching donation details:', error);
      setError('Failed to load donation information');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return paymentService.formatCurrency(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadReceipt = async () => {
    try {
      if (donation.receiptUrl) {
        window.open(donation.receiptUrl, '_blank');
      } else {
        // Generate receipt if not available
        const receiptData = paymentService.generateReceiptData(donation, campaign);
        console.log('Receipt data:', receiptData);
        // You can implement PDF generation here
        alert('Receipt download will be available soon');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt');
    }
  };

  const handleShareDonation = () => {
    const shareText = `I just donated ${formatCurrency(donation.amount)} to "${campaign.name}" on Fundizen! Join me in supporting this amazing cause.`;
    const shareUrl = `${window.location.origin}/campaign/${campaign.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Supporting ${campaign.name}`,
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert('Share link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="donation-success-container">
        <LoadingSpinner message="Loading donation details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="donation-success-container">
        <div className="error-state">
          <h2>❌ Something went wrong</h2>
          <p>{error}</p>
          <Link to="/campaigns" className="btn btn-primary">
            Browse Campaigns
          </Link>
        </div>
      </div>
    );
  }

  if (!donation || !campaign) {
    return (
      <div className="donation-success-container">
        <div className="error-state">
          <h2>❌ Donation not found</h2>
          <p>We couldn't find the donation information you're looking for.</p>
          <Link to="/campaigns" className="btn btn-primary">
            Browse Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="donation-success-container">
      <div className="success-content">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">🎉</div>
          <h1>Thank You for Your Generous Donation!</h1>
          <p className="success-subtitle">
            Your contribution makes a real difference
          </p>
        </div>

        {/* Donation Summary Card */}
        <div className="donation-summary-card">
          <div className="summary-header">
            <h2>Donation Summary</h2>
            <div className="donation-status">
              <span className={`status-badge ${donation.status}`}>
                {donation.status === 'completed' ? '✅ Completed' : 
                 donation.status === 'pending' ? '⏳ Pending' : 
                 donation.status === 'processing' ? '🔄 Processing' : donation.status}
              </span>
            </div>
          </div>

          <div className="summary-content">
            <div className="donation-amount">
              <span className="amount-label">Donation Amount</span>
              <span className="amount-value">{formatCurrency(donation.amount)}</span>
            </div>

            <div className="summary-details">
              <div className="detail-row">
                <span className="label">Campaign:</span>
                <span className="value">
                  <Link to={`/campaign/${campaign.id}`} className="campaign-link">
                    {campaign.name}
                  </Link>
                </span>
              </div>
              
              <div className="detail-row">
                <span className="label">Donation ID:</span>
                <span className="value">{donation.id}</span>
              </div>
              
              <div className="detail-row">
                <span className="label">Date & Time:</span>
                <span className="value">{formatDate(donation.createdAt)}</span>
              </div>
              
              <div className="detail-row">
                <span className="label">Payment Method:</span>
                <span className="value">
                  {donation.paymentMethod === 'stripe' ? 'Credit/Debit Card' : 
                   donation.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 
                   donation.paymentMethod}
                </span>
              </div>
              
              {donation.transactionId && (
                <div className="detail-row">
                  <span className="label">Transaction ID:</span>
                  <span className="value">{donation.transactionId}</span>
                </div>
              )}
              
              <div className="detail-row">
                <span className="label">Donor:</span>
                <span className="value">
                  {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                </span>
              </div>
              
              {donation.message && (
                <div className="detail-row message-row">
                  <span className="label">Your Message:</span>
                  <span className="value message-text">"{donation.message}"</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bank Transfer Instructions (if applicable) */}
        {donation.paymentMethod === 'bank_transfer' && donation.status === 'pending' && (
          <div className="bank-transfer-card">
            <h3>🏦 Bank Transfer Instructions</h3>
            <p>Please complete your donation by transferring the amount to our bank account:</p>
            
            <div className="bank-details">
              <div className="bank-info">
                <div className="bank-field">
                  <span className="field-label">Bank Name:</span>
                  <span className="field-value">Maybank</span>
                </div>
                <div className="bank-field">
                  <span className="field-label">Account Name:</span>
                  <span className="field-value">Fundizen Sdn Bhd</span>
                </div>
                <div className="bank-field">
                  <span className="field-label">Account Number:</span>
                  <span className="field-value">1234567890</span>
                </div>
                <div className="bank-field">
                  <span className="field-label">Amount:</span>
                  <span className="field-value amount">{formatCurrency(donation.amount)}</span>
                </div>
                <div className="bank-field">
                  <span className="field-label">Reference:</span>
                  <span className="field-value reference">{donation.id}</span>
                </div>
              </div>
            </div>

            <div className="transfer-notes">
              <h4>Important Notes:</h4>
              <ul>
                <li>Please include the reference number <strong>{donation.id}</strong> in your transfer description</li>
                <li>Your donation will be confirmed within 1-2 business days after we receive the transfer</li>
                <li>You will receive an email confirmation once the transfer is verified</li>
                <li>If you need assistance, please contact our support team</li>
              </ul>
            </div>
          </div>
        )}

        {/* Campaign Progress Update */}
        <div className="campaign-progress-card">
          <h3>Campaign Progress</h3>
          <div className="campaign-info">
            <div className="campaign-image">
              {campaign.imageUrl ? (
                <img src={campaign.imageUrl} alt={campaign.name} />
              ) : (
                <div className="placeholder-image">📋</div>
              )}
            </div>
            <div className="campaign-details">
              <h4>{campaign.name}</h4>
              <p>by {campaign.creatorUsername}</p>
              
              <div className="progress-info">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="progress-stats">
                  <span>{formatCurrency(campaign.raisedAmount)} raised</span>
                  <span>of {formatCurrency(campaign.goalAmount)}</span>
                  <span>{Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={handleDownloadReceipt}
          >
            📄 Download Receipt
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={handleShareDonation}
          >
            📱 Share Donation
          </button>
          
          <Link 
            to={`/campaign/${campaign.id}`} 
            className="btn btn-outline"
          >
            👁️ View Campaign
          </Link>
          
          <Link 
            to="/campaigns" 
            className="btn btn-secondary"
          >
            🔍 Browse More Campaigns
          </Link>
        </div>

        {/* Email Confirmation Notice */}
        <div className="email-notice">
          <h4>📧 Email Confirmation</h4>
          <p>
            A confirmation email has been sent to <strong>{donation.donorEmail}</strong>.
            Please check your inbox (and spam folder) for your donation receipt and further details.
          </p>
        </div>

        {/* Support Notice */}
        <div className="support-notice">
          <h4>Need Help?</h4>
          <p>
            If you have any questions about your donation or need assistance, 
            please don't hesitate to <Link to="/contact">contact our support team</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccess;