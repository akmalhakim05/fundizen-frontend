// src/components/admin/tabs/AdminOverview.js
import React from 'react';
import { FileText, Users, DollarSign, AlertCircle, TrendingUp, LayoutDashboard } from 'lucide-react';

const AdminOverview = ({ data = {} }) => {
  // <-- THIS WAS MISSING BEFORE
  const stats = [
    { label: 'Total Campaigns', value: data.totalCampaigns || 0, icon: FileText, color: 'bg-blue-500' },
    { label: 'Pending Approval', value: data.pendingCount || 0, icon: AlertCircle, color: 'bg-orange-500', urgent: true },
    { label: 'Active Users', value: data.totalUsers || 0, icon: Users, color: 'bg-emerald-500' },
    { label: 'Total Raised', value: `RM ${(data.totalRaised || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LayoutDashboard size={36} />
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening on Fundizen today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                <stat.icon size={24} />
              </div>
              {stat.urgent && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  Action Needed
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            {stat.label.includes('Raised') && (
              <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1 font-medium">
                <TrendingUp size={16} /> +12.5% from last month
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Keep the rest of your original sections (Recent Activity, Quick Actions, …) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="text-center text-gray-500 py-8">
            <p>No recent activity to display</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-5 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
              Review Pending Campaigns
            </button>
            <button className="w-full text-left px-5 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium">
              Export Reports
            </button>
            <button className="w-full text-left px-5 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium">
              View System Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;