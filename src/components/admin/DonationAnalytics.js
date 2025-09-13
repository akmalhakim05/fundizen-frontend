import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/components/DonationAnalytics.css';

const DonationAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const [statistics, setStatistics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [topDonors, setTopDonors] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        statsData,
        analyticsData,
        trendsData,
        recentData
      ] = await Promise.allSettled([
        paymentService.getDonationStatistics(),
        paymentService.getDonationAnalytics({ timeRange }),
        paymentService.getDonationTrends(timeRange === 'year' ? 12 : 6),
        paymentService.getRecentDonations(20, 24)
      ]);

      if (statsData.status === 'fulfilled') {
        setStatistics(statsData.value);
      }

      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      }

      if (trendsData.status === 'fulfilled') {
        setTrends(trendsData.value);
      }

      if (recentData.status === 'fulfilled') {
        setRecentDonations(recentData.value.donations || []);
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return paymentService.formatCurrency(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPercentage = (value) => {
    return `${value?.toFixed(1) || 0}%`;
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'quarter': return 'Last 3 Months';
      case 'year': return 'Last 12 Months';
      default: return 'Last 30 Days';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'donations', label: 'Donations', icon: '💰' },
    { id: 'trends', label: 'Trends', icon: '📈' },
    { id: 'donors', label: 'Donors', icon: '👥' }
  ];

  const timeRanges = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last 12 Months' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab 
          statistics={statistics} 
          analytics={analytics}
          timeRange={timeRange}
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />;
      case 'donations':
        return <DonationsTab 
          recentDonations={recentDonations}
          analytics={analytics}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />;
      case 'trends':
        return <TrendsTab 
          trends={trends}
          analytics={analytics}
          formatCurrency={formatCurrency}
        />;
      case 'donors':
        return <DonorsTab 
          analytics={analytics}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />;
      default:
        return <OverviewTab 
          statistics={statistics} 
          analytics={analytics}
          timeRange={timeRange}
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading donation analytics..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchAnalyticsData} />;
  }

  return (
    <div className="donation-analytics">
      <div className="analytics-header">
        <h2>💰 Donation Analytics</h2>
        <p>Track and analyze donation performance across the platform</p>
        
        <div className="analytics-controls">
          <div className="time-range-selector">
            <label htmlFor="timeRange">Time Range:</label>
            <select 
              id="timeRange"
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="analytics-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`analytics-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="analytics-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ statistics, analytics, timeRange, formatCurrency, formatPercentage }) => {
  if (!statistics && !analytics) {
    return <div className="no-data">No analytics data available</div>;
  }

  return (
    <div className="overview-tab">
      <div className="overview-header">
        <h3>📊 Platform Overview</h3>
        <p>Key donation metrics and performance indicators</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card total-donations">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h4>Total Donations</h4>
            <div className="metric-value">{formatCurrency(statistics?.totalAmount || 0)}</div>
            <div className="metric-subtitle">
              {statistics?.totalCount || 0} donations
            </div>
          </div>
        </div>

        <div className="metric-card average-donation">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h4>Average Donation</h4>
            <div className="metric-value">{formatCurrency(statistics?.averageAmount || 0)}</div>
            <div className="metric-subtitle">
              Per transaction
            </div>
          </div>
        </div>

        <div className="metric-card success-rate">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h4>Success Rate</h4>
            <div className="metric-value">{formatPercentage(statistics?.successRate || 0)}</div>
            <div className="metric-subtitle">
              Payment completion
            </div>
          </div>
        </div>

        <div className="metric-card active-donors">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h4>Unique Donors</h4>
            <div className="metric-value">{statistics?.uniqueDonors || 0}</div>
            <div className="metric-subtitle">
              Individual contributors
            </div>
          </div>
        </div>
      </div>

      {/* Period Comparison */}
      {analytics && (
        <div className="period-comparison">
          <h4>📅 Period Performance</h4>
          <div className="comparison-grid">
            <div className="comparison-item">
              <span className="comparison-label">Total Amount</span>
              <span className="comparison-value">{formatCurrency(analytics.currentPeriod?.totalAmount || 0)}</span>
              <span className={`comparison-change ${analytics.growth?.amountChange >= 0 ? 'positive' : 'negative'}`}>
                {analytics.growth?.amountChange >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(analytics.growth?.amountChange || 0))}
              </span>
            </div>

            <div className="comparison-item">
              <span className="comparison-label">Donation Count</span>
              <span className="comparison-value">{analytics.currentPeriod?.donationCount || 0}</span>
              <span className={`comparison-change ${analytics.growth?.countChange >= 0 ? 'positive' : 'negative'}`}>
                {analytics.growth?.countChange >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(analytics.growth?.countChange || 0))}
              </span>
            </div>

            <div className="comparison-item">
              <span className="comparison-label">Average Amount</span>
              <span className="comparison-value">{formatCurrency(analytics.currentPeriod?.averageAmount || 0)}</span>
              <span className={`comparison-change ${analytics.growth?.averageChange >= 0 ? 'positive' : 'negative'}`}>
                {analytics.growth?.averageChange >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(analytics.growth?.averageChange || 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Breakdown */}
      {analytics?.paymentMethods && (
        <div className="payment-methods-breakdown">
          <h4>💳 Payment Methods</h4>
          <div className="payment-methods-chart">
            {Object.entries(analytics.paymentMethods).map(([method, data]) => (
              <div key={method} className="payment-method-item">
                <div className="method-info">
                  <span className="method-name">
                    {method === 'stripe' ? '💳 Credit/Debit Card' : 
                     method === 'bank_transfer' ? '🏦 Bank Transfer' : method}
                  </span>
                  <span className="method-stats">
                    {formatCurrency(data.amount)} ({data.count} donations)
                  </span>
                </div>
                <div className="method-bar">
                  <div 
                    className="method-fill"
                    style={{ width: `${(data.percentage || 0)}%` }}
                  />
                </div>
                <span className="method-percentage">{formatPercentage(data.percentage || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Donations Tab Component
const DonationsTab = ({ recentDonations, analytics, formatCurrency, formatDate }) => {
  return (
    <div className="donations-tab">
      <div className="donations-header">
        <h3>💰 Recent Donations</h3>
        <p>Latest donation transactions across all campaigns</p>
      </div>

      {recentDonations.length === 0 ? (
        <div className="no-donations">
          <div className="no-donations-icon">💸</div>
          <h4>No recent donations</h4>
          <p>No donations have been made in the last 24 hours.</p>
        </div>
      ) : (
        <div className="donations-list">
          {recentDonations.map(donation => (
            <DonationCard 
              key={donation.id}
              donation={donation}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Donation Status Summary */}
      {analytics?.donationStatus && (
        <div className="donation-status-summary">
          <h4>📊 Donation Status Summary</h4>
          <div className="status-grid">
            {Object.entries(analytics.donationStatus).map(([status, data]) => (
              <div key={status} className={`status-item ${status}`}>
                <div className="status-icon">
                  {status === 'completed' ? '✅' : 
                   status === 'pending' ? '⏳' : 
                   status === 'failed' ? '❌' : '🔄'}
                </div>
                <div className="status-content">
                  <h5>{status.charAt(0).toUpperCase() + status.slice(1)}</h5>
                  <div className="status-value">{formatCurrency(data.amount)}</div>
                  <div className="status-count">{data.count} donations</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Trends Tab Component
const TrendsTab = ({ trends, analytics, formatCurrency }) => {
  return (
    <div className="trends-tab">
      <div className="trends-header">
        <h3>📈 Donation Trends</h3>
        <p>Historical donation patterns and growth trends</p>
      </div>

      {trends && trends.length > 0 ? (
        <div className="trends-visualization">
          <div className="trends-chart">
            <h4>Monthly Donation Trends</h4>
            <div className="chart-container">
              {trends.map((trend, index) => (
                <div key={trend.period} className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(trend.amount / Math.max(...trends.map(t => t.amount))) * 100}%` 
                    }}
                  />
                  <div className="bar-label">
                    <span className="bar-amount">{formatCurrency(trend.amount)}</span>
                    <span className="bar-period">{trend.period}</span>
                    <span className="bar-count">{trend.count} donations</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="trends-insights">
            <h4>📊 Key Insights</h4>
            <div className="insights-list">
              <div className="insight-item">
                <span className="insight-icon">🏆</span>
                <div className="insight-content">
                  <strong>Best Month:</strong> {trends.reduce((max, trend) => trend.amount > max.amount ? trend : max).period}
                  <br />
                  <small>{formatCurrency(Math.max(...trends.map(t => t.amount)))} raised</small>
                </div>
              </div>

              <div className="insight-item">
                <span className="insight-icon">📊</span>
                <div className="insight-content">
                  <strong>Average Monthly:</strong> {formatCurrency(trends.reduce((sum, t) => sum + t.amount, 0) / trends.length)}
                  <br />
                  <small>{Math.round(trends.reduce((sum, t) => sum + t.count, 0) / trends.length)} donations</small>
                </div>
              </div>

              <div className="insight-item">
                <span className="insight-icon">📈</span>
                <div className="insight-content">
                  <strong>Growth Trend:</strong> 
                  {trends.length >= 2 && (
                    <>
                      {trends[trends.length - 1].amount > trends[trends.length - 2].amount ? (
                        <span className="positive">📈 Increasing</span>
                      ) : (
                        <span className="negative">📉 Decreasing</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-trends">
          <div className="no-trends-icon">📈</div>
          <h4>No trend data available</h4>
          <p>Insufficient data to display trends. More donations needed.</p>
        </div>
      )}
    </div>
  );
};

// Donors Tab Component
const DonorsTab = ({ analytics, formatCurrency, formatDate }) => {
  return (
    <div className="donors-tab">
      <div className="donors-header">
        <h3>👥 Donor Analytics</h3>
        <p>Insights about donors and donation patterns</p>
      </div>

      {analytics?.topDonors && analytics.topDonors.length > 0 ? (
        <div className="top-donors">
          <h4>🏆 Top Donors</h4>
          <div className="donors-list">
            {analytics.topDonors.map((donor, index) => (
              <div key={donor.donorEmail} className="donor-item">
                <div className="donor-rank">#{index + 1}</div>
                <div className="donor-info">
                  <span className="donor-name">
                    {donor.isAnonymous ? 'Anonymous Donor' : donor.donorName}
                  </span>
                  <span className="donor-email">{donor.donorEmail}</span>
                </div>
                <div className="donor-stats">
                  <span className="donor-amount">{formatCurrency(donor.totalAmount)}</span>
                  <span className="donor-count">{donor.donationCount} donations</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-donors">
          <div className="no-donors-icon">👥</div>
          <h4>No donor data available</h4>
          <p>Donor analytics will appear as donations are made.</p>
        </div>
      )}

      {/* Donor Segments */}
      {analytics?.donorSegments && (
        <div className="donor-segments">
          <h4>📊 Donor Segments</h4>
          <div className="segments-grid">
            {Object.entries(analytics.donorSegments).map(([segment, data]) => (
              <div key={segment} className="segment-item">
                <div className="segment-header">
                  <span className="segment-name">
                    {segment === 'first_time' ? '🆕 First-time Donors' :
                     segment === 'returning' ? '🔄 Returning Donors' :
                     segment === 'major' ? '💎 Major Donors' :
                     segment === 'regular' ? '⭐ Regular Donors' : segment}
                  </span>
                  <span className="segment-count">{data.count} donors</span>
                </div>
                <div className="segment-stats">
                  <span className="segment-amount">{formatCurrency(data.totalAmount)}</span>
                  <span className="segment-percentage">{((data.count / analytics.totalDonors) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Donation Card Component
const DonationCard = ({ donation, formatCurrency, formatDate }) => {
  return (
    <div className="donation-card">
      <div className="donation-header">
        <div className="donation-amount">{formatCurrency(donation.amount)}</div>
        <div className={`donation-status ${donation.status}`}>
          {donation.status === 'completed' ? '✅' : 
           donation.status === 'pending' ? '⏳' : 
           donation.status === 'failed' ? '❌' : '🔄'}
          {donation.status}
        </div>
      </div>

      <div className="donation-details">
        <div className="detail-row">
          <span className="label">Campaign:</span>
          <span className="value">{donation.campaignName}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Donor:</span>
          <span className="value">
            {donation.isAnonymous ? 'Anonymous' : donation.donorName}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="label">Method:</span>
          <span className="value">
            {donation.paymentMethod === 'stripe' ? '💳 Card' : 
             donation.paymentMethod === 'bank_transfer' ? '🏦 Bank' : 
             donation.paymentMethod}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="label">Date:</span>
          <span className="value">{formatDate(donation.createdAt)}</span>
        </div>
        
        {donation.message && (
          <div className="detail-row">
            <span className="label">Message:</span>
            <span className="value message">"{donation.message}"</span>
          </div>
        )}
      </div>

      <div className="donation-actions">
        <button className="action-btn view-details">
          👁️ View Details
        </button>
        {donation.status === 'pending' && (
          <button className="action-btn verify">
            ✅ Verify
          </button>
        )}
      </div>
    </div>
  );
};

export default DonationAnalytics;