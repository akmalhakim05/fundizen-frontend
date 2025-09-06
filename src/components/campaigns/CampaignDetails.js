import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { campaignService } from '../../services/campaignService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import DonationModal from './DonationModal';
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
    
    const daysRemaining = getDaysRemaining();
    
    if (!campaign.verified) {
      return { status: 'pending', label: 'Pending Review', color: '#ffc107' };
    }
    
    if (!campaign.isActive) {
      return { status: 'inactive', label: 'Inactive', color: '#6c757d' };
    }
    
    if (daysRemaining <= 0) {
      return { status: 'ended', label: 'Campaign Ended', color: '#dc3545' };
    }
    
    const progressPercentage = getProgressPercentage();
    if (progressPercentage >= 100) {
      return { status: 'funded', label: 'Fully Funded', color: '#28a745' };
    }
    
    return { status: 'active', label: 'Active', color: '#28a745' };
  };

  const handleDonate = () => {
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
    
    setShowDonationModal(true);
  };

  const canDonate = () => {
    const statusInfo = getStatusInfo();
    return statusInfo.status === 'active' || statusInfo.status === 'funded';
  };

  const isCreator = () => {
    return currentUser && campaign && currentUser.id === campaign.creatorId;
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

  return (
    <div className="campaign-details-container">
      {/* Campaign Header */}
      <div className="campaign-header-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/campaigns">Campaigns</Link>
            <span>/</span>
            <span>{campaign.name}</span>
          </div>
          
          <div className="campaign-status-badge" style={{ backgroundColor: statusInfo.color }}>
            {statusInfo.label}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="campaign-content">
        <div className="container">
          <div className="campaign-layout">
            {/* Left Column - Campaign Info */}
            <div className="campaign-main">
              <div className="campaign-image-container">
                {campaign.imageUrl ? (
                  <img 
                    src={campaign.imageUrl} 
                    alt={campaign.name}
                    className="campaign-main-image"
                  />
                ) : (
                  <div className="campaign-placeholder-image">
                    <span className="placeholder-icon">📋</span>
                    <span>No Image Available</span>
                  </div>
                )}
              </div>

              <div className="campaign-info">
                <div className="campaign-meta">
                  <span className="category-badge">{campaign.category}</span>
                  <span className="created-date">
                    Created on {formatDate(campaign.createdAt)}
                  </span>
                </div>

                <h1 className="campaign-title">{campaign.name}</h1>
                
                <div className="creator-info">
                  <div className="creator-avatar">
                    {campaign.creatorUsername?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="creator-details">
                    <span className="creator-label">Created by</span>
                    <span className="creator-name">{campaign.creatorUsername || 'Anonymous'}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="campaign-tabs">
                  <button 
                    className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    📝 Description
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'updates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('updates')}
                  >
                    📢 Updates
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'supporters' ? 'active' : ''}`}
                    onClick={() => setActiveTab('supporters')}
                  >
                    💝 Supporters
                  </button>
                  {campaign.documentUrl && (
                    <button 
                      className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                      onClick={() => setActiveTab('documents')}
                    >
                      📄 Documents
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                  {activeTab === 'description' && (
                    <div className="description-content">
                      <h3>About This Campaign</h3>
                      <div className="description-text">
                        {campaign.description?.split('\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'updates' && (
                    <div className="updates-content">
                      <h3>Campaign Updates</h3>
                      <div className="no-updates">
                        <span className="no-updates-icon">📢</span>
                        <p>No updates yet. Check back later for news from the campaign creator.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'supporters' && (
                    <div className="supporters-content">
                      <h3>Supporters</h3>
                      <div className="no-supporters">
                        <span className="no-supporters-icon">💝</span>
                        <p>Be the first to support this campaign!</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && campaign.documentUrl && (
                    <div className="documents-content">
                      <h3>Supporting Documents</h3>
                      <div className="document-item">
                        <div className="document-info">
                          <span className="document-icon">📄</span>
                          <div className="document-details">
                            <span className="document-name">Campaign Document</span>
                            <span className="document-description">
                              Additional information and verification documents
                            </span>
                          </div>
                        </div>
                        <a 
                          href={campaign.documentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-small"
                        >
                          📥 Download
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Campaign Stats & Actions */}
            <div className="campaign-sidebar">
              <div className="funding-card">
                <div className="funding-stats">
                  <div className="raised-amount">
                    {formatCurrency(campaign.raisedAmount)}
                    <span className="raised-label">raised</span>
                  </div>
                  
                  <div className="goal-amount">
                    of {formatCurrency(campaign.goalAmount)} goal
                  </div>

                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="progress-percentage">
                      {progressPercentage.toFixed(1)}% funded
                    </span>
                  </div>

                  <div className="campaign-timeline">
                    <div className="timeline-item">
                      <span className="timeline-icon">📅</span>
                      <div className="timeline-content">
                        <span className="timeline-label">Campaign Period</span>
                        <span className="timeline-value">
                          {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="timeline-item">
                      <span className="timeline-icon">⏰</span>
                      <div className="timeline-content">
                        <span className="timeline-label">Time Remaining</span>
                        <span className="timeline-value">
                          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Campaign ended'}
                        </span>
                      </div>
                    </div>

                    <div className="timeline-item">
                      <span className="timeline-icon">👥</span>
                      <div className="timeline-content">
                        <span className="timeline-label">Supporters</span>
                        <span className="timeline-value">0 people</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  {canDonate() && !isCreator() && (
                    <button 
                      className="btn btn-primary btn-large donate-btn"
                      onClick={handleDonate}
                    >
                      💝 Support This Campaign
                    </button>
                  )}
                  
                  {isCreator() && (
                    <div className="creator-actions">
                      <Link 
                        to={`/campaign/${id}/edit`}
                        className="btn btn-outline"
                      >
                        ✏️ Edit Campaign
                      </Link>
                      <button className="btn btn-secondary">
                        📊 View Analytics
                      </button>
                    </div>
                  )}

                  <div className="social-actions">
                    <button 
                      className="btn btn-outline btn-social"
                      onClick={() => setShowShareModal(true)}
                    >
                      🔗 Share
                    </button>
                    <button className="btn btn-outline btn-social">
                      ❤️ Save
                    </button>
                    <button className="btn btn-outline btn-social">
                      📢 Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Related Campaigns */}
              <div className="related-campaigns">
                <h3>Similar Campaigns</h3>
                <div className="related-list">
                  <div className="no-related">
                    <p>No similar campaigns found.</p>
                    <Link to="/campaigns" className="btn btn-outline btn-small">
                      Browse All Campaigns
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDonationModal && (
        <DonationModal 
          campaign={campaign}
          onClose={() => setShowDonationModal(false)}
          onSuccess={(donation) => {
            setShowDonationModal(false);
            // Refresh campaign data
            fetchCampaignDetails();
          }}
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