// src/components/admin/tabs/AdminOverview.js
import React from 'react';
import { FileText, Users, DollarSign, AlertCircle, TrendingUp, LayoutDashboard } from 'lucide-react';

const AdminOverview = ({ data = {} }) => {
  const stats = [
    { label: 'Total Campaigns', value: data.totalCampaigns || 0, icon: FileText, color: 'from-blue-500 to-blue-600' },
    { label: 'Pending Approval', value: data.pendingCount || 0, icon: AlertCircle, color: 'from-orange-500 to-red-600', urgent: true },
    { label: 'Active Users', value: data.totalUsers || 0, icon: Users, color: 'from-green-500 to-emerald-600' },
    { label: 'Total Raised', value: `RM ${(data.totalRaised || 0).toLocaleString()}`, icon: DollarSign, color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <LayoutDashboard size={36} />
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening on Fundizen today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                <stat.icon size={28} />
              </div>
              {stat.urgent && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  Requires Action
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
            {stat.label.includes('Raised') && (
              <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                <TrendingUp size={16} /> +12.5% from last month
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="text-center text-gray-500 py-8">
            <p>No recent activity to display</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition font-medium">
              Review Pending Campaigns
            </button>
            <button className="w-full text-left px-5 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition font-medium">
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