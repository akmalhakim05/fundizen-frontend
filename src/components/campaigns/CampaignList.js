import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getPublicCampaigns();
      setCampaigns(data);
      setError('');
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && campaign.isActive) ||
                         (filter === 'category' && campaign.category === filter);
    
    return matchesSearch && matchesFilter;
  });

  const categories = [...new Set(campaigns.map(campaign => campaign.category))];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchCampaigns} />;
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
          <h3>No campaigns found</h3>
          <p>
            {searchTerm 
              ? `No campaigns match "${searchTerm}". Try adjusting your search.`
              : 'No campaigns available at the moment. Check back later!'
            }
          </p>
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