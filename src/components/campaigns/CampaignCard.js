import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/Campaign.css';

const CampaignCard = ({ campaign }) => {
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

  const getStatusBadge = () => {
    if (!campaign.verified) return 'pending';
    if (!campaign.isActive) return 'inactive';
    
    const daysRemaining = getDaysRemaining();
    if (daysRemaining <= 0) return 'expired';
    
    return 'active';
  };

  const getStatusLabel = () => {
    const status = getStatusBadge();
    switch (status) {
      case 'pending': return 'Under Review';
      case 'active': return 'Active';
      case 'expired': return 'Ended';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const canReceiveDonations = () => {
    return campaign.verified && campaign.isActive && getDaysRemaining() > 0;
  };

  return (
    <div className="campaign-card">
      <Link to={`/campaign/${campaign.id}`} className="campaign-image-link">
        <div className="campaign-image">
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
          <div className="no-image" style={{ display: campaign.imageUrl ? 'none' : 'flex' }}>
            <span>📋</span>
            <span>No Image</span>
          </div>
          <div className={`status-badge ${getStatusBadge()}`}>
            {getStatusLabel()}
          </div>
        </div>
      </Link>
      
      <div className="campaign-content">
        <div className="campaign-header">
          <Link to={`/campaign/${campaign.id}`} className="campaign-title-link">
            <h3 className="campaign-title">{campaign.name}</h3>
          </Link>
          <span className="campaign-category">{campaign.category}</span>
        </div>
        
        <p className="campaign-description">
          {campaign.description?.length > 120
            ? `${campaign.description.substring(0, 120)}...`
            : campaign.description
          }
        </p>

        <div className="campaign-creator">
          <span className="creator-label">by</span>
          <span className="creator-name">{campaign.creatorUsername || 'Anonymous'}</span>
        </div>
        
        <div className="campaign-stats">
          <div className="funding-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="progress-stats">
              <span className="raised">{formatCurrency(campaign.raisedAmount)}</span>
              <span className="goal">of {formatCurrency(campaign.goalAmount)}</span>
              <span className="percentage">{getProgressPercentage().toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="campaign-meta">
            <div className="meta-item">
              <span className="label">Days Left:</span>
              <span className="value">
                {getDaysRemaining() > 0 ? `${getDaysRemaining()} days` : 'Ended'}
              </span>
            </div>
            <div className="meta-item">
              <span className="label">End Date:</span>
              <span className="value">{formatDate(campaign.endDate)}</span>
            </div>
          </div>
        </div>
        
        <div className="campaign-actions">
          <Link 
            to={`/campaign/${campaign.id}`} 
            className="btn btn-primary"
          >
            👁️ View Details
          </Link>
          {canReceiveDonations() && (
            <Link 
              to={`/campaign/${campaign.id}?action=donate`}
              className="btn btn-secondary"
            >
              💝 Support Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;