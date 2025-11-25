// src/components/admin/tabs/AdminOverview.jsx
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Users, DollarSign,
  AlertCircle, Globe, Target, CheckCircle, XCircle, PauseCircle,
  Download, Settings, ChevronRight
} from 'lucide-react';
import adminService from '../../../services/adminService';

const AdminOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((data) => setDashboardData(data))
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="admin-overview">
        <div className="page-header">
          <div className="header-text">
            <h1>Loading Dashboard...</h1>
          </div>
        </div>
      </div>
    );
  }

  const { users, campaigns } = dashboardData;

  // Fix key names + add "Completed"
  const stats = [
    {
      label: 'Total Campaigns',
      value: campaigns.total,
      icon: FileText,
      color: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      breakdown: [
        { label: 'Public', value: campaigns.public, icon: Globe, color: '#3B82F6' },
        { label: 'Approved', value: campaigns.approved, icon: CheckCircle, color: '#10B981' },
        { label: 'Completed', value: campaigns.completed || 0, icon: Target, color: '#7C3AED' }, // Fixed!
        { label: 'Rejected', value: campaigns.rejected, icon: XCircle, color: '#EF4444' },
        { label: 'Pending', value: campaigns.pending, icon: PauseCircle, color: '#F59E0B' },
      ],
    },
    {
      label: 'Total Users',
      value: users.total,
      icon: Users,
      color: '#10B981',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      breakdown: [
        { label: 'Verified', value: users.verified, icon: CheckCircle, color: '#10B981' },
        { label: 'Unverified', value: users.unverified, icon: AlertCircle, color: '#F59E0B' },
      ],
    },
    {
      label: 'Pending Approval',
      value: campaigns.pending,
      icon: AlertCircle,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
      urgent: campaigns.pending > 0,
    },
    {
      label: 'Total Raised',
      value: `RM ${Number(campaigns.totalRaisedAmount).toLocaleString('en-MY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      borderColor: '#DDD6FE',
    },
  ];

  // Success rate can be >100% → that's GOOD! Show it proudly
  const successRate = Number(campaigns.platformSuccessRate || 0).toFixed(2);

  return (
    <div className="admin-overview">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <LayoutDashboard size={24} />
          </div>
          <div className="header-text">
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's what's happening on Fundizen today.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-top">
              <div
                className="stat-icon"
                style={{
                  background: stat.bgColor,
                  color: stat.color,
                  border: `1px solid ${stat.borderColor}`,
                }}
              >
                <stat.icon size={22} />
              </div>
              {stat.urgent && <span className="urgent-tag">Action Required</span>}
            </div>

            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>

            {stat.breakdown && (
              <div className="stat-breakdown">
                {stat.breakdown.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.label} className="breakdown-item">
                      <div className="breakdown-label">
                        {IconComponent && <IconComponent size={14} style={{ color: item.color }} />}
                        <span>{item.label}</span>
                      </div>
                      <span className="breakdown-value" style={{ color: item.color, fontWeight: 600 }}>
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="stat-footer">
              <span>View details</span>
              <ChevronRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Platform Summary - Now shows over 100% proudly */}
      <div className="platform-summary">
        <div className="summary-card">
          <div className="summary-item">
            <span className="summary-label">Total Goal Amount</span>
            <span className="summary-value">
              RM {Number(campaigns.totalGoalAmount).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Raised Amount</span>
            <span className="summary-value text-success">
              RM {Number(campaigns.totalRaisedAmount).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="summary-item highlight">
            <span className="summary-label">Platform Success Rate</span>
            <span className="summary-value large">
              {successRate}%
              {parseFloat(successRate) > 100 && <span style={{ fontSize: '1rem', marginLeft: '8px' }}>Overfunded!</span>}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Outfit:wght@400;500;600;700;800&display=swap');

        .admin-overview { font-family: 'DM Sans', sans-serif; }

        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; gap: 24px; }
        .header-content { display: flex; align-items: flex-start; gap: 16px; }
        .header-icon { width: 52px; height: 52px; background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
        .header-text h1 { font-family: 'Outfit', sans-serif; font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 4px 0; line-height: 1.2; }
        .header-text p { font-size: 1rem; color: #6B7280; margin: 0; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
        .stat-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; transition: all 0.3s ease; cursor: pointer; }
        .stat-card:hover { border-color: #D1D5DB; box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .urgent-tag { font-size: 0.75rem; font-weight: 600; color: #DC2626; background: #FEF2F2; padding: 6px 12px; border-radius: 20px; border: 1px solid #FECACA; }
        .trend-tag { display: flex; align-items: center; gap: 4px; font-size: 0.813rem; font-weight: 600; padding: 6px 10px; border-radius: 20px; }
        .trend-tag.up { color: #059669; background: #ECFDF5; }
        .stat-content { display: flex; flex-direction: column; gap: 4px; }
        .stat-label { font-size: 0.875rem; color: #6B7280; font-weight: 500; }
        .stat-value { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 700; color: #111827; line-height: 1.1; }
        .stat-footer { display: flex; align-items: center; gap: 4px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #F3F4F6; font-size: 0.813rem; color: #9CA3AF; font-weight: 500; }
        .stat-card:hover .stat-footer { color: #2563EB; }

        .content-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
        .content-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; }
        .card-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #F3F4F6; }
        .card-title { display: flex; align-items: center; gap: 10px; color: #6B7280; }
        .card-title h2 { font-family: 'Outfit', sans-serif; font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0; }
        .view-all-btn { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; font-weight: 500; color: #2563EB; background: none; border: none; cursor: pointer; }
        .view-all-btn:hover { color: #1D4ED8; }
        .card-body { padding: 24px; }

        .empty-state { text-align: center; padding: 48px 24px; }
        .empty-icon { width: 72px; height: 72px; margin: 0 auto 16px; background: #F8FAFC; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #D1D5DB; }
        .empty-state h3 { font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 600; color: #374151; margin: 0 0 4px 0; }
        .empty-state p { font-size: 0.875rem; color: #9CA3AF; margin: 0; }

        .activity-list { display: flex; flex-direction: column; gap: 16px; }
        .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: #F9FAFB; border-radius: 10px; }
        .activity-item:hover { background: #F3F4F6; }
        .activity-icon { width: 32px; height: 32px; background: #EFF6FF; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2563EB; }
        .activity-text { font-size: 0.875rem; font-weight: 500; color: #374151; }
        .activity-time { font-size: 0.75rem; color: #9CA3AF; }

        .actions-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .action-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 16px; border-radius: 12px; font-weight: 600; font-size: 0.938rem; cursor: pointer; text-align: left; }
        .action-btn .action-arrow { margin-left: auto; opacity: 0; transform: translateX(-4px); transition: all 0.2s ease; }
        .action-btn:hover .action-arrow { opacity: 1; transform: translateX(0); }
        .action-btn.primary { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: white; }
        .action-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37,99,235,0.3); }
        .action-btn.secondary { background: #10B981; color: white; }
        .action-btn.outline { background: #FFFFFF; color: #374151; border: 1px solid #E5E7EB; }

        .health-section { padding: 20px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E5E7EB; }
        .health-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .health-title { font-size: 0.875rem; font-weight: 600; color: #374151; }
        .health-badge { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 600; padding: 6px 12px; border-radius: 20px; }
        .health-badge.online { color: #059669; background: #ECFDF5; }
        .health-badge.degraded { color: #F59E0B; background: #FFFBEB; }
        .health-dot { width: 8px; height: 8px; background: #10B981; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .health-bars { display: flex; flex-direction: column; gap: 12px; }
        .health-item { display: grid; grid-template-columns: 100px 1fr 40px; align-items: center; gap: 12px; font-size: 0.813rem; color: #6B7280; }
        .health-bar { height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden; }
        .health-fill { height: 100%; background: linear-gradient(90deg, #10B981 0%, #34D399 100%); border-radius: 3px; }

        .stat-breakdown {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px dashed #E5E7EB;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }
        .breakdown-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6B7280;
        }
        .breakdown-value {
          font-weight: 600;
        }

        .platform-summary {
          margin: 32px 0;
        }
        .summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px;
          padding: 28px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.25);
        }
        .summary-item {
          text-align: center;
        }
        .summary-label {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-bottom: 4px;
        }
        .summary-value {
          font-family: 'Outfit', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
        }
        .summary-value.large {
          font-size: 2.5rem;
        }
        .text-success { color: #A7F3D0; }

        @media (max-width: 768px) {
          .summary-card {
            flex-direction: column;
            text-align: center;
          }
          .summary-value.large { font-size: 2rem; }
        }

        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @media (max-width: 1280px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } .stat-value { font-size: 1.75rem; } }
      `}</style>
    </div>
  );
};

export default AdminOverview;