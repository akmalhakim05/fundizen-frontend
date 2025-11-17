// src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../common/LoadingSpinner';
import AdminOverview from './tabs/AdminOverview';
import AdminPendingApprovals from './tabs/AdminPendingApprovals';
import AdminCampaignManagement from './AdminCampaignManagement';
import AdminUserManagement from './AdminUserManagement';
import AdminSystemStats from './AdminSystemStats';
import {
  LayoutDashboard, FileText, Users, Settings, BarChart3, LogOut,
  Bell, Search, Menu, X, ChevronDown
} from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const isAdmin = userData?.role === 'admin' || userData?.isAdmin;

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/campaigns')) setActiveTab('campaigns');
    else if (path.includes('/users')) setActiveTab('users');
    else if (path.includes('/analytics')) setActiveTab('analytics');
    else if (path.includes('/settings')) setActiveTab('settings');
    else if (path.includes('/pending')) setActiveTab('pending');
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { id: 'pending', label: 'Pending Approvals', icon: FileText, path: '/admin/pending', badge: dashboardData?.pendingCount },
    { id: 'campaigns', label: 'Campaigns', icon: BarChart3, path: '/admin/campaigns' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl text-red-500 mb-4">Restricted Access</div>
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 mt-2">You do not have administrator privileges.</p>
        </div>
      </div>
    );
  }

if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 flex font-inter">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">F</div>
            <h1 className="text-xl font-bold text-gray-900">Fundizen Admin</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { navigate(item.path); setActiveTab(item.id); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
                <Menu size={24} />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search campaigns, users, transactions..."
                  className="pl-10 pr-4 py-2.5 w-96 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition">
                <Bell size={22} className="text-gray-600" />
                {dashboardData?.pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                )}
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{userData?.username || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userData?.username?.[0]?.toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 bg-gray-50">
          {activeTab === 'overview' && <AdminOverview data={dashboardData} />}
          {activeTab === 'pending' && <AdminPendingApprovals />}
          {activeTab === 'campaigns' && <AdminCampaignManagement />}
          {activeTab === 'users' && <AdminUserManagement />}
          {activeTab === 'analytics' && <AdminSystemStats />}
          {activeTab === 'settings' && <div className="text-3xl font-bold text-gray-800">Settings (Coming Soon)</div>}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;