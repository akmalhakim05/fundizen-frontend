import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../../styles/components/Layout.css';

const Header = () => {
  const { currentUser, userData, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <i class="fas fa-dollar-sign"></i>
          <span className="logo-text">Fundizen</span>
        </Link>

        {/* Navigation */}
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/campaigns" className="nav-link">Browse Campaigns</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>

        {/* User Section */}
        <div className="header-actions">
          {currentUser ? (
            <div className="user-menu">
              <button className="user-button" onClick={toggleMenu}>
                <div className="user-avatar">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" />
                  ) : (
                    <span>
                      {(userData?.username || currentUser.email || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="user-name">
                  {userData?.username || currentUser.displayName || 'User'}
                </span>
                {isAdmin && <span className="admin-indicator"><i class="fas fa-crown"></i></span>}
                <span className="dropdown-arrow">▼</span>
              </button>

              {isMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/dashboard" className="dropdown-item">
                    <span className="dropdown-icon">🏠</span>
                    Dashboard
                  </Link>
                  <Link to="/create-campaign" className="dropdown-item">
                    <span className="dropdown-icon">➕</span>
                    Create Campaign
                  </Link>
                  <Link to="/my-campaigns" className="dropdown-item">
                    <span className="dropdown-icon">📋</span>
                    My Campaigns
                  </Link>
                  
                  {/* Admin Section - Only Campaign Management */}
                  {isAdmin && (
                    <>
                      <hr className="dropdown-divider" />
                      <div className="dropdown-section-title">
                        <span className="dropdown-icon">👑</span>
                        Admin Panel
                      </div>
                      <Link to="/admin" className="dropdown-item admin-item">
                        <span className="dropdown-icon">📊</span>
                        Admin Dashboard
                      </Link>
                      <Link to="/admin/campaigns" className="dropdown-item admin-item">
                        <span className="dropdown-icon">📋</span>
                        Manage Campaigns
                      </Link>
                    </>
                  )}
                  
                  <hr className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item">
                    <span className="dropdown-icon">👤</span>
                    Profile Settings
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="mobile-menu-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-nav">
          <Link to="/" className="mobile-nav-link">Home</Link>
          <Link to="/campaigns" className="mobile-nav-link">Browse Campaigns</Link>
          <Link to="/about" className="mobile-nav-link">About</Link>
          <Link to="/contact" className="mobile-nav-link">Contact</Link>
          
          {currentUser ? (
            <>
              <hr className="mobile-nav-divider" />
              <Link to="/dashboard" className="mobile-nav-link">Dashboard</Link>
              <Link to="/create-campaign" className="mobile-nav-link">Create Campaign</Link>
              
              {/* Admin links for mobile - Only Campaign Management */}
              {isAdmin && (
                <>
                  <hr className="mobile-nav-divider" />
                  <div className="mobile-nav-section-title">👑 Admin Panel</div>
                  <Link to="/admin" className="mobile-nav-link admin-link">Admin Dashboard</Link>
                  <Link to="/admin/campaigns" className="mobile-nav-link admin-link">Manage Campaigns</Link>
                </>
              )}
              
              <hr className="mobile-nav-divider" />
              <Link to="/profile" className="mobile-nav-link">Profile</Link>
              <button onClick={handleLogout} className="mobile-nav-link logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <hr className="mobile-nav-divider" />
              <Link to="/login" className="mobile-nav-link">Login</Link>
              <Link to="/register" className="mobile-nav-link">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;