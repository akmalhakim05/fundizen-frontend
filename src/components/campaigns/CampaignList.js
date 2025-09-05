import React, { useState, useEffect, useRef } from 'react';
import CampaignCard from './CampaignCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { campaignService } from '../../services/campaignService';
import '../../styles/components/Campaign.css';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref to track if we've already fetched data
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls in React Strict Mode
    if (hasFetched.current) return;
    
    fetchCampaigns();
    hasFetched.current = true;
  }, []);

  const fetchCampaigns = async () => {
    try {
      console.log('CampaignList: Fetching campaigns...');
      setLoading(true);
      setError('');
      
      const data = await campaignService.getPublicCampaigns();
      
      console.log('CampaignList: Received campaigns:', data);
      setCampaigns(data || []);
      
    } catch (error) {
      console.error('CampaignList: Error fetching campaigns:', error);
      setError('Failed to load campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && campaign.isActive) ||
                         (filter.startsWith('category-') && campaign.category === filter.substring(9));
    
    return matchesSearch && matchesFilter;
  });

  const categories = [...new Set(campaigns.map(campaign => campaign.category).filter(Boolean))];

  const handleRetry = () => {
    hasFetched.current = false;
    fetchCampaigns();
  };

  if (loading) {
    return (
      <div className="campaign-list-container">
        <LoadingSpinner message="Loading campaigns..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="campaign-list-container">
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="campaign-list-container">
      <div className="campaign-list-header">
        <h2>Public Campaigns</h2>
        <p>Support amazing projects and make a difference</p>
      </div>
      
      <div className="campaign-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Campaigns
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active Only
          </button>
        </div>
        
        {categories.length > 0 && (
          <div className="category-filter">
            <select 
              value={filter.startsWith('category-') ? filter : 'all'} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={`category-${category}`}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="campaign-stats">
        <div className="stat-item">
          <span className="stat-number">{filteredCampaigns.length}</span>
          <span className="stat-label">Campaigns Found</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {filteredCampaigns.filter(c => c.isActive).length}
          </span>
          <span className="stat-label">Active Campaigns</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {new Intl.NumberFormat('en-MY', {
              style: 'currency',
              currency: 'MYR',
              minimumFractionDigits: 0
            }).format(
              filteredCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0)
            )}
          </span>
          <span className="stat-label">Total Raised</span>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="no-campaigns">
          <h3>
            {campaigns.length === 0 
              ? 'No campaigns available' 
              : 'No campaigns found'
            }
          </h3>
          <p>
            {campaigns.length === 0 
              ? 'Be the first to create a campaign and make a difference!'
              : searchTerm 
                ? `No campaigns match "${searchTerm}". Try adjusting your search.`
                : 'No campaigns match the selected filters.'
            }
          </p>
          {campaigns.length === 0 && (
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/create-campaign'}
              style={{ marginTop: '20px' }}
            >
              Create First Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="campaigns-grid">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;