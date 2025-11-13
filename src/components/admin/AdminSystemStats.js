import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminSystemStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getSystemStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      setError('Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount || 0);
  };

  if (loading) {
    return <LoadingSpinner message="Loading system statistics..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSystemStats} />;
  }

  if (!stats) {
    return <div>No statistics available</div>;
  }

  // Prepare chart data
  const campaignStatusData = {
    labels: Object.keys(stats.campaigns?.byStatus || {}),
    datasets: [{
      label: 'Campaigns by Status',
      data: Object.values(stats.campaigns?.byStatus || {}),
      backgroundColor: [
        'rgba(255, 193, 7, 0.6)',
        'rgba(40, 167, 69, 0.6)',
        'rgba(0, 123, 255, 0.6)',
        'rgba(220, 53, 69, 0.6)',
      ],
      borderColor: [
        'rgba(255, 193, 7, 1)',
        'rgba(40, 167, 69, 1)',
        'rgba(0, 123, 255, 1)',
        'rgba(220, 53, 69, 1)',
      ],
      borderWidth: 1,
    }],
  };

  const campaignCategoryData = {
    labels: Object.keys(stats.campaigns?.byCategory || {}),
    datasets: [{
      label: 'Campaigns by Category',
      data: Object.values(stats.campaigns?.byCategory || {}),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
      ],
    }],
  };

  const userRoleData = {
    labels: Object.keys(stats.users?.byRole || {}),
    datasets: [{
      label: 'Users by Role',
      data: Object.values(stats.users?.byRole || {}),
      backgroundColor: [
        'rgba(0, 123, 255, 0.6)',
        'rgba(255, 193, 7, 0.6)',
      ],
    }],
  };

  return (
    <div className="admin-system-stats">
      <div className="stats-header">
        <h2>📈 System Statistics & Analytics</h2>
        <p>Comprehensive overview of platform performance</p>
        <button onClick={fetchSystemStats} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Campaigns</h3>
            <div className="stat-number">{stats.overview?.totalCampaigns || 0}</div>
            <div className="stat-description">All campaigns on platform</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <div className="stat-number">{stats.overview?.totalUsers || 0}</div>
            <div className="stat-description">Registered users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Total Goal Amount</h3>
            <div className="stat-number">{formatCurrency(stats.overview?.totalGoalAmount)}</div>
            <div className="stat-description">Cumulative fundraising goals</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Raised</h3>
            <div className="stat-number">{formatCurrency(stats.overview?.totalRaisedAmount)}</div>
            <div className="stat-description">Total funds raised</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Success Rate</h3>
            <div className="stat-number">{stats.overview?.platformSuccessRate?.toFixed(1)}%</div>
            <div className="stat-description">Platform success rate</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-container">
            <h3>Campaigns by Status</h3>
            <Bar 
              data={campaignStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Campaign Distribution by Status'
                  }
                }
              }}
            />
          </div>

          <div className="chart-container">
            <h3>Campaigns by Category</h3>
            <Pie 
              data={campaignCategoryData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  },
                  title: {
                    display: true,
                    text: 'Campaign Distribution by Category'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-container">
            <h3>Users by Role</h3>
            <Pie 
              data={userRoleData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  },
                  title: {
                    display: true,
                    text: 'User Distribution by Role'
                  }
                }
              }}
            />
          </div>

          <div className="chart-container">
            <h3>Verification Status</h3>
            <Bar 
              data={{
                labels: ['Verified', 'Unverified'],
                datasets: [{
                  label: 'Users',
                  data: [
                    stats.users?.verificationStats?.verified || 0,
                    stats.users?.verificationStats?.unverified || 0
                  ],
                  backgroundColor: [
                    'rgba(40, 167, 69, 0.6)',
                    'rgba(220, 53, 69, 0.6)',
                  ],
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'User Verification Status'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Statistics Tables */}
      <div className="detailed-stats">
        <div className="stats-table-section">
          <h3>Campaign Statistics Details</h3>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.campaigns?.byStatus || {}).map(([status, count]) => (
                <tr key={status}>
                  <td className="capitalize">{status}</td>
                  <td>{count}</td>
                  <td>
                    {((count / stats.overview?.totalCampaigns) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="stats-table-section">
          <h3>Category Distribution</h3>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.campaigns?.byCategory || {}).map(([category, count]) => (
                <tr key={category}>
                  <td className="capitalize">{category}</td>
                  <td>{count}</td>
                  <td>
                    {((count / stats.overview?.totalCampaigns) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemStats;