import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/DonationModal.css';

// Payment Form Component - Fixed to work with your API
const PaymentForm = ({ donationData, onSuccess, onError, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      console.log('🔄 Creating donation with your API...');
      
      // Step 1: Create donation using your existing API
      const donationResponse = await fetch('/api/payment/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: donationData.campaignId,
          amount: donationData.amount,
          donorName: donationData.donorName,
          donorEmail: donationData.donorEmail,
          donorId: donationData.donorId || null, // Optional
          message: donationData.message || '', // Optional
          isAnonymous: donationData.isAnonymous,
          receiveUpdates: donationData.receiveUpdates
        })
      });

      const donationResult = await donationResponse.json();
      
      if (!donationResult.success) {
        throw new Error(donationResult.error || 'Failed to create donation');
      }

      console.log('✅ Donation created:', donationResult);

      // Step 2: Confirm payment with Stripe using the clientSecret from your API
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: donationResult.payment.clientSecret, // Your API should return this
        confirmParams: {
          return_url: `${window.location.origin}/donation/success`,
          payment_method_data: {
            billing_details: {
              name: donationData.donorName,
              email: donationData.donorEmail,
            }
          }
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('❌ Stripe payment error:', error);
        onError(`Payment failed: ${error.message}`);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent.id);
        onSuccess(donationResult);
      } else if (paymentIntent.status === 'requires_action') {
        setMessage('Please complete the additional authentication step.');
      } else {
        console.warn('⚠️ Unexpected payment status:', paymentIntent.status);
        setMessage(`Payment status: ${paymentIntent.status}`);
      }

    } catch (error) {
      console.error('❌ Payment process error:', error);
      
      // Better error handling for different scenarios
      if (error.message.includes('<!DOCTYPE')) {
        onError('Backend API not available. Please check if your server is running.');
      } else if (error.message.includes('404')) {
        onError('Payment endpoint not found. Please check your API configuration.');
      } else {
        onError(error.message || 'Payment process failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <PaymentElement 
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'fpx', 'grabpay']
        }}
      />
      
      {message && (
        <div className="payment-message">{message}</div>
      )}
      
      <div className="form-actions">
        <button 
          type="button" 
          className="btn btn-outline"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isProcessing || !stripe || !elements}
          className="btn btn-primary btn-large"
        >
          {isProcessing ? 'Processing...' : `Donate RM ${donationData.amount}`}
        </button>
      </div>
    </form>
  );
};

// Main Donation Modal Component
const DonationModal = ({ campaign, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('amount');
  const [stripePromise, setStripePromise] = useState(null);
  const [donationData, setDonationData] = useState({
    campaignId: campaign.id || campaign._id,
    amount: 50,
    donorName: currentUser?.username || '',
    donorEmail: currentUser?.email || '',
    donorId: currentUser?.id || currentUser?._id || null, // Include donorId if available
    message: '',
    isAnonymous: false,
    receiveUpdates: true // Default to true as per your API
  });
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  useEffect(() => {
    // Initialize Stripe - Get config from your existing API
    const initializeStripe = async () => {
      try {
        console.log('🔄 Getting Stripe configuration...');
        
        // Try to get config from your API (if this endpoint exists)
        const response = await fetch('/api/payment/config');
        
        if (response.ok) {
          const config = await response.json();
          if (config.success && config.config?.publishableKey) {
            const stripeInstance = await loadStripe(config.config.publishableKey);
            setStripePromise(stripeInstance);
            console.log('✅ Stripe initialized from API config');
            return;
          }
        }
        
        // Fallback: Use environment variable or hardcoded test key
        const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
        
        if (publishableKey) {
          const stripeInstance = await loadStripe(publishableKey);
          setStripePromise(stripeInstance);
          console.log('✅ Stripe initialized from environment variable');
        } else {
          // For testing only - replace with your actual test key
          console.warn('⚠️ No Stripe key found. Using test key for development.');
          const testKey = 'pk_test_51234567890'; // Replace with your actual test key
          const stripeInstance = await loadStripe(testKey);
          setStripePromise(stripeInstance);
        }
        
      } catch (error) {
        console.error('❌ Error initializing Stripe:', error);
        setError(`Failed to load payment system: ${error.message}`);
      }
    };

    initializeStripe();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount || 0);
  };

  const handleAmountSelect = (amount) => {
    setDonationData({ ...donationData, amount });
    setError('');
  };

  const handleNext = () => {
    // Validation
    if (donationData.amount < 1 || donationData.amount > 100000) {
      setError('Amount must be between RM 1.00 and RM 100,000');
      return;
    }
    
    if (!donationData.donorName.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!donationData.donorEmail.trim()) {
      setError('Email is required');
      return;
    }

    setStep('payment');
  };

  const handlePaymentSuccess = (result) => {
    setStep('success');
    setTimeout(() => {
      onSuccess(result);
      onClose();
    }, 2000);
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setStep('amount'); // Go back to amount step
  };

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#007bff',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '8px',
    }
  };

  const renderAmountStep = () => (
    <div className="donation-step">
      <h3>Choose Donation Amount</h3>
      
      <div className="amount-buttons">
        {predefinedAmounts.map(amount => (
          <button
            key={amount}
            type="button"
            className={`amount-btn ${donationData.amount === amount ? 'selected' : ''}`}
            onClick={() => handleAmountSelect(amount)}
          >
            {formatCurrency(amount)}
          </button>
        ))}
      </div>

      <div className="custom-amount">
        <label htmlFor="custom-amount">Or enter custom amount:</label>
        <div className="amount-input-container">
          <span className="currency-symbol">RM</span>
          <input
            id="custom-amount"
            type="number"
            min="1"
            max="100000"
            step="0.01"
            placeholder="0.00"
            value={donationData.amount}
            onChange={(e) => handleAmountSelect(parseFloat(e.target.value) || 0)}
            className="amount-input"
          />
        </div>
        <small>Amount between RM 1.00 and RM 100,000</small>
      </div>

      <div className="donor-info">
        <div className="form-group">
          <label htmlFor="donor-name">Your Name *</label>
          <input
            id="donor-name"
            type="text"
            value={donationData.donorName}
            onChange={(e) => setDonationData({...donationData, donorName: e.target.value})}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="donor-email">Email Address *</label>
          <input
            id="donor-email"
            type="email"
            value={donationData.donorEmail}
            onChange={(e) => setDonationData({...donationData, donorEmail: e.target.value})}
            placeholder="Enter your email"
            required
          />
          <small>Required for donation receipt</small>
        </div>

        <div className="form-group">
          <label htmlFor="donation-message">Message (Optional)</label>
          <textarea
            id="donation-message"
            value={donationData.message}
            onChange={(e) => setDonationData({...donationData, message: e.target.value})}
            placeholder="Leave a message of support..."
            rows="3"
            maxLength="500"
          />
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={donationData.isAnonymous}
              onChange={(e) => setDonationData({...donationData, isAnonymous: e.target.checked})}
            />
            <span className="checkmark"></span>
            Donate anonymously
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={donationData.receiveUpdates}
              onChange={(e) => setDonationData({...donationData, receiveUpdates: e.target.checked})}
            />
            <span className="checkmark"></span>
            Receive campaign updates via email
          </label>
        </div>
      </div>

      <div className="donation-summary">
        <div className="summary-line">
          <span>Donation Amount:</span>
          <span>{formatCurrency(donationData.amount)}</span>
        </div>
        <div className="summary-line">
          <span>To Campaign:</span>
          <span>{campaign.name}</span>
        </div>
        <div className="summary-line">
          <span>Donor:</span>
          <span>{donationData.isAnonymous ? 'Anonymous' : donationData.donorName}</span>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="donation-step">
      <h3>Payment Details</h3>
      <div className="payment-summary">
        <p>Donating <strong>{formatCurrency(donationData.amount)}</strong> to "{campaign.name}"</p>
        {donationData.message && (
          <p><em>Message: "{donationData.message}"</em></p>
        )}
      </div>
      
      {stripePromise ? (
        <Elements 
          stripe={stripePromise} 
          options={{
            // Note: clientSecret will be obtained from your /api/payment/donate endpoint
            appearance: appearance
          }}
        >
          <PaymentForm 
            donationData={donationData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onClose={onClose}
          />
        </Elements>
      ) : (
        <div>Loading payment form...</div>
      )}
    </div>
  );

  const renderSuccessStep = () => (
    <div className="donation-step success">
      <div className="success-icon">🎉</div>
      <h3>Thank You!</h3>
      <p>Your donation of <strong>{formatCurrency(donationData.amount)}</strong> has been received.</p>
      <p>You will receive a confirmation email shortly.</p>
    </div>
  );

  return (
    <div className="donation-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget && step !== 'payment') {
        onClose();
      }
    }}>
      <div className="donation-modal">
        <div className="modal-header">
          <h2>Support "{campaign.name}"</h2>
          {step !== 'payment' && (
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        <div className="modal-content">
          <div className="campaign-summary">
            <div className="campaign-info">
              <h3>{campaign.name}</h3>
              <p>by {campaign.creatorUsername}</p>
            </div>
            <div className="funding-progress">
              <div className="progress-text">
                {formatCurrency(campaign.raisedAmount)} raised of {formatCurrency(campaign.goalAmount)}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="donation-form">
            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
                {error.includes('Backend API not available') && (
                  <div style={{ marginTop: '10px', fontSize: '12px' }}>
                    <p>Troubleshooting steps:</p>
                    <ol>
                      <li>Make sure your backend server is running</li>
                      <li>Check if <code>/api/payment/donate</code> endpoint exists</li>
                      <li>Verify CORS settings allow requests from localhost:3000</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {step === 'amount' && renderAmountStep()}
            {step === 'payment' && renderPaymentStep()}
            {step === 'success' && renderSuccessStep()}

            {step === 'amount' && (
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary btn-large"
                  onClick={handleNext}
                  disabled={donationData.amount <= 0 || loading}
                >
                  {loading ? 'Loading...' : 'Continue to Payment'}
                </button>
              </div>
            )}
          </div>

          <div className="donation-notice">
            <p>
              <strong>🔒 Secure Payment:</strong> Your payment information is encrypted and secure.
              You will receive a receipt via email after your donation is processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;