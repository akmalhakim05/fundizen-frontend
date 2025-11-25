// src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/adminService';
import LoadingSpinner from '../common/LoadingSpinner';
import AdminOverview from './admin/tabs/AdminOverview';
import AdminPendingApprovals from './admin/tabs/AdminPendingApprovals';
import AdminCampaignManagement from './admin/tabs/AdminCampaignManagement';
import AdminDonationManagement from './admin/tabs/AdminDonationManagement';
import AdminFoodBankManagement from './admin/tabs/AdminFoodBankManagement';
import AdminUserManagement from './admin/tabs/AdminUserManagement';
import {
  LayoutDashboard, FileText, Users, BarChart3, LogOut,
  Bell, Search, Menu, X, Shield, DollarSign, ChevronRight,
  Package
} from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const isAdmin = userData?.role === 'admin' || userData?.isAdmin;

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/pending')) setActiveTab('pending');
    else if (path.includes('/campaigns')) setActiveTab('campaigns');
    else if (path.includes('/donations')) setActiveTab('donations');
    else if (path.includes('/foodbank')) setActiveTab('foodbank');
    else if (path.includes('/users')) setActiveTab('users');
    else setActiveTab('overview');
  }, [location]);

  useEffect(() => {
    if (isAdmin) fetchDashboardData();
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleNavClick = (id, path) => {
    navigate(path);
    setActiveTab(id);
    setSidebarOpen(false);
  };

  // All items now under "Main Menu"
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { id: 'pending', label: 'Pending Approvals', icon: FileText, path: '/admin/pending', badge: dashboardData?.pendingCount },
    { id: 'campaigns', label: 'Campaigns', icon: BarChart3, path: '/admin/campaigns' },
    { id: 'donations', label: 'Donations', icon: DollarSign, path: '/admin/donations' },
    { id: 'foodbank', label: 'Food Bank', icon: Package, path: '/admin/foodbank' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  ];

  const getPageTitle = () => {
    const current = navItems.find(item => item.id === activeTab);
    return current?.label || 'Dashboard';
  };

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <div className="denied-card">
          <div className="denied-icon-wrapper">
            <Shield size={48} />
          </div>
          <h2>Access Denied</h2>
          <p>You do not have administrator privileges to access this area.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Return to Home
          </button>
        </div>
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Outfit:wght@400;500;600;700;800&display=swap');
          
          .access-denied {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #F8FAFC;
            font-family: 'DM Sans', sans-serif;
          }
          .denied-card {
            text-align: center;
            padding: 56px 48px;
            background: #FFFFFF;
            border-radius: 16px;
            border: 1px solid #E5E7EB;
            max-width: 420px;
          }
          .denied-icon-wrapper {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #EF4444;
          }
          .denied-card h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.75rem;
            font-weight: 700;
            color: #111827;
            margin: 0 0 12px 0;
          }
          .denied-card p {
            font-size: 1rem;
            color: #6B7280;
            margin: 0 0 24px 0;
            line-height: 1.6;
          }
          .back-btn {
            padding: 12px 24px;
            background: #2563EB;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.938rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .back-btn:hover {
            background: #1D4ED8;
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Initializing dashboard..." />;

  return (
    <div className="admin-dashboard">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <span>F</span>
          </div>
          <div className="brand-text">
            <h1>Fundizen</h1>
            <span className="brand-tag">Admin Portal</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="mobile-close">
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Main Menu</span>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.path)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <div className="nav-item-icon">
                  <item.icon size={20} />
                </div>
                <span className="nav-item-label">{item.label}</span>
                {item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {activeTab === item.id && <ChevronRight size={16} className="nav-arrow" />}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="profile-avatar">
              {userData?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="profile-info">
              <span className="profile-name">{userData?.username || 'Admin'}</span>
              <span className="profile-role">Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button onClick={() => setSidebarOpen(true)} className="menu-toggle">
              <Menu size={22} />
            </button>
            <div className="header-breadcrumb">
              <span className="breadcrumb-base">Dashboard</span>
              <ChevronRight size={14} className="breadcrumb-sep" />
              <span className="breadcrumb-current">{getPageTitle()}</span>
            </div>
          </div>

          <div className={`header-search ${searchFocused ? 'focused' : ''}`}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search campaigns, users, donations..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="search-shortcut">⌘K</kbd>
          </div>

          <div className="header-right">
            <button className="header-action notification-btn">
              <Bell size={20} />
              {dashboardData?.pendingCount > 0 && (
                <span className="notification-indicator" />
              )}
            </button>

            <div className="header-divider" />

            <div className="header-user">
              <div className="user-meta">
                <span className="user-greeting">Welcome back,</span>
                <span className="user-name">{userData?.username || 'Admin'}</span>
              </div>
              <div className="user-avatar">
                {userData?.username?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {activeTab === 'overview' && <AdminOverview data={dashboardData} />}
          {activeTab === 'pending' && <AdminPendingApprovals />}
          {activeTab === 'campaigns' && <AdminCampaignManagement />}
          {activeTab === 'donations' && <AdminDonationManagement />}
          {activeTab === 'foodbank' && <AdminFoodBankManagement />}
          {activeTab === 'users' && <AdminUserManagement />}
        </main>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Outfit:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        .admin-dashboard {
          font-family: 'DM Sans', sans-serif;
          background: #F8FAFC;
          min-height: 100vh;
          color: #111827;
          display: flex;
        }

        /* ========== SIDEBAR ========== */
        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 272px;
          height: 100vh;
          background: #FFFFFF;
          border-right: 1px solid #E5E7EB;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .admin-sidebar.open {
          transform: translateX(0);
        }

        @media (min-width: 1025px) {
          .admin-sidebar {
            transform: translateX(0);
          }
        }

        .sidebar-brand {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 1px solid #F3F4F6;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .brand-text h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
          line-height: 1.2;
        }

        .brand-tag {
          font-size: 0.75rem;
          color: #6B7280;
          font-weight: 500;
        }

        .mobile-close {
          display: none;
          margin-left: auto;
          padding: 8px;
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          border-radius: 8px;
        }

        .mobile-close:hover {
          background: #F3F4F6;
        }

        @media (max-width: 1024px) {
          .mobile-close {
            display: flex;
          }
        }

        /* Sidebar Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 20px 16px;
          overflow-y: auto;
        }

        .nav-section {
          margin-bottom: 28px;
        }

        .nav-section-title {
          display: block;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9CA3AF;
          padding: 0 12px;
          margin-bottom: 12px;
        }

        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          margin-bottom: 4px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .nav-item:hover {
          background: #F8FAFC;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
        }

        .nav-item-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #F3F4F6;
          color: #6B7280;
          transition: all 0.2s ease;
        }

        .nav-item.active .nav-item-icon {
          background: #2563EB;
          color: white;
        }

        .nav-item-label {
          flex: 1;
          font-size: 0.938rem;
          font-weight: 500;
          color: #374151;
        }

        .nav-item.active .nav-item-label {
          color: #1E40AF;
          font-weight: 600;
        }

        .nav-badge {
          background: #EF4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          min-width: 24px;
          text-align: center;
        }

        .nav-arrow {
          color: #2563EB;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .nav-item.active .nav-arrow {
          opacity: 1;
        }

        /* Sidebar Footer */
        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #F3F4F6;
          background: #FAFAFA;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
        }

        .profile-name {
          font-size: 0.938rem;
          font-weight: 600;
          color: #111827;
        }

        .profile-role {
          font-size: 0.813rem;
          color: #6B7280;
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          color: #DC2626;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #FEE2E2;
          border-color: #FCA5A5;
        }

        /* ========== MAIN CONTENT ========== */
        .admin-main {
          flex: 1;
          min-height: 100vh;
          margin-left: 0;
          transition: margin-left 0.3s ease;
        }

        @media (min-width: 1025px) {
          .admin-main {
            margin-left: 272px;
          }
        }

        /* ========== HEADER ========== */
        .admin-header {
          position: sticky;
          top: 0;
          height: 72px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 100;
          gap: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .menu-toggle {
          display: none;
          padding: 10px;
          background: #F8FAFC;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .menu-toggle:hover {
          background: #F3F4F6;
        }

        @media (max-width: 1024px) {
          .menu-toggle {
            display: flex;
          }
        }

        .header-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breadcrumb-base {
          font-size: 0.875rem;
          color: #9CA3AF;
          font-weight: 500;
        }

        .breadcrumb-sep {
          color: #D1D5DB;
        }

        .breadcrumb-current {
          font-size: 0.875rem;
          color: #111827;
          font-weight: 600;
        }

        /* Search */
        .header-search {
          flex: 1;
          max-width: 480px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .header-search input {
          width: 100%;
          height: 44px;
          padding: 0 48px 0 44px;
          background: #F8FAFC;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          font-size: 0.938rem;
          color: #111827;
          transition: all 0.2s ease;
        }

        .header-search input::placeholder {
          color: #9CA3AF;
        }

        .header-search input:focus {
          outline: none;
          background: #FFFFFF;
          border-color: #2563EB;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .header-search.focused input {
          background: #FFFFFF;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: #9CA3AF;
          pointer-events: none;
        }

        .search-shortcut {
          position: absolute;
          right: 12px;
          padding: 4px 8px;
          background: #E5E7EB;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6B7280;
          border: none;
          font-family: inherit;
        }

        /* Header Right */
        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-action {
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8FAFC;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-action:hover {
          background: #F3F4F6;
          color: #374151;
        }

        .notification-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 10px;
          height: 10px;
          background: #EF4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        .header-divider {
          width: 1px;
          height: 32px;
          background: #E5E7EB;
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-greeting {
          font-size: 0.75rem;
          color: #9CA3AF;
        }

        .user-name {
          font-size: 0.938rem;
          font-weight: 600;
          color: #111827;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
        }

        /* ========== CONTENT AREA ========== */
        .admin-content {
          padding: 32px;
          min-height: calc(100vh - 72px);
        }

        /* ========== OVERLAY ========== */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(17, 24, 39, 0.5);
          z-index: 999;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 768px) {
          .admin-header {
            padding: 0 20px;
            height: 64px;
          }

          .header-search {
            display: none;
          }

          .user-meta {
            display: none;
          }

          .admin-content {
            padding: 20px;
          }

          .header-breadcrumb {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .header-divider {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;