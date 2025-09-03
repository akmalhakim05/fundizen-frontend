import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CampaignList from './campaigns/CampaignList';
import LoadingSpinner from './common/LoadingSpinner';
import '../styles/components/Dashboard.css';

const Dashboard = () => {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');

  const tabs = [
    { id: 'campaigns', label: 'Public Campaigns', icon: '🏠' },
    { id: 'create', label: 'Create Campaign', icon: '➕' },
    { id: 'profile', label: 'My Profile', icon: '👤' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'campaigns':
        return <CampaignList />;
      case 'create':
        return <CreateCampaignTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <CampaignList />;
    }
  };

  if (!currentUser) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {userData?.username || currentUser.displayName || 'User'}!</h1>
          <p>Discover amazing campaigns and make a difference today</p>
        </div>
        
        {!currentUser.emailVerified && (
          <div className="verification-alert">
            <span>⚠️ Please verify your email to access all features</span>
          </div>
        )}
      </div>

      <div className="dashboard-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Create Campaign Tab Component
const CreateCampaignTab = () => {
  return (
    <div className="create-campaign-tab">
      <h2>Create a New Campaign</h2>
      <p>Share your project with the world and raise funds for your cause.</p>
      
      <div className="create-campaign-steps">
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Plan Your Campaign</h3>
            <p>Define your goal, create compelling content, and set a realistic funding target.</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Submit for Review</h3>
            <p>Our team will review your campaign to ensure it meets our guidelines.</p>
          </div>
        </div>
        
        <div className="step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Launch & Promote</h3>
            <p>Once approved, your campaign goes live and you can start promoting it!</p>
          </div>
        </div>
      </div>
      
      <Link to="/create-campaign" className="btn btn-primary">
        Start Creating Your Campaign
      </Link>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = () => {
  const { currentUser, userData } = useAuth();
  
  return (
    <div className="profile-tab">
      <h2>My Profile</h2>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" />
            ) : (
              <div className="default-avatar">
                {(userData?.username || currentUser.email || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h3>{userData?.username || currentUser.displayName || 'User'}</h3>
            <p>{currentUser.email}</p>
            <span className={`status ${currentUser.emailVerified ? 'verified' : 'unverified'}`}>
              {currentUser.emailVerified ? '✅ Verified' : '⚠️ Unverified'}
            </span>
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Campaigns Created</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Campaigns Backed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">RM 0</span>
            <span className="stat-label">Total Contributed</span>
          </div>
        </div>
        
        <div className="profile-details">
          <h4>Account Details</h4>
          <div className="detail-item">
            <strong>Member Since:</strong> {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
          </div>
          <div className="detail-item">
            <strong>Last Login:</strong> {new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()}
          </div>
          <div className="detail-item">
            <strong>Role:</strong> {userData?.role || 'User'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;