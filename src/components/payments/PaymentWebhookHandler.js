import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import LoadingSpinner from '../common/LoadingSpinner';

const PaymentWebhookHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    handleWebhookCallback();
  }, []);

  const handleWebhookCallback = async () => {
    try {
      const sessionId = searchParams.get('session_id');
      const paymentIntentId = searchParams.get('payment_intent');
      const status = searchParams.get('status');

      if (sessionId) {
        // Stripe checkout session callback
        const result = await paymentService.confirmPayment(sessionId);
        
        if (result.success) {
          navigate(`/donation/success?donation_id=${result.donationId}`);
        } else {
          navigate('/donation/cancelled');
        }
      } else if (paymentIntentId) {
        // Direct payment intent callback
        const result = await paymentService.confirmPayment(paymentIntentId);
        
        if (result.success) {
          navigate(`/donation/success?donation_id=${result.donationId}`);
        } else {
          navigate('/donation/cancelled');
        }
      } else if (status === 'cancelled') {
        navigate('/donation/cancelled');
      } else {
        throw new Error('Invalid payment callback');
      }

    } catch (error) {
      console.error('Payment callback error:', error);
      setError('Failed to process payment callback');
      setProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="payment-callback-container">
        <div className="error-state">
          <h2>❌ Payment Processing Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/campaigns')}
            className="btn btn-primary"
          >
            Browse Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-callback-container">
      <LoadingSpinner message="Processing your payment..." />
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
        Please wait while we confirm your donation...
      </p>
    </div>
  );
};

export default PaymentWebhookHandler;