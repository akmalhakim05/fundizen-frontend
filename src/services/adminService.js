// src/services/adminService.js
import api from './api';

/**
 * Admin Dashboard & System Overview Service
 * Dedicated service for Admin Panel Dashboard only
 */
const adminService = {
  // ==================== DASHBOARD OVERVIEW ====================

  /**
   * Get main dashboard statistics (cards & quick stats)
   * GET /api/admin/dashboard
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error.response?.data || { message: 'Failed to load dashboard statistics' };
    }
  },

  /**
   * Get detailed system statistics (charts, analytics, breakdowns)
   * GET /api/admin/stats
   */
  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      throw error.response?.data || { message: 'Failed to load system analytics' };
    }
  },

  // ==================== REAL-TIME ACTIVITY ====================

  /**
   * Get recent platform activity (latest donations, signups, campaigns)
   * GET /api/admin/activity/recent
   */
  getRecentActivity: async (limit = 20) => {
    try {
      const response = await api.get('/admin/activity/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      throw error.response?.data || { message: 'Failed to load recent activity' };
    }
  },

  /**
   * Get live platform metrics (online users, active campaigns, etc.)
   * GET /api/admin/live
   */
  getLiveMetrics: async () => {
    try {
      const response = await api.get('/admin/live');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch live metrics:', error);
      return {
        onlineUsers: 0,
        activeCampaigns: 0,
        donationsToday: 0,
        revenueToday: 0
      }; // Graceful fallback
    }
  },

  // ==================== QUICK ACTIONS & SUMMARY ====================

  /**
   * Get pending items count (for notification badges)
   * GET /api/admin/pending-summary
   */
  getPendingSummary: async () => {
    try {
      const response = await api.get('/admin/pending-summary');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending summary:', error);
      return {
        pendingCampaigns: 0,
        pendingWithdrawals: 0,
        flaggedDonations: 0,
        supportTickets: 0
      };
    }
  },

  /**
   * Get platform health status
   * GET /api/admin/health
   */
  getPlatformHealth: async () => {
    try {
      const response = await api.get('/admin/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'degraded', uptime: 'N/A', lastChecked: new Date().toISOString() };
    }
  },
};

export default adminService;

// Admin API Endpoints
// /admin/dashboard       -> Quick stats cards (campaigns, users, activity)
// /admin/stats           -> Detailed charts & analytics (overview, campaigns.byCategory, users.byRole)
// /admin/activity/recent -> Latest donations/users/campaigns (activities[])
// /admin/live            -> Real-time counters (onlineUsers, donationsToday)
// /admin/pending-summary -> Badge counts (pendingCampaigns, flaggedDonations)
// /admin/health          -> System status (status: "healthy")