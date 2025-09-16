import api from './api';

export const paymentService = {
  // ===== PAYMENT PROCESSING =====
  
  // Create donation and payment intent
  createDonation: async (donationData) => {
    try {
      console.log('PaymentService: Creating donation:', donationData);
      
      // Validate data before sending
      const validation = paymentService.validateDonationData(donationData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Sanitize data
      const sanitizedData = paymentService.sanitizeDonationData(donationData);
      
      const response = await api.post('/payment/donate', sanitizedData);
      
      console.log('PaymentService: Donation created successfully:', response.data);
      
      // Validate response structure based on your API docs
      if (!response.data.success) {
        throw new Error(response.data.error || 'Donation creation failed');
      }
      
      if (!response.data.payment?.clientSecret) {
        throw new Error('Invalid response: missing payment client secret');
      }
      
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error creating donation:', error);
      
      // Enhanced error handling for port 8080/api backend
      if (error.response?.status === 400) {
        throw error.response.data || { error: 'Invalid donation data provided' };
      } else if (error.response?.status === 404) {
        throw { error: 'Payment endpoint not found. Verify backend is running on port 8080/api' };
      } else if (error.response?.status >= 500) {
        throw { error: 'Server error. Please try again later.' };
      } else if (error.code === 'ECONNREFUSED') {
        throw { error: 'Cannot connect to backend. Ensure server is running on port 8080' };
      }
      
      throw error.response?.data || { error: error.message || 'Unknown error occurred' };
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
      throw error.response?.data || { error: error.message };
    }
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, paymentMethodId = null) => {
    try {
      console.log('PaymentService: Confirming payment:', { paymentIntentId, paymentMethodId });
      
      if (!paymentIntentId) {
        throw new Error('Payment intent ID is required');
      }
      
      const response = await api.post('/payment/confirm', {
        paymentIntentId,
        paymentMethodId
      });
      
      console.log('PaymentService: Payment confirmed:', response.data);
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error confirming payment:', error);
      throw error.response?.data || { error: error.message };
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
      throw error.response?.data || { error: error.message };
    }
  },

  // ===== PAYMENT CONFIGURATION & UTILITIES =====

  // Get payment configuration with port 8080/api optimization
  getPaymentConfig: async () => {
    try {
      console.log('PaymentService: Getting payment config from port 8080/api...');
      const response = await api.get('/payment/config');
      
      console.log('PaymentService: Config response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get payment config');
      }
      
      // Validate required config fields based on your API docs
      if (!response.data.config?.publishableKey) {
        throw new Error('Invalid config: missing publishable key');
      }
      
      // Log config details for debugging
      console.log('PaymentService: Stripe key found:', response.data.config.publishableKey.substring(0, 20) + '...');
      console.log('PaymentService: Supported methods:', response.data.config.supportedPaymentMethods);
      console.log('PaymentService: Currency:', response.data.config.currency);
      
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error getting payment config:', error);
      
      // Enhanced error handling for port 8080
      if (error.code === 'ECONNREFUSED') {
        throw { error: 'Cannot connect to backend on port 8080. Please ensure your server is running.' };
      }
      
      // Fallback configuration for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('PaymentService: Using fallback payment configuration');
        const fallbackKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
        
        if (fallbackKey) {
          return {
            success: true,
            config: {
              publishableKey: fallbackKey,
              supportedCurrencies: ['MYR', 'USD', 'SGD'],
              supportedPaymentMethods: ['card', 'fpx', 'grabpay', 'paynow'],
              minimumAmount: 1.0,
              maximumAmount: 100000.0,
              currency: 'MYR',
              country: 'MY'
            }
          };
        }
      }
      
      throw error.response?.data || { error: error.message };
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
      throw error.response?.data || { error: error.message };
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
      throw error.response?.data || { error: error.message };
    }
  },

  // Get donation by ID
  getDonationById: async (donationId) => {
    try {
      if (!donationId) {
        throw new Error('Donation ID is required');
      }
      
      const response = await api.get(`/donations/${donationId}`);
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching donation:', error);
      throw error.response?.data || { error: error.message };
    }
  },

  // Get donations for a campaign
  getCampaignDonations: async (campaignId, params = {}) => {
    try {
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }
      
      const response = await api.get(`/donations/campaign/${campaignId}`, { params });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching campaign donations:', error);
      throw error.response?.data || { error: error.message };
    }
  },

  // Get donations by donor
  getDonorDonations: async (donorId, params = {}) => {
    try {
      if (!donorId) {
        throw new Error('Donor ID is required');
      }
      
      const response = await api.get(`/donations/donor/${donorId}`, { params });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching donor donations:', error);
      throw error.response?.data || { error: error.message };
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
      throw error.response?.data || { error: error.message };
    }
  },

  // Get platform donation statistics
  getDonationStatistics: async () => {
    try {
      const response = await api.get('/donations/statistics');
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching donation statistics:', error);
      throw error.response?.data || { error: error.message };
    }
  },

  // Get donation analytics (admin)
  getDonationAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/donations/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching donation analytics:', error);
      throw error.response?.data || { error: error.message };
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
      throw error.response?.data || { error: error.message };
    }
  },

  // ===== CAMPAIGN-SPECIFIC DONATION DATA =====

  // Get donations with messages for a campaign
  getCampaignDonationMessages: async (campaignId, params = {}) => {
    try {
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }
      
      const response = await api.get(`/donations/campaign/${campaignId}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching campaign donation messages:', error);
      throw error.response?.data || { error: error.message };
    }
  },

  // Get top donors for a campaign
  getCampaignTopDonors: async (campaignId, limit = 10) => {
    try {
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }
      
      const response = await api.get(`/donations/campaign/${campaignId}/top-donors`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error fetching top donors:', error);
      throw error.response?.data || { error: error.message };
    }
  },

  // Search donations
  searchDonations: async (query, params = {}) => {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query is required');
      }
      
      const response = await api.get('/donations/search', {
        params: { query: query.trim(), ...params }
      });
      return response.data;
    } catch (error) {
      console.error('PaymentService: Error searching donations:', error);
      throw error.response?.data || { error: error.message };
    }
  },

  // ===== UTILITY METHODS =====

  // Format currency for Malaysian users
  formatCurrency: (amount, currency = 'MYR') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }).format(0);
    }
    
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(Number(amount));
  },

  // Calculate completion percentage
  calculateCompletionPercentage: (raisedAmount, goalAmount) => {
    if (!goalAmount || goalAmount === 0) return 0;
    if (!raisedAmount || raisedAmount < 0) return 0;
    return Math.min((raisedAmount / goalAmount) * 100, 100);
  },

  // Enhanced validation for donation amount based on your API specs
  validateDonationAmount: (amount, minAmount = 1.0, maxAmount = 100000.0) => {
    if (amount === null || amount === undefined || amount === '') {
      return { valid: false, error: 'Please enter an amount' };
    }
    
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: 'Please enter a valid amount' };
    }
    
    if (numAmount < minAmount) {
      return { 
        valid: false, 
        error: `Minimum donation amount is ${paymentService.formatCurrency(minAmount)}` 
      };
    }
    
    if (numAmount > maxAmount) {
      return { 
        valid: false, 
        error: `Maximum donation amount is ${paymentService.formatCurrency(maxAmount)}` 
      };
    }
    
    // Check for reasonable decimal places (max 2)
    if (numAmount.toString().includes('.') && numAmount.toString().split('.')[1].length > 2) {
      return { valid: false, error: 'Amount cannot have more than 2 decimal places' };
    }
    
    return { valid: true };
  },

  // Comprehensive validation for donation data matching your API
  validateDonationData: (donationData) => {
    const errors = [];
    
    // Required fields based on your API documentation
    if (!donationData.campaignId) {
      errors.push('Campaign ID is required');
    }
    
    if (!donationData.donorName || donationData.donorName.trim().length === 0) {
      errors.push('Donor name is required');
    }
    
    if (!donationData.donorEmail || donationData.donorEmail.trim().length === 0) {
      errors.push('Donor email is required');
    }
    
    // Email validation
    if (donationData.donorEmail) {
      const emailValidation = paymentService.validateEmail(donationData.donorEmail);
      if (!emailValidation.valid) {
        errors.push(emailValidation.error);
      }
    }
    
    // Amount validation based on your API specs
    const amountValidation = paymentService.validateDonationAmount(donationData.amount);
    if (!amountValidation.valid) {
      errors.push(amountValidation.error);
    }
    
    // Name length validation
    if (donationData.donorName && donationData.donorName.trim().length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }
    
    // Message length validation
    if (donationData.message && donationData.message.length > 500) {
      errors.push('Message cannot exceed 500 characters');
    }
    
    // Type validation for optional fields
    if (donationData.isAnonymous !== undefined && typeof donationData.isAnonymous !== 'boolean') {
      errors.push('isAnonymous must be true or false');
    }
    
    if (donationData.receiveUpdates !== undefined && typeof donationData.receiveUpdates !== 'boolean') {
      errors.push('receiveUpdates must be true or false');
    }
    
    if (errors.length > 0) {
      return { valid: false, error: errors.join(', ') };
    }
    
    return { valid: true };
  },

  // Validate email format
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      valid: emailRegex.test(email),
      error: emailRegex.test(email) ? null : 'Please enter a valid email address'
    };
  },

  // Sanitize donation data before sending to your API
  sanitizeDonationData: (donationData) => {
    return {
      campaignId: donationData.campaignId,
      amount: parseFloat(donationData.amount),
      donorName: donationData.donorName?.trim(),
      donorEmail: donationData.donorEmail?.trim().toLowerCase(),
      donorId: donationData.donorId || null,
      message: donationData.message?.trim() || '',
      isAnonymous: Boolean(donationData.isAnonymous),
      receiveUpdates: Boolean(donationData.receiveUpdates)
    };
  },

  // Generate donation receipt data
  generateReceiptData: (donation, campaign) => {
    if (!donation || !campaign) {
      throw new Error('Donation and campaign data are required');
    }
    
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
  },

  // Check if backend on port 8080 is reachable
  testConnection: async () => {
    try {
      console.log('PaymentService: Testing connection to port 8080...');
      const response = await api.get('/health');
      console.log('PaymentService: Connection test successful');
      return { 
        connected: true, 
        status: response.status,
        message: 'Backend connection successful on port 8080'
      };
    } catch (error) {
      console.error('PaymentService: Connection test failed:', error);
      return { 
        connected: false, 
        error: error.message,
        message: 'Backend connection failed on port 8080'
      };
    }
  },

  // Get predefined donation amounts
  getPredefinedAmounts: () => {
    return [25, 50, 100, 250, 500, 1000];
  },

  // Format error messages for user display
  formatErrorMessage: (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.error) {
      return error.error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  },

  // Get supported payment methods based on your API
  getSupportedPaymentMethods: () => {
    return ['card', 'fpx', 'grabpay', 'paynow'];
  },

  // Get supported currencies based on your API
  getSupportedCurrencies: () => {
    return ['MYR', 'USD', 'SGD'];
  }
};

// Development and debugging tools for port 8080
if (process.env.NODE_ENV === 'development') {
  window.paymentServiceTest = {
    // Test connection to port 8080
    testConnection: paymentService.testConnection,
    
    // Test payment config endpoint
    testConfig: async () => {
      try {
        console.log('Testing payment config on port 8080...');
        const config = await paymentService.getPaymentConfig();
        console.log('Config test successful:', config);
        return config;
      } catch (error) {
        console.error('Config test failed:', error);
        throw error;
      }
    },
    
    // Test donation creation
    testDonation: async (campaignId = 'test-campaign') => {
      const testData = {
        campaignId,
        amount: 50,
        donorName: 'Test Donor',
        donorEmail: 'test@example.com',
        message: 'Test donation message',
        isAnonymous: false,
        receiveUpdates: true
      };
      
      console.log('Testing donation creation with:', testData);
      
      try {
        const result = await paymentService.createDonation(testData);
        console.log('Test donation result:', result);
        return result;
      } catch (error) {
        console.error('Test donation failed:', error);
        throw error;
      }
    },
    
    // Validate various inputs
    validateAmount: paymentService.validateDonationAmount,
    validateEmail: paymentService.validateEmail,
    validateDonationData: paymentService.validateDonationData,
    formatCurrency: paymentService.formatCurrency,
    
    // Quick API endpoint tests
    testAllEndpoints: async () => {
      const endpoints = [
        '/payment/config',
        '/health'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Testing ${endpoint}...`);
          const response = await fetch(`http://localhost:8080${endpoint}`);
          console.log(`${endpoint}: ${response.status} ${response.ok ? 'OK' : 'FAILED'}`);
        } catch (error) {
          console.error(`${endpoint}: ERROR -`, error.message);
        }
      }
    }
  };
  
  // Auto-test connection on load
  console.log('PaymentService loaded for port 8080. Run paymentServiceTest.testConnection() to verify connection.');
}

export default paymentService;