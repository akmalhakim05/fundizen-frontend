import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/paymentService';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/components/DonationModal.css';

const DonationModal = ({ campaign, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('amount'); // amount, details, payment, processing, success
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(currentUser?.username || '');
  const [donorEmail, setDonorEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // stripe, bank_transfer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [fees, setFees] = useState(null);

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  useEffect(() => {
    loadPaymentConfig();
  }, []);

  useEffect(() => {
    if (getFinalAmount() >= 5) {
      calculateFees();
    } else {
      setFees(null);
    }
  }, [donationAmount, customAmount]);

  const loadPaymentConfig = async () => {
    try {
      const config = await paymentService.getPaymentConfig();
      setPaymentConfig(config);
    } catch (error) {
      console.error('Error loading payment config:', error);
    }
  };

  const calculateFees = async () => {
    try {
      const amount = getFinalAmount();
      if (amount >= 5) {
        const feeData = await paymentService.calculateFees(amount);
        setFees(feeData);
      }
    } catch (error) {
      console.error('Error calculating fees:', error);
    }
  };

  const formatCurrency = (amount) => {
    return paymentService.formatCurrency(amount);
  };

  const handleAmountSelect = (amount) => {
    setDonationAmount(amount.toString());
    setCustomAmount('');
    setError('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setDonationAmount(value);
    setError('');
  };

  const getFinalAmount = () => {
    return parseFloat(donationAmount) || 0;
  };

  const getTotalAmount = () => {
    const amount = getFinalAmount();
    const processingFee = fees?.processingFee || 0;
    return amount + processingFee;
  };

  const validateAmount = () => {
    const validation = paymentService.validateDonationAmount(getFinalAmount());
    if (!validation.valid) {
      setError(validation.error);
      return false;
    }
    return true;
  };

  const validateDetails = () => {
    if (!donorName.trim() && !isAnonymous) {
      setError('Please enter your name or choose to donate anonymously');
      return false;
    }

    if (!donorEmail.trim()) {
      setError('Email address is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setError('');
    
    if (step === 'amount') {
      if (validateAmount()) {
        setStep('details');
      }
    } else if (step === 'details') {
      if (validateDetails()) {
        setStep('payment');
      }
    }
  };

  const handleBack = () => {
    setError('');
    
    if (step === 'details') {
      setStep('amount');
    } else if (step === 'payment') {
      setStep('details');
    }
  };

  const handlePaymentSubmit = async () => {
    if (!validateDetails()) return;

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const donationData = {
        campaignId: campaign.id,
        amount: getFinalAmount(),
        currency: 'MYR',
        donorName: isAnonymous ? 'Anonymous' : donorName.trim(),
        donorEmail: donorEmail.trim(),
        message: message.trim(),
        isAnonymous,
        paymentMethod
      };

      let result;

      if (paymentMethod === 'stripe') {
        // Create Stripe checkout session
        result = await paymentService.createCheckoutSession(donationData);
        
        if (result.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = result.checkoutUrl;
          return;
        }
      } else if (paymentMethod === 'bank_transfer') {
        // Create donation with bank transfer instructions
        result = await paymentService.createDonation({
          ...donationData,
          paymentMethod: 'bank_transfer'
        });
        
        setStep('success');
        
        // Show bank transfer instructions
        setTimeout(() => {
          onSuccess({
            ...result,
            requiresBankTransfer: true,
            bankTransferInstructions: result.bankTransferInstructions
          });
        }, 2000);
        return;
      }

      // Fallback: create donation record
      result = await paymentService.createDonation(donationData);
      
      setStep('success');
      
      setTimeout(() => {
        onSuccess(result);
      }, 2000);

    } catch (error) {
      console.error('Payment submission error:', error);
      setError(error.error || error.message || 'Failed to process donation. Please try again.');
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && step !== 'processing') {
      onClose();
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'amount', label: 'Amount', icon: '💰' },
      { id: 'details', label: 'Details', icon: '📝' },
      { id: 'payment', label: 'Payment', icon: '💳' }
    ];

    return (
      <div className="step-indicator">
        {steps.map((stepItem, index) => (
          <div key={stepItem.id} className={`step-item ${step === stepItem.id ? 'active' : ''} ${steps.findIndex(s => s.id === step) > index ? 'completed' : ''}`}>
            <div className="step-circle">
              {steps.findIndex(s => s.id === step) > index ? '✓' : stepItem.icon}
            </div>
            <span className="step-label">{stepItem.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderAmountStep = () => (
    <div className="donation-step">
      <h3>Choose Donation Amount</h3>
      
      <div className="amount-buttons">
        {predefinedAmounts.map(amount => (
          <button
            key={amount}
            type="button"
            className={`amount-btn ${donationAmount === amount.toString() ? 'selected' : ''}`}
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
            step="0.01"
            placeholder="0.00"
            value={customAmount}
            onChange={handleCustomAmountChange}
            className="amount-input"
          />
        </div>
      </div>

      {getFinalAmount() > 0 && (
        <div className="amount-summary">
          <div className="amount-line">
            <span>Donation Amount:</span>
            <span>{formatCurrency(getFinalAmount())}</span>
          </div>
          {fees && (
            <div className="amount-line">
              <span>Processing Fee:</span>
              <span>{formatCurrency(fees.processingFee)}</span>
            </div>
          )}
          <div className="amount-line total">
            <span>Total:</span>
            <span>{formatCurrency(getTotalAmount())}</span>
          </div>
        </div>
      )}

      {fees && (
        <div className="fee-notice">
          <small>
            Processing fee helps cover payment processing costs. 
            {fees.platformFeePercentage > 0 && ` Platform fee: ${fees.platformFeePercentage}%`}
          </small>
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="donation-step">
      <h3>Donor Information</h3>
      
      <div className="anonymous-toggle">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          <span className="checkmark"></span>
          Donate anonymously
        </label>
      </div>

      {!isAnonymous && (
        <div className="form-group">
          <label htmlFor="donor-name">Your Name *</label>
          <input
            id="donor-name"
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Enter your name"
            required={!isAnonymous}
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="donor-email">Email Address *</label>
        <input
          id="donor-email"
          type="email"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <small>Required for donation receipt and updates</small>
      </div>

      <div className="form-group">
        <label htmlFor="donation-message">Message (Optional)</label>
        <textarea
          id="donation-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave a message of support..."
          rows="3"
          maxLength="500"
        />
        <small>{message.length}/500 characters</small>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="donation-step">
      <h3>Payment Method</h3>
      
      <div className="payment-methods">
        {paymentConfig?.stripeEnabled && (
          <label className="payment-method">
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className="payment-option">
              <div className="payment-icon">💳</div>
              <div className="payment-info">
                <strong>Credit/Debit Card</strong>
                <small>Secure payment via Stripe</small>
              </div>
            </div>
          </label>
        )}

        {paymentConfig?.bankTransferEnabled && (
          <label className="payment-method">
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              checked={paymentMethod === 'bank_transfer'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className="payment-option">
              <div className="payment-icon">🏦</div>
              <div className="payment-info">
                <strong>Bank Transfer</strong>
                <small>Direct bank transfer (manual verification)</small>
              </div>
            </div>
          </label>
        )}
      </div>

      <div className="donation-summary">
        <h4>Donation Summary</h4>
        <div className="summary-line">
          <span>To:</span>
          <span>{campaign.name}</span>
        </div>
        <div className="summary-line">
          <span>Amount:</span>
          <span>{formatCurrency(getFinalAmount())}</span>
        </div>
        <div className="summary-line">
          <span>Donor:</span>
          <span>{isAnonymous ? 'Anonymous' : donorName}</span>
        </div>
        {message && (
          <div className="summary-line">
            <span>Message:</span>
            <span className="message-preview">"{message.substring(0, 50)}{message.length > 50 ? '...' : ''}"</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="donation-step processing">
      <LoadingSpinner />
      <h3>Processing Your Donation</h3>
      <p>Please wait while we process your generous contribution...</p>
      <p><small>Do not close this window or refresh the page.</small></p>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="donation-step success">
      <div className="success-icon">🎉</div>
      <h3>Thank You!</h3>
      <p>Your donation of <strong>{formatCurrency(getFinalAmount())}</strong> has been received.</p>
      <p>You will receive a confirmation email shortly.</p>
    </div>
  );

  if (step === 'processing') {
    return (
      <div className="donation-modal-overlay">
        <div className="donation-modal processing">
          {renderProcessingStep()}
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="donation-modal-overlay">
        <div className="donation-modal success">
          {renderSuccessStep()}
        </div>
      </div>
    );
  }

  return (
    <div className="donation-modal-overlay" onClick={handleOverlayClick}>
      <div className="donation-modal">
        <div className="modal-header">
          <h2>Support "{campaign.name}"</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
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

          {renderStepIndicator()}

          <div className="donation-form">
            {error && <div className="error-message">{error}</div>}

            {step === 'amount' && renderAmountStep()}
            {step === 'details' && renderDetailsStep()}
            {step === 'payment' && renderPaymentStep()}

            <div className="form-actions">
              {step !== 'amount' && (
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Back
                </button>
              )}
              
              {step === 'amount' && (
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}

              {step !== 'payment' ? (
                <button 
                  type="button" 
                  className="btn btn-primary btn-large"
                  onClick={handleNext}
                  disabled={loading || getFinalAmount() <= 0}
                >
                  Continue
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-primary btn-large"
                  onClick={handlePaymentSubmit}
                  disabled={loading || getFinalAmount() <= 0}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Processing...
                    </>
                  ) : (
                    `Donate ${formatCurrency(getFinalAmount())}`
                  )}
                </button>
              )}
            </div>
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