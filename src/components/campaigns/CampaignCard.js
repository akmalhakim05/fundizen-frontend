import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';
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

  const getStatusBadge = () => {
    if (!campaign.verified) return 'pending';
    if (campaign.isActive) return 'active';
    if (new Date(campaign.endDate) < new Date()) return 'expired';
    return 'inactive';
  };

  return (
    <div className="campaign-card">
      <div className="campaign-image">
        {campaign.imageUrl ? (
          <OptimizedImage
            src={campaign.imageUrl}
            alt={campaign.name}
            width={350}
            height={200}
            crop="fill"
            fallback={
              <div className="no-image">
                <span>No Image</span>
              </div>
            }
          />
        ) : (
          <div className="no-image">
            <span>No Image</span>
          </div>
        )}
        <div className={`status-badge ${getStatusBadge()}`}>
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="campaign-content">
        <div className="campaign-header">
          <h3 className="campaign-title">{campaign.name}</h3>
          <span className="campaign-category">{campaign.category}</span>
        </div>
        
        <p className="campaign-description">
          {campaign.description?.length > 120
            ? `${campaign.description.substring(0, 120)}...`
            : campaign.description
          }
        </p>
        
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
                {campaign.daysRemaining > 0 ? `${campaign.daysRemaining} days` : 'Ended'}
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
            View Details
          </Link>
          {campaign.canReceiveDonations && (
            <button className="btn btn-secondary">
              Donate Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;