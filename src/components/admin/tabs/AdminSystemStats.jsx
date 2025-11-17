// src/components/admin/tabs/AdminSystemStats.jsx
import React, { useState, useEffect } from 'react';
import statsService from '../../../services/statsService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import {
  BarChart3, Users, Target, DollarSign, TrendingUp,
  RefreshCw, FileText, PieChartIcon, ShieldCheck
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminSystemStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        donationAnalyticsRes,
        platformStatsRes,
        donationTrendsRes,
      ] = await Promise.all([
        statsService.getDonationAnalytics().catch(() => ({ analytics: {} })),
        statsService.getPlatformDonationStats().catch(() => ({ statistics: {} })),
        statsService.getDonationTrends(12).catch(() => ({ trends: [] })),
      ]);

      const donationAnalytics = donationAnalyticsRes?.analytics || {};
      const platformStats = platformStatsRes?.statistics || {};
      const trends = donationTrendsRes?.trends || [];

      // Safely extract values with fallbacks
      const combined = {
        overview: {
          totalCampaigns: Number(platformStats.uniqueCampaigns) || 0,
          totalUsers: Number(platformStats.uniqueDonors) || 0,
          totalRaisedAmount: Number(platformStats.totalNetToCampaigns) || 0,
        },
        donations: {
          totalRaised: Number(platformStats.totalNetToCampaigns) || 0,
          totalDonations: Number(platformStats.totalDonations) || 0,
          averageDonation: Number(platformStats.averageNetDonation) || 0,
          recentDonations: Number(platformStats.recentDonations) || 0,
          growthRate: Number(donationAnalytics.platform?.growthRate) || 0,
        },
        trends,
        // Temporary mock data (replace later when you have real breakdown endpoints)
        campaigns: {
          byStatus: { pending: 18, approved: 92, active: 134, rejected: 7 },
          byCategory: { medical: 84, education: 62, community: 45, emergency: 32, environment: 18, animals: 10 },
        },
        users: {
          byRole: { donor: 8420, beneficiary: 412, admin: 8 },
          verificationStats: { verified: 7980, unverified: 860 },
        },
      };

      setStats(combined);
    } catch (err) {
      console.error('Failed to load system stats:', err);
      setError('Failed to load system statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount || 0);

  if (loading) return <LoadingSpinner message="Loading system analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAllStats} />;
  if (!stats) return <div className="no-data">No statistics available</div>;

  // Chart Data – all safe now
  const campaignStatusData = {
    labels: Object.keys(stats.campaigns?.byStatus || {}),
    datasets: [{
      label: 'Campaigns',
      data: Object.values(stats.campaigns?.byStatus || {}),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const categoryData = {
    labels: Object.keys(stats.campaigns?.byCategory || {}),
    datasets: [{
      data: Object.values(stats.campaigns?.byCategory || {}),
      backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e'],
      borderWidth: 3,
      borderColor: '#ffffff',
      hoverOffset: 12,
    }],
  };

  const roleData = {
    labels: Object.keys(stats.users?.byRole || {}),
    datasets: [{
      data: Object.values(stats.users?.byRole || {}),
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
      borderWidth: 3,
      borderColor: '#ffffff',
    }],
  };

  const verificationData = {
    labels: ['Verified', 'Unverified'],
    datasets: [{
      data: [
        stats.users?.verificationStats?.verified || 0,
        stats.users?.verificationStats?.unverified || 0,
      ],
      backgroundColor: ['#10b981', '#ef4444'],
      borderRadius: 10,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20 } },
      tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', cornerRadius: 12 },
    },
    animation: { duration: 1200, easing: 'easeOutQuart' },
  };

  return (
    <div className="admin-system-stats">
      {/* Header */}
      <div className="stats-header">
        <div>
          <h2><BarChart3 size={42} /> System Analytics & Insights</h2>
          <p>Real-time platform performance and growth metrics</p>
        </div>
        <button onClick={fetchAllStats} className="refresh-btn">
          <RefreshCw size={20} className="spin-on-hover" />
          Refresh Data
        </button>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        {[
          { icon: FileText, label: 'Total Campaigns', value: stats.overview.totalCampaigns.toLocaleString() },
          { icon: Users, label: 'Total Donors', value: stats.overview.totalUsers.toLocaleString() },
          { icon: DollarSign, label: 'Total Raised', value: formatCurrency(stats.overview.totalRaisedAmount) },
          { icon: TrendingUp, label: 'Growth Rate', value: `+${stats.donations.growthRate.toFixed(1)}%` },
          { icon: Target, label: 'Avg Donation', value: formatCurrency(stats.donations.averageDonation) },
        ].map((item, i) => (
          <div key={i} className="stat-card">
            <div className="card-icon">
              <item.icon size={32} />
            </div>
            <div className="card-content">
              <p className="card-label">{item.label}</p>
              <p className="card-value">{item.value}</p>
            </div>
            <div className="card-glow" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-box">
          <h3><PieChartIcon size={22} /> Campaigns by Status</h3>
          <div className="chart-wrapper">
            <Bar data={campaignStatusData} options={{ ...chartOptions, indexAxis: 'y' }} />
          </div>
        </div>
        <div className="chart-box">
          <h3><PieChartIcon size={22} /> Campaigns by Category</h3>
          <div className="chart-wrapper">
            <Pie data={categoryData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-box">
          <h3><Users size={22} /> Users by Role</h3>
          <div className="chart-wrapper">
            <Pie data={roleData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-box">
          <h3><ShieldCheck size={22} /> Verification Status</h3>
          <div className="chart-wrapper">
            <Bar data={verificationData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Your original beautiful CSS (unchanged) */}
      <style jsx>{`
        .admin-system-stats { padding: 40px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); min-height: 100vh; font-family: 'Inter', sans-serif; }
        .stats-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
        .stats-header h2 { font-size: 2.8rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 18px; margin: 0; }
        .stats-header p { font-size: 1.2rem; color: #64748b; margin: 8px 0 0 60px; }
        .refresh-btn { background: linear-gradient(135deg, #1e6cff, #4c8aff); color: white; border: none; padding: 16px 28px; border-radius: 18px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 25px rgba(30, 108, 255, 0.3); transition: all 0.3s; }
        .refresh-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(30, 108, 255, 0.4); }
        .spin-on-hover { transition: transform 0.6s; }
        .refresh-btn:hover .spin-on-hover { transform: rotate(360deg); }
        .overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px; margin-bottom: 56px; }
        .stat-card { position: relative; background: white; border-radius: 24px; padding: 32px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: all 0.4s ease; }
        .stat-card:hover { transform: translateY(-12px); box-shadow: 0 25px 60px rgba(0,0,0,0.15); }
        .card-icon { width: 68px; height: 68px; background: linear-gradient(135deg, #1e6cff, #4c8aff); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: white; }
        .card-content { text-align: left; }
        .card-label { font-size: 1rem; color: #64748b; font-weight: 500; margin-bottom: 8px; }
        .card-value { font-size: 2.4rem; font-weight: 800; color: #0f172a; margin: 0; }
        .card-glow { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(30,108,255,0.08), transparent); border-radius: 24px; pointer-events: none; }
        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 32px; margin-bottom: 56px; }
        .chart-box { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 15px 40px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .chart-box h3 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .chart-wrapper { height: 320px; position: relative; }
        .no-data { text-align: center; padding: 80px; color: #64748b; font-size: 1.2rem; }
        @media (max-width: 1024px) { .charts-grid, .overview-grid { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .admin-system-stats { padding: 24px; } .stats-header { flex-direction: column; align-items: flex-start; gap: 20px; } .stats-header p { margin-left: 0; } }
      `}</style>
    </div>
  );
};

export default AdminSystemStats;