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

// Payment Form Component
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
      // Create donation and payment intent
      const response = await fetch('/api/payment/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      });

      const donationResult = await response.json();

      if (!donationResult.success) {
        throw new Error(donationResult.error);
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: donationResult.payment.clientSecret,
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
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(donationResult);
      } else if (paymentIntent.status === 'requires_action') {
        setMessage('Please complete the additional authentication step.');
      }

    } catch (error) {
      onError(error.message);
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
  const [step, setStep] = useState('amount'); // amount, payment, success
  const [stripePromise, setStripePromise] = useState(null);
  const [donationData, setDonationData] = useState({
    campaignId: campaign.id || campaign._id,
    amount: 50,
    donorName: currentUser?.username || '',
    donorEmail: currentUser?.email || '',
    message: '',
    isAnonymous: false
  });
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  useEffect(() => {
    // Initialize Stripe
    const initializeStripe = async () => {
      try {
        const response = await fetch('/api/payment/config');
        const config = await response.json();
        setStripePromise(loadStripe(config.config.publishableKey));
      } catch (error) {
        console.error('Error loading Stripe:', error);
        setError('Failed to load payment system');
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
    if (donationData.amount < 5) {
      setError('Minimum donation amount is RM 5.00');
      return;
    }
    if (donationData.amount > 100000) {
      setError('Maximum donation amount is RM 100,000');
      return;
    }
    if (!donationData.donorEmail) {
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
    setStep('amount');
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

  const options = {
    clientSecret,
    appearance,
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
            min="5"
            max="100000"
            step="0.01"
            placeholder="0.00"
            value={donationData.amount}
            onChange={(e) => handleAmountSelect(parseFloat(e.target.value) || 0)}
            className="amount-input"
          />
        </div>
      </div>

      <div className="donor-info">
        <div className="form-group">
          <label htmlFor="donor-name">Your Name</label>
          <input
            id="donor-name"
            type="text"
            value={donationData.donorName}
            onChange={(e) => setDonationData({...donationData, donorName: e.target.value})}
            placeholder="Enter your name"
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

        <div className="anonymous-toggle">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={donationData.isAnonymous}
              onChange={(e) => setDonationData({...donationData, isAnonymous: e.target.checked})}
            />
            <span className="checkmark"></span>
            Donate anonymously
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
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="donation-step">
      <h3>Payment Details</h3>
      <div className="payment-summary">
        <p>Donating <strong>{formatCurrency(donationData.amount)}</strong> to "{campaign.name}"</p>
      </div>
      
      {stripePromise ? (
        <Elements stripe={stripePromise} options={options}>
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
            {error && <div className="error-message">{error}</div>}

            {step === 'amount' && renderAmountStep()}
            {step === 'payment' && renderPaymentStep()}
            {step === 'success' && renderSuccessStep()}

            {step === 'amount' && (
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary btn-large"
                  onClick={handleNext}
                  disabled={donationData.amount <= 0}
                >
                  Continue to Payment
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