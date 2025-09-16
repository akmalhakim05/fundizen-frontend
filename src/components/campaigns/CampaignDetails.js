import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { campaignService } from '../../services/campaignService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import SimpleDonationModal from './DonationModal';
import ShareModal from './ShareModal';
import '../../styles/components/CampaignDetails.css';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [donateLoading, setDonateLoading] = useState(false);

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await campaignService.getCampaignById(id);
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      setError('Failed to load campaign details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (!campaign?.goalAmount || campaign.goalAmount === 0) return 0;
    return Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100);
  };

  const getDaysRemaining = () => {
    if (!campaign?.endDate) return 0;
    const endDate = new Date(campaign.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusInfo = () => {
    if (!campaign) return { status: 'unknown', label: 'Unknown', color: '#6c757d' };
    
    // Check verification status
    if (!campaign.verified) {
      return { status: 'pending', label: 'UNDER REVIEW', color: '#ffc107' };
    }
    
    // Check campaign status - YOUR BACKEND USES 'status' FIELD, NOT 'isActive'
    // Backend statuses: "pending", "approved", "rejected"
    if (campaign.status !== 'approved') {
      return { status: 'inactive', label: 'NOT APPROVED', color: '#6c757d' };
    }
    
    // Check if campaign has ended
    const daysRemaining = getDaysRemaining();
    if (daysRemaining <= 0) {
      return { status: 'ended', label: 'CAMPAIGN ENDED', color: '#dc3545' };
    }
    
    // Check if campaign hasn't started yet
    const today = new Date();
    const startDate = new Date(campaign.startDate);
    if (startDate > today) {
      return { status: 'upcoming', label: 'COMING SOON', color: '#17a2b8' };
    }
    
    // Campaign is active and can receive donations
    const progressPercentage = getProgressPercentage();
    if (progressPercentage >= 100) {
      return { status: 'funded', label: 'FULLY FUNDED', color: '#28a745' };
    }
    
    return { status: 'active', label: 'ACTIVE', color: '#28a745' };
  };

  const handleDonate = async () => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          message: 'Please login to donate to this campaign.',
          returnUrl: `/campaign/${id}`
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
    
    setDonateLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      setDonateLoading(false);
      setShowDonationModal(true);
    }, 300);
  };

  const handleDonationSuccess = (result) => {
    console.log('Donation successful:', result);
    setShowDonationModal(false);
    // Refresh campaign data
    fetchCampaignDetails();
  };

  const canDonate = () => {
    const statusInfo = getStatusInfo();
    return statusInfo.status === 'active' || statusInfo.status === 'funded';
  };

  const isCreator = () => {
    return currentUser && campaign && (currentUser.id === campaign.creatorId || currentUser._id === campaign.creatorId);
  };

  const getUrgencyLevel = () => {
    const daysRemaining = getDaysRemaining();
    const progressPercentage = getProgressPercentage();
    
    if (daysRemaining <= 3 && progressPercentage < 100) return 'critical';
    if (daysRemaining <= 7 && progressPercentage < 80) return 'high';
    if (daysRemaining <= 14 && progressPercentage < 50) return 'medium';
    return 'normal';
  };

  const getUrgencyMessage = () => {
    const urgency = getUrgencyLevel();
    const daysRemaining = getDaysRemaining();
    
    switch (urgency) {
      case 'critical':
        return `🚨 Critical: Only ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left!`;
      case 'high':
        return `⚡ Urgent: ${daysRemaining} days remaining`;
      case 'medium':
        return `⏰ ${daysRemaining} days left to reach the goal`;
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading campaign details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchCampaignDetails} />;
  }

  if (!campaign) {
    return (
      <div className="campaign-not-found">
        <h2>Campaign Not Found</h2>
        <p>The campaign you're looking for doesn't exist or has been removed.</p>
        <Link to="/campaigns" className="btn btn-primary">
          Browse Other Campaigns
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const progressPercentage = getProgressPercentage();
  const daysRemaining = getDaysRemaining();
  const urgencyMessage = getUrgencyMessage();

  return (
    <div className="campaign-details-enhanced">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-container">
        <div className="container">
          <nav className="breadcrumb-nav">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/campaigns">Campaigns</Link>
            <span>/</span>
            <span>{campaign.name}</span>
          </nav>
        </div>
      </div>

      {/* Urgency Banner */}
      {urgencyMessage && canDonate() && !isCreator() && (
        <div className={`urgency-banner urgency-${getUrgencyLevel()}`}>
          <div className="container">
            <div className="urgency-content">
              <span className="urgency-message">{urgencyMessage}</span>
              <button 
                className="urgency-donate-btn"
                onClick={handleDonate}
                disabled={donateLoading}
              >
                {donateLoading ? 'Loading...' : 'Donate Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="campaign-content-wrapper">
        <div className="container">
          <div className="campaign-layout-enhanced">
            {/* Left Column - Campaign Info */}
            <div className="campaign-main-enhanced">
              {/* Status Badge */}
              <div 
                className="status-badge-large"
                style={{ backgroundColor: statusInfo.color }}
              >
                {statusInfo.label}
              </div>

              {/* Campaign Image */}
              <div className="campaign-image-large">
                {campaign.imageUrl ? (
                  <img 
                    src={campaign.imageUrl} 
                    alt={campaign.name}
                    className="main-campaign-image"
                  />
                ) : (
                  <div className="campaign-placeholder-large">
                    <div className="placeholder-content">
                      <div className="help-text">HELP!</div>
                      <span className="no-image-text">No Image</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign Info */}
              <div className="campaign-info-enhanced">
                <div className="category-badge-large">
                  {campaign.category?.toUpperCase() || 'GENERAL'}
                </div>
                
                <h1 className="campaign-title-large">{campaign.name}</h1>
                
                <div className="creator-section-enhanced">
                  <div className="creator-avatar-large">
                    {(campaign.creatorUsername || 'A')[0].toUpperCase()}
                  </div>
                  <div className="creator-details-enhanced">
                    <span className="created-by-label">CREATED BY</span>
                    <span className="creator-name-large">{campaign.creatorUsername || 'Anonymous'}</span>
                  </div>
                </div>

                <div className="creation-date">
                  Created on {formatDate(campaign.createdAt)}
                </div>

                {/* Tabs */}
                <div className="campaign-tabs-enhanced">
                  <button 
                    className={`tab-btn-enhanced ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    Description
                  </button>
                  <button 
                    className={`tab-btn-enhanced ${activeTab === 'updates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('updates')}
                  >
                    Updates
                  </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content-enhanced">
                  {activeTab === 'description' && (
                    <div className="description-content-enhanced">
                      <p>{campaign.description}</p>
                    </div>
                  )}

                  {activeTab === 'updates' && (
                    <div className="updates-content-enhanced">
                      <div className="no-updates-enhanced">
                        <p>No updates yet. Check back later for news from the campaign creator.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Funding Info */}
            <div className="funding-sidebar-enhanced">
              <div className="funding-card-enhanced">
                {/* Funding Stats */}
                <div className="funding-stats-enhanced">
                  <div className="raised-section">
                    <div className="amount-raised-large">
                      {formatCurrency(campaign.raisedAmount)}
                    </div>
                    <div className="raised-label-large">RAISED</div>
                  </div>
                  
                  <div className="goal-section">
                    <div className="goal-amount-text">
                      of {formatCurrency(campaign.goalAmount)} goal
                    </div>
                    <div className="funding-percentage">
                      {progressPercentage.toFixed(1)}% funded
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-container-enhanced">
                  <div className="progress-bar-large">
                    <div 
                      className="progress-fill-large"
                      style={{ 
                        width: `${progressPercentage}%`,
                        backgroundColor: statusInfo.color
                      }}
                    />
                  </div>
                </div>

                {/* Campaign Stats */}
                <div className="campaign-stats-enhanced">
                  <div className="stat-row-enhanced">
                    <div className="stat-icon-enhanced">📅</div>
                    <div className="stat-info-enhanced">
                      <div className="stat-label-enhanced">CAMPAIGN PERIOD</div>
                      <div className="stat-value-enhanced">
                        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-row-enhanced">
                    <div className="stat-icon-enhanced">⏰</div>
                    <div className="stat-info-enhanced">
                      <div className="stat-label-enhanced">TIME REMAINING</div>
                      <div className="stat-value-enhanced">
                        {daysRemaining} days left
                      </div>
                    </div>
                  </div>

                  <div className="stat-row-enhanced">
                    <div className="stat-icon-enhanced">👥</div>
                    <div className="stat-info-enhanced">
                      <div className="stat-label-enhanced">SUPPORTERS</div>
                      <div className="stat-value-enhanced">
                        {campaign.supporters || 0} people
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-section-enhanced">
                  {canDonate() && !isCreator() && (
                    <div className="donate-section-enhanced">
                      <button 
                        className={`btn-donate-large-enhanced ${donateLoading ? 'loading' : ''} ${getUrgencyLevel()}`}
                        onClick={handleDonate}
                        disabled={donateLoading}
                      >
                        {donateLoading ? (
                          <>
                            <span className="loading-spinner"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            💝 Donate Now
                          </>
                        )}
                      </button>
                      
                      {progressPercentage >= 100 && (
                        <div className="goal-achieved-message">
                          🎉 Goal achieved! Your support still helps!
                        </div>
                      )}
                      
                      {urgencyMessage && (
                        <div className="donation-urgency-text">
                          {urgencyMessage}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {isCreator() && (
                    <div className="creator-actions">
                      <div className="creator-badge">
                        👤 You are the creator
                      </div>
                      <button className="btn-manage-campaign">
                        Manage Campaign
                      </button>
                    </div>
                  )}
                  
                  <div className="social-actions-enhanced">
                    <button 
                      className="social-btn-enhanced"
                      onClick={() => setShowShareModal(true)}
                    >
                      📱 Share
                    </button>
                    <button className="social-btn-enhanced">
                      ❤️ Save
                    </button>
                    <button className="social-btn-enhanced">
                      🚩 Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Similar Campaigns */}
              <div className="similar-campaigns-enhanced">
                <h3>Similar Campaigns</h3>
                <div className="no-similar-enhanced">
                  <p>No similar campaigns found.</p>
                  <Link to="/campaigns" className="browse-all-btn">
                    Browse All Campaigns
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDonationModal && (
        <SimpleDonationModal 
          campaign={campaign}
          onClose={() => setShowDonationModal(false)}
          onSuccess={handleDonationSuccess}
        />
      )}

      {showShareModal && (
        <ShareModal 
          campaign={campaign}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default CampaignDetails;