// src/services/statsService.js
import api from './api';

const statsService = {
  // 24. Get Campaign Statistics
  getCampaignStats: (campaignId) =>
    api.get(`/stats/campaigns/${campaignId}`),

  // 25. Get Campaign Analytics
  getCampaignAnalytics: (campaignId, days = 30) =>
    api.get(`/stats/campaigns/${campaignId}/analytics`, { params: { days } }),

  // 26. Get Platform Donation Statistics
  getPlatformDonationStats: () =>
    api.get('/stats/donations/platform'),

  // 27. Get Top Donors for Campaign
  getTopDonors: (campaignId, limit = 10) =>
    api.get(`/stats/donations/campaigns/${campaignId}/top-donors`, {
      params: { limit },
    }),

  // 28. Get Donation Trends (monthly)
  getDonationTrends: (months = 12) =>
    api.get('/stats/donations/trends', { params: { months } }),

  // 29. Get Donation Analytics (Admin Dashboard)
  getDonationAnalytics: () =>
    api.get('/stats/donations/analytics'),

  // 30. Global Food Bank Statistics
  getGlobalFoodBankStats: () =>
    api.get('/stats/foodbank'),

  // 31. User Food Bank Statistics
  getUserFoodBankStats: (userId) =>
    api.get(`/stats/foodbank/user/${userId}`),

  // 32. Food Bank Distribution Statistics
  getFoodBankDistributionStats: () =>
    api.get('/stats/foodbank/distribution'),

  // 33. Global Pickup Statistics
  getGlobalPickupStats: () =>
    api.get('/stats/pickup'),

  // 34. User Pickup Statistics
  getUserPickupStats: (userId) =>
    api.get(`/stats/pickup/user/${userId}`),

  // 35. Food Bank Pickup Statistics
  getFoodBankPickupStats: (foodBankId) =>
    api.get(`/stats/pickup/foodbank/${foodBankId}`),

  // 36. Pickup Distribution Statistics
  getPickupDistributionStats: () =>
    api.get('/stats/pickup/distribution'),
};

export default statsService;