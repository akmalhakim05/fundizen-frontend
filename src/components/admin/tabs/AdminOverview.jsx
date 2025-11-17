// src/components/admin/tabs/AdminOverview.jsx
import React from 'react';
import { 
  LayoutDashboard, FileText, Users, DollarSign, 
  AlertCircle, TrendingUp, Clock, Download, Settings 
} from 'lucide-react';

const AdminOverview = ({ data = {} }) => {
  const stats = [
    { 
      label: 'Total Campaigns', 
      value: data.totalCampaigns || 0, 
      icon: FileText, 
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/25'
    },
    { 
      label: 'Pending Approval', 
      value: data.pendingCount || 0, 
      icon: AlertCircle, 
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/25',
      urgent: true 
    },
    { 
      label: 'Active Users', 
      value: data.totalUsers || 0, 
      icon: Users, 
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/25'
    },
    { 
      label: 'Total Raised', 
      value: `RM ${(data.totalRaised || 0).toLocaleString()}`, 
      icon: DollarSign, 
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/25',
      trend: '+12.5%'
    },
  ];

  return (
    <div className="admin-overview">
      {/* Header */}
      <div className="header-section">
        <h1>
          <LayoutDashboard size={40} />
          Dashboard Overview
        </h1>
        <p>Welcome back, Admin! Here's what's happening on Fundizen today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon size={28} />
              </div>
              {stat.urgent && (
                <span className="urgent-badge">
                  Action Required
                </span>
              )}
            </div>
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            {stat.trend && (
              <div className="trend-up">
                <TrendingUp size={18} />
                {stat.trend} from last month
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Section: Recent Activity + Quick Actions */}
      <div className="content-grid">
        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>
            <Clock size={24} />
            Recent Activity
          </h2>
          <div className="empty-state">
            <div className="placeholder-icon">
              <FileText size={64} />
            </div>
            <p className="text-lg font-medium text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500">New actions will appear here in real-time</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>
            <Settings size={24} />
            Quick Actions
          </h2>
          <div className="actions-list">
            <button className="action-btn primary">
              Review Pending Campaigns
            </button>
            <button className="action-btn success">
              <Download size={20} /> Export Monthly Report
            </button>
            <button className="action-btn neutral">
              View System Logs
            </button>
          </div>
        </div>
      </div>

      {/* All Styles Inside */}
      <style jsx>{`
        .admin-overview {
          padding: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .header-section h1 {
          font-size: 2.8rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 0 0 12px 0;
        }

        .header-section p {
          font-size: 1.15rem;
          color: #64748b;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 28px;
          margin: 48px 0;
        }

        .stat-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 10px 25px var(--tw-shadow-color);
        }

        .urgent-badge {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 50px;
          animation: pulse 2.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .stat-label {
          color: #64748b;
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .trend-up {
          margin-top: 16px;
          color: #10b981;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
          margin-top: 20px;
        }

        .recent-activity,
        .quick-actions {
          background: white;
          border-radius: 24px;
          padding: 36px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .recent-activity h2,
        .quick-actions h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #94a3b8;
        }

        .placeholder-icon {
          margin-bottom: 20px;
          opacity: 0.4;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .action-btn {
          padding: 18px 24px;
          border-radius: 18px;
          font-weight: 600;
          font-size: 1.05rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #1e6cff, #4c8aff);
          color: white;
        }

        .action-btn.success {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
        }

        .action-btn.neutral {
          background: linear-gradient(135deg, #64748b, #94a3b8);
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .header-section h1 {
            font-size: 2.4rem;
          }
        }

        @media (max-width: 640px) {
          .admin-overview {
            padding: 24px;
          }
          .stat-card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOverview;