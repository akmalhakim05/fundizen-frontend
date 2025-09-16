import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SimpleDonationModal from './DonationModal';
import '../../styles/components/Campaign.css';

const CampaignCard = ({ campaign }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showDonationModal, setShowDonationModal] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (!campaign.goalAmount || campaign.goalAmount === 0) return 0;
    return Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100);
  };

  const getDaysRemaining = () => {
    if (!campaign.endDate) return 0;
    const endDate = new Date(campaign.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusInfo = () => {
    // Check verification status
    if (!campaign.verified) {
      return { status: 'pending', label: 'UNDER REVIEW', color: '#ffc107', canDonate: false };
    }
    
    // Check campaign status - YOUR BACKEND USES 'status' FIELD, NOT 'isActive'
    // Backend statuses: "pending", "approved", "rejected"
    if (campaign.status !== 'approved') {
      return { status: 'inactive', label: 'NOT APPROVED', color: '#6c757d', canDonate: false };
    }
    
    // Check if campaign has ended
    const daysRemaining = getDaysRemaining();
    if (daysRemaining <= 0) {
      return { status: 'ended', label: 'CAMPAIGN ENDED', color: '#dc3545', canDonate: false };
    }
    
    // Check if campaign hasn't started yet
    const today = new Date();
    const startDate = new Date(campaign.startDate);
    if (startDate > today) {
      return { status: 'upcoming', label: 'COMING SOON', color: '#17a2b8', canDonate: false };
    }
    
    // Campaign is active and can receive donations
    const progressPercentage = getProgressPercentage();
    if (progressPercentage >= 100) {
      return { status: 'funded', label: 'FULLY FUNDED', color: '#28a745', canDonate: true };
    }
    
    return { status: 'active', label: 'ACTIVE', color: '#28a745', canDonate: true };
  };

  const canReceiveDonations = () => {
    return campaign.verified && 
           campaign.status === 'approved' && 
           getDaysRemaining() > 0 &&
           new Date(campaign.startDate) <= new Date();
  };

  const handleDonate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          message: 'Please login to donate to this campaign.',
          returnUrl: `/campaign/${campaign.id || campaign._id}`
        }
      });
      return;
    }
    
    if (!currentUser.emailVerified) {
      navigate('/verify-email', {
        state: { message: 'Please verify your email to donate to campaigns.' }
      });
      return;
    }
    
    setShowDonationModal(true);
  };

  const handleDonationSuccess = (result) => {
    console.log('Donation successful:', result);
    // Refresh campaign data or show success message
    setShowDonationModal(false);
    // You could refresh the page or update the campaign data here
    window.location.reload();
  };

  const statusInfo = getStatusInfo();
  const progressPercentage = getProgressPercentage();
  const daysRemaining = getDaysRemaining();

  return (
    <>
      <div className="campaign-card-modern">
        {/* Status Badge */}
        <div 
          className="status-badge-modern" 
          style={{ backgroundColor: statusInfo.color }}
        >
          {statusInfo.label}
        </div>

        {/* Campaign Image */}
        <Link to={`/campaign/${campaign.id || campaign._id}`} className="campaign-image-link">
          <div className="campaign-image-modern">
            {campaign.imageUrl ? (
              <img
                src={campaign.imageUrl}
                alt={campaign.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="no-image-modern" style={{ display: campaign.imageUrl ? 'none' : 'flex' }}>
              <div className="clipboard-icon">📋</div>
              <span>No Image</span>
            </div>
          </div>
        </Link>

        {/* Campaign Content */}
        <div className="campaign-content-modern">
          {/* Category Badge */}
          <div className="category-badge-modern">
            {campaign.category?.toUpperCase() || 'GENERAL'}
          </div>

          {/* Campaign Title */}
          <Link to={`/campaign/${campaign.id || campaign._id}`} className="campaign-title-link">
            <h3 className="campaign-title-modern">{campaign.name}</h3>
          </Link>

          {/* Creator Info */}
          <div className="creator-info-modern">
            <div className="creator-avatar-modern">
              {(campaign.creatorUsername || 'A')[0].toUpperCase()}
            </div>
            <span className="creator-text">
              by <strong>{campaign.creatorUsername || 'Anonymous'}</strong>
            </span>
          </div>

          {/* Description */}
          <p className="campaign-description-modern">
            {campaign.description?.length > 100
              ? `${campaign.description.substring(0, 100)}...`
              : campaign.description
            }
          </p>

          {/* Funding Progress */}
          <div className="funding-section-modern">
            <div className="funding-amounts">
              <div className="raised-amount-modern">
                <span className="amount-text">{formatCurrency(campaign.raisedAmount)}</span>
                <span className="raised-label">RAISED</span>
              </div>
              <div className="goal-amount-modern">
                <span className="goal-text">of {formatCurrency(campaign.goalAmount)} goal</span>
                <span className="percentage-text">{progressPercentage.toFixed(1)}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-modern">
              <div 
                className="progress-fill-modern"
                style={{ 
                  width: `${progressPercentage}%`,
                  backgroundColor: statusInfo.color
                }}
              />
            </div>

            {/* Stats Row */}
            <div className="stats-row-modern">
              <div className="stat-item-modern">
                <div className="stat-icon-modern">📅</div>
                <div className="stat-content-modern">
                  <span className="stat-label-modern">DAYS LEFT</span>
                  <span className="stat-value-modern">{daysRemaining} days</span>
                </div>
              </div>
              <div className="stat-item-modern">
                <div className="stat-icon-modern">👥</div>
                <div className="stat-content-modern">
                  <span className="stat-label-modern">SUPPORTERS</span>
                  <span className="stat-value-modern">{campaign.supporters || 0} people</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-modern">
            <Link 
              to={`/campaign/${campaign.id || campaign._id}`} 
              className="btn-view-modern"
            >
              <span className="btn-icon-modern">👁</span>
              View Details
            </Link>
            
            {canReceiveDonations() ? (
              <button
                className="btn-donate-modern"
                onClick={handleDonate}
                title="Donate to this campaign"
              >
                <span className="btn-icon-modern">💝</span>
                Donate Now
              </button>
            ) : (
              <button className="btn-disabled-modern" disabled>
                <span className="btn-icon-modern">🚫</span>
                {statusInfo.status === 'pending' ? 'Under Review' : 
                 statusInfo.status === 'ended' ? 'Campaign Ended' : 
                 statusInfo.status === 'upcoming' ? 'Coming Soon' :
                 statusInfo.status === 'inactive' ? 'Not Approved' : 'Not Available'}
              </button>
            )}
          </div>

          {/* Donation Goal Achievement Indicator */}
          {progressPercentage >= 100 && (
            <div className="goal-achieved-banner">
              🎉 Goal Achieved! Thank you to all supporters!
            </div>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <SimpleDonationModal 
          campaign={campaign}
          onClose={() => setShowDonationModal(false)}
          onSuccess={handleDonationSuccess}
        />
      )}
    </>
  );
};

export default CampaignCard;