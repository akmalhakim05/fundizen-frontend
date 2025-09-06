import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/components/DonationModal.css';

const DonationModal = ({ campaign, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(currentUser?.username || '');
  const [donorEmail, setDonorEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount || 0);
  };

  const handleAmountSelect = (amount) => {
    setDonationAmount(amount.toString());
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setDonationAmount(value);
  };

  const getFinalAmount = () => {
    return parseFloat(donationAmount) || 0;
  };

  const validateDonation = () => {
    const amount = getFinalAmount();
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid donation amount');
      return false;
    }

    if (amount < 5) {
      setError('Minimum donation amount is RM 5.00');
      return false;
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateDonation()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const donationData = {
        campaignId: campaign.id,
        amount: getFinalAmount(),
        donorName: isAnonymous ? 'Anonymous' : donorName.trim(),
        donorEmail: donorEmail.trim(),
        message: message.trim(),
        isAnonymous
      };

      // Simulate donation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would call a donation service here
      // const result = await donationService.createDonation(donationData);
      
      onSuccess({
        ...donationData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Donation error:', error);
      setError(error.message || 'Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

          <form onSubmit={handleSubmit} className="donation-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-section">
              <label>Donation Amount</label>
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
                  <strong>Your donation: {formatCurrency(getFinalAmount())}</strong>
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="donor-info">
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
                    <label htmlFor="donor-name">Your Name</label>
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
                  <label htmlFor="donor-email">Email Address</label>
                  <input
                    id="donor-email"
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                  <small>Required for donation receipt</small>
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
            </div>

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
                type="submit" 
                className="btn btn-primary btn-large"
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
            </div>
          </form>

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