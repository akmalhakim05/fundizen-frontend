// src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../common/LoadingSpinner';
import AdminOverview from './tabs/AdminOverview';
import AdminPendingApprovals from './tabs/AdminPendingApprovals';
import AdminCampaignManagement from './tabs/AdminCampaignManagement';
import AdminDonationManagement from './tabs/AdminDonationManagement';
import AdminUserManagement from './tabs/AdminUserManagement';
import AdminSystemStats from './tabs/AdminSystemStats';
import {
  LayoutDashboard, FileText, Users, BarChart3, LogOut,
  Bell, Search, Menu, X, Shield, DollarSign
} from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const isAdmin = userData?.role === 'admin' || userData?.isAdmin;

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/pending')) setActiveTab('pending');
    else if (path.includes('/campaigns')) setActiveTab('campaigns');
    else if (path.includes('/donations')) setActiveTab('donations');
    else if (path.includes('/users')) setActiveTab('users');
    else if (path.includes('/analytics')) setActiveTab('analytics');
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
    setSidebarOpen(false); // Auto-close on mobile
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { id: 'pending', label: 'Pending Approvals', icon: FileText, path: '/admin/pending', badge: dashboardData?.pendingCount },
    { id: 'campaigns', label: 'Campaigns', icon: BarChart3, path: '/admin/campaigns' },
    { id: 'donations', label: 'Donations', icon: DollarSign, path: '/admin/donations' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  ];

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <div className="denied-card">
          <Shield size={80} className="denied-icon" />
          <h2>Access Denied</h2>
          <p>You do not have administrator privileges to access this area.</p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Initializing dashboard..." />;

  return (
    <div className="admin-dashboard">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">F</div>
            <h1>Fundizen Admin</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="mobile-close-btn">
            <X size={28} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id, item.path)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Fixed Top Header */}
        <header className="admin-header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn">
                <Menu size={28} />
              </button>
              <div className="search-container">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search campaigns, users, transactions..."
                  className="search-input"
                />
              </div>
            </div>

            <div className="header-right">
              <button className="notification-btn">
                <Bell size={24} />
                {dashboardData?.pendingCount > 0 && <span className="notification-dot" />}
              </button>

              <div className="user-profile">
                <div className="user-info">
                  <h3>{userData?.username || 'Admin'}</h3>
                  <p>Administrator</p>
                </div>
                <div className="user-avatar">
                  {userData?.username?.[0]?.toUpperCase() || 'A'}
                </div>
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
          {activeTab === 'users' && <AdminUserManagement />}
          {activeTab === 'analytics' && <AdminSystemStats />}
        </main>
      </div>

      {/* Premium 2025+ CSS */}
      <style jsx>{`
        .admin-dashboard {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          color: #0f172a;
          display: flex;
        }

        /* Fixed Header - Always Sticks */
        .admin-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 84px;
          background: rgba(255, 255, 255, 0.98);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          backdrop-filter: blur(16px);
          z-index: 999;                    /* ← HIGHEST */
        }

        .header-content {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 36px;
        }

        /* Sidebar */
        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: white;
          border-right: 1px solid #e2e8f0;
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
          z-index: 950;                    /* ← LOWER than header (999) */
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-100%);
          padding-top: 84px;               /* ← NEW: make room for fixed header */
        }

        .admin-sidebar.open {
          transform: translateX(0);
        }

        .admin-sidebar.open {
          transform: translateX(0);
        }

        @media (min-width: 1025px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
          .mobile-close-btn { display: none; }
          .mobile-menu-btn { display: none; }
        }

        /* Main Content - Reserves space for fixed header */
        .admin-main {
          flex: 1;
          min-height: 100vh;
          padding-top: 84px; /* /* Matches header height */
          margin-left: 0;
          transition: margin-left 0.35s ease;
        }

        @media (min-width: 1025px) {
          .admin-main {
            margin-left: 280px;
          }
        }

        /* Overlay */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 900;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
        }

        .sidebar-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* Rest of your beautiful styles (unchanged but cleaned) */
        .sidebar-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 84px;
          background: white;
          z-index: 10;
          border-bottom: 1px solid #e2e8f0;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sidebar-logo { display: flex; align-items: center; gap: 16px; }
        .logo-icon { width: 52px; height: 52px; background: linear-gradient(135deg, #1e6cff, #4c8aff); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.8rem; box-shadow: 0 12px 30px rgba(30, 108, 255, 0.35); }
        .sidebar-logo h1 { font-size: 1.7rem; font-weight: 800; color: #0f172a; }
        .mobile-close-btn { display: block; background: none; border: none; color: #64748b; cursor: pointer; }
        .admin-nav {
          padding: 100px 20px 24px;   /* 84px header + extra spacing */
        }
        .nav-item { width: 100%; padding: 16px 20px; margin-bottom: 10px; border-radius: 18px; display: flex; align-items: center; gap: 16px; font-weight: 600; font-size: 1rem; transition: all 0.3s ease; cursor: pointer; position: relative; background: transparent; border: none; text-align: left; }
        .nav-item:hover { background: #f8fafc; color: #1e6cff; }
        .nav-item.active { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1e6cff; border: 1.5px solid #93c5fd; font-weight: 700; box-shadow: 0 12px 30px rgba(30, 108, 255, 0.2); }
        .nav-item.active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 6px; height: 36px; background: #1e6cff; border-radius: 0 8px 8px 0; }
        .nav-badge { margin-left: auto; background: linear-gradient(135deg, #ef4444, #f87171); color: white; font-size: 0.8rem; font-weight: 700; padding: 6px 12px; border-radius: 50px; min-width: 28px; }
        .sidebar-footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 28px 32px; border-top: 1px solid #e2e8f0; background: white; }
        .logout-btn { width: 100%; padding: 16px 20px; border-radius: 18px; background: linear-gradient(135deg, #fee2e2, #fecaca); color: #991b1b; font-weight: 600; font-size: 1rem; display: flex; align-items: center; gap: 14px; border: none; cursor: pointer; transition: all 0.3s ease; }
        .logout-btn:hover { background: linear-gradient(135deg, #fecaca, #fca5a5); transform: translateY(-4px); box-shadow: 0 15px 30px rgba(239, 68, 68, 0.25); }

        /* Header Elements */
        .header-left { display: flex; align-items: center; gap: 24px; }
        .mobile-menu-btn { display: block; background: none; border: none; color: #475569; cursor: pointer; }
        .search-container { position: relative; width: 460px; }
        .search-input { width: 100%; padding: 16px 20px 16px 56px; border: 2px solid #e2e8f0; border-radius: 20px; background: #f8fafc; font-size: 1rem; transition: all 0.3s ease; }
        .search-input:focus { outline: none; border-color: #1e6cff; background: white; box-shadow: 0 0 0 5px rgba(30, 108, 255, 0.18); }
        .search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .header-right { display: flex; align-items: center; gap: 24px; }
        .notification-btn { position: relative; padding: 14px; border-radius: 18px; background: #f8fafc; transition: all 0.3s; border: none; cursor: pointer; }
        .notification-btn:hover { background: #e2e8f0; transform: translateY(-3px); }
        .notification-dot { position: absolute; top: 12px; right: 12px; width: 12px; height: 12px; background: #ef4444; border-radius: 50%; border: 3px solid white; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
        .user-profile { display: flex; align-items: center; gap: 18px; padding-left: 28px; border-left: 1px solid #e2e8f0; }
        .user-info h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
        .user-info p { font-size: 0.85rem; color: #64748b; margin: 0; }
        .user-avatar { width: 56px; height: 56px; background: linear-gradient(135deg, #1e6cff, #4c8aff); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.3rem; box-shadow: 0 12px 30px rgba(30, 108, 255, 0.35); }
        .admin-content { padding: 40px; }

        /* Responsive */
        @media (max-width: 1024px) {
          .search-container { width: 340px; }
        }
        @media (max-width: 768px) {
          .header-content { padding: 0 20px; }
          .search-container { width: 100%; max-width: 300px; }
          .user-info { display: none; }
          .admin-content { padding: 24px; }
        }

        /* Access Denied */
        .access-denied { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
        .denied-card { text-align: center; padding: 80px 60px; background: white; border-radius: 32px; box-shadow: 0 30px 70px rgba(239, 68, 68, 0.25); max-width: 520px; }
        .denied-icon { color: #ef4444; margin-bottom: 28px; }
        .denied-card h2 { font-size: 2.8rem; font-weight: 800; color: #991b1b; margin-bottom: 20px; }
        .denied-card p { font-size: 1.2rem; color: #64748b; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;