import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DonationModal from './DonationModal';
import '../../styles/components/Campaign.css';

const CampaignCard = ({ campaign }) => {
  const [showQuickDonate, setShowQuickDonate] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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
    if (!campaign.verified) {
      return { status: 'pending', label: 'UNDER REVIEW', color: '#ffc107', canDonate: false };
    }
    
    if (!campaign.isActive) {
      return { status: 'inactive', label: 'INACTIVE', color: '#6c757d', canDonate: false };
    }
    
    const daysRemaining = getDaysRemaining();
    if (daysRemaining <= 0) {
      return { status: 'ended', label: 'CAMPAIGN ENDED', color: '#dc3545', canDonate: false };
    }
    
    return { status: 'active', label: 'ACTIVE', color: '#28a745', canDonate: true };
  };

  const canReceiveDonations = () => {
    return campaign.verified && campaign.isActive && getDaysRemaining() > 0;
  };

  const handleDonate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          message: 'Please login to donate to this campaign.',
          returnUrl: `/campaign/${campaign.id}`
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

  const handleQuickDonate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickDonate(true);
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
        <Link to={`/campaign/${campaign.id}`} className="campaign-image-link">
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
          <Link to={`/campaign/${campaign.id}`} className="campaign-title-link">
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
              to={`/campaign/${campaign.id}`} 
              className="btn-view-modern"
            >
              <span className="btn-icon-modern">👁</span>
              View Details
            </Link>
            
            {canReceiveDonations() ? (
              <div className="donate-buttons-container">
                <button
                  className="btn-donate-modern"
                  onClick={handleDonate}
                  title="Donate to this campaign"
                >
                  <span className="btn-icon-modern">💝</span>
                  Donate Now
                </button>
                <button
                  className="btn-quick-donate"
                  onClick={handleQuickDonate}
                  title="Quick donate amounts"
                >
                  ⚡
                </button>
              </div>
            ) : (
              <button className="btn-disabled-modern" disabled>
                <span className="btn-icon-modern">🚫</span>
                {statusInfo.status === 'pending' ? 'Under Review' : 
                 statusInfo.status === 'ended' ? 'Campaign Ended' : 'Not Available'}
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

      {/* Full Donation Modal */}
      {showDonationModal && (
        <DonationModal 
          campaign={campaign}
          onClose={() => setShowDonationModal(false)}
          onSuccess={(donation) => {
            setShowDonationModal(false);
            // You can add success handling here
            console.log('Donation successful:', donation);
          }}
        />
      )}

      {/* Quick Donate Modal */}
      {showQuickDonate && (
        <div className="quick-donate-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowQuickDonate(false);
        }}>
          <div className="quick-donate-modal">
            <div className="modal-header">
              <h3>Quick Donate to "{campaign.name}"</h3>
              <button 
                className="close-btn"
                onClick={() => setShowQuickDonate(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="quick-amounts">
                <h4>Choose Amount</h4>
                <div className="amount-buttons">
                  {[25, 50, 100, 250, 500].map(amount => (
                    <button 
                      key={amount} 
                      className="amount-btn"
                      onClick={() => {
                        setShowQuickDonate(false);
                        setShowDonationModal(true);
                      }}
                    >
                      RM {amount}
                    </button>
                  ))}
                </div>
                
                <div className="custom-amount">
                  <span className="currency-symbol">RM</span>
                  <input 
                    type="number" 
                    placeholder="Enter amount"
                    className="amount-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value > 0) {
                        setShowQuickDonate(false);
                        setShowDonationModal(true);
                      }
                    }}
                  />
                </div>
                
                <button 
                  className="btn-proceed"
                  onClick={() => {
                    setShowQuickDonate(false);
                    setShowDonationModal(true);
                  }}
                >
                  Proceed to Donate
                </button>

                <div className="campaign-quick-info">
                  <div className="quick-info-item">
                    <strong>Goal:</strong> {formatCurrency(campaign.goalAmount)}
                  </div>
                  <div className="quick-info-item">
                    <strong>Raised:</strong> {formatCurrency(campaign.raisedAmount)}
                  </div>
                  <div className="quick-info-item">
                    <strong>Days Left:</strong> {daysRemaining} days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CampaignCard;