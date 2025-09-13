import api from './api';

export const paymentService = {
  // ===== PAYMENT PROCESSING =====
  
  // Create donation and payment intent
  createDonation: async (donationData) => {
    try {
      console.log('PaymentService: Creating donation:', donationData);
      
      const response = await api.post('/payment/donate', donationData);
      
      console.log('PaymentService: Donation created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error creating donation:', error);
      throw error.response?.data || error.message;
    }
  },

  // Create Stripe checkout session
  createCheckoutSession: async (donationData) => {
    try {
      console.log('PaymentService: Creating checkout session:', donationData);
      
      const response = await api.post('/payment/checkout-session', {
        ...donationData,
        successUrl: `${window.location.origin}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/campaign/${donationData.campaignId}?donation=cancelled`
      });
      
      console.log('PaymentService: Checkout session created:', response.data);
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error creating checkout session:', error);
      throw error.response?.data || error.message;
    }
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, paymentMethodId = null) => {
    try {
      console.log('PaymentService: Confirming payment:', { paymentIntentId, paymentMethodId });
      
      const response = await api.post('/payment/confirm', {
        paymentIntentId,
        paymentMethodId
      });
      
      console.log('PaymentService: Payment confirmed:', response.data);
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error confirming payment:', error);
      throw error.response?.data || error.message;
    }
  },

  // Create refund
  createRefund: async (donationId, amount = null, reason = '') => {
    try {
      console.log('PaymentService: Creating refund:', { donationId, amount, reason });
      
      const response = await api.post('/payment/refund', {
        donationId,
        amount,
        reason
      });
      
      console.log('PaymentService: Refund created:', response.data);
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error creating refund:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== PAYMENT CONFIGURATION & UTILITIES =====

  // Get payment configuration
  getPaymentConfig: async () => {
    try {
      const response = await api.get('/payment/config');
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error getting payment config:', error);
      throw error.response?.data || error.message;
    }
  },

  // Calculate payment fees
  calculateFees: async (amount, currency = 'MYR') => {
    try {
      const response = await api.post('/payment/calculate-fees', {
        amount,
        currency
      });
      
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error calculating fees:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== DONATION MANAGEMENT =====

  // Get all donations (admin)
  getAllDonations: async (params = {}) => {
    try {
      const response = await api.get('/donations', { params });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching donations:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get donation by ID
  getDonationById: async (donationId) => {
    try {
      const response = await api.get(`/donations/${donationId}`);
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching donation:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get donations for a campaign
  getCampaignDonations: async (campaignId, params = {}) => {
    try {
      const response = await api.get(`/donations/campaign/${campaignId}`, { params });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching campaign donations:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get donations by donor
  getDonorDonations: async (donorId, params = {}) => {
    try {
      const response = await api.get(`/donations/donor/${donorId}`, { params });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching donor donations:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== DONATION ANALYTICS =====

  // Get recent donations
  getRecentDonations: async (limit = 10, hours = 24) => {
    try {
      const response = await api.get('/donations/recent', {
        params: { limit, hours }
      });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching recent donations:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get platform donation statistics
  getDonationStatistics: async () => {
    try {
      const response = await api.get('/donations/statistics');
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching donation statistics:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get donation analytics (admin)
  getDonationAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/donations/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching donation analytics:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get donation trends
  getDonationTrends: async (months = 6) => {
    try {
      const response = await api.get('/donations/trends', {
        params: { months }
      });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching donation trends:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== CAMPAIGN-SPECIFIC DONATION DATA =====

  // Get donations with messages for a campaign
  getCampaignDonationMessages: async (campaignId, params = {}) => {
    try {
      const response = await api.get(`/donations/campaign/${campaignId}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching campaign donation messages:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get top donors for a campaign
  getCampaignTopDonors: async (campaignId, limit = 10) => {
    try {
      const response = await api.get(`/donations/campaign/${campaignId}/top-donors`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching top donors:', error);
      throw error.response?.data || error.message;
    }
  },

  // Search donations
  searchDonations: async (query, params = {}) => {
    try {
      const response = await api.get('/donations/search', {
        params: { query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error searching donations:', error);
      throw error.response?.data || error.message;
    }
  },

  // ===== UTILITY METHODS =====

  // Format currency for display
  formatCurrency: (amount, currency = 'MYR') => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Calculate completion percentage
  calculateCompletionPercentage: (raisedAmount, goalAmount) => {
    if (!goalAmount || goalAmount === 0) return 0;
    return Math.min((raisedAmount / goalAmount) * 100, 100);
  },

  // Validate donation amount
  validateDonationAmount: (amount, minAmount = 5, maxAmount = 100000) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: 'Please enter a valid amount' };
    }
    
    if (numAmount < minAmount) {
      return { valid: false, error: `Minimum donation amount is ${paymentService.formatCurrency(minAmount)}` };
    }
    
    if (numAmount > maxAmount) {
      return { valid: false, error: `Maximum donation amount is ${paymentService.formatCurrency(maxAmount)}` };
    }
    
    return { valid: true };
  },

  // Generate donation receipt data
  generateReceiptData: (donation, campaign) => {
    return {
      donationId: donation.id,
      campaignName: campaign.name,
      amount: donation.amount,
      currency: donation.currency || 'MYR',
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donationDate: donation.createdAt,
      paymentMethod: donation.paymentMethod,
      transactionId: donation.transactionId,
      receiptUrl: donation.receiptUrl,
      isAnonymous: donation.isAnonymous
    };
  }
};

export default paymentService;