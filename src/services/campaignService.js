// src/services/campaignService.js
import api from './api';

const campaignService = {
  getAllCampaigns: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/admin/campaigns?${params.toString()}`);
  },

  getPendingCampaigns: () => api.get('/admin/campaigns/pending'),

  approveCampaign: (id) => api.post(`/admin/campaigns/${id}/approve`),

  rejectCampaign: (id, reason) =>
    api.post(`/admin/campaigns/${id}/reject`, { reason }),

  bulkApproveCampaigns: (ids) =>
    api.post('/admin/campaigns/bulk/approve', { campaignIds: ids }),

  bulkRejectCampaigns: (ids, reason) =>
    api.post('/admin/campaigns/bulk/reject', { campaignIds: ids, reason }),

  exportCampaigns: () => api.get('/admin/campaigns/export/csv', { responseType: 'blob' }),
};

export default campaignService;