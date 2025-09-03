import api from './api';

export const campaignService = {
  // Get all public campaigns
  getPublicCampaigns: async () => {
    try {
      const response = await api.get('/campaigns/public');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pending campaigns (for admin)
  getPendingCampaigns: async () => {
    try {
      const response = await api.get('/campaigns/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new campaign
  createCampaign: async (campaignData, idToken) => {
    try {
      const response = await api.post('/campaigns/create', campaignData, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify campaign (admin only)
  verifyCampaign: async (campaignId) => {
    try {
      const response = await api.post(`/campaigns/verify/${campaignId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reject campaign (admin only)
  rejectCampaign: async (campaignId) => {
    try {
      const response = await api.post(`/campaigns/reject/${campaignId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};