import api from './api';

export const campaignService = {
  // Get all public campaigns
  getPublicCampaigns: async () => {
    try {
      const response = await api.get('/campaigns');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get active campaigns only
  getActiveCampaigns: async () => {
    try {
      const response = await api.get('/campaigns/active');
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

  // Get campaign by ID
  getCampaignById: async (id) => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get campaigns by category
  getCampaignsByCategory: async (category) => {
    try {
      const response = await api.get(`/campaigns/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new campaign
  createCampaign: async (campaignData) => {
    try {
      const response = await api.post('/campaigns/create', campaignData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    try {
      const response = await api.put(`/campaigns/${id}`, campaignData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    try {
      const response = await api.delete(`/campaigns/${id}`);
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