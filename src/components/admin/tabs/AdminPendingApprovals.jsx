// src/components/admin/tabs/AdminPendingApprovals.jsx
import React, { useState, useEffect } from 'react';
import campaignService from '../../../services/campaignService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import { CheckCircle, XCircle, Eye, FileText, Clock, Sparkles } from 'lucide-react';

const AdminPendingApprovals = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await campaignService.getPendingCampaigns();
      setCampaigns(res.campaigns || []);
    } catch (err) {
      console.error('Failed to load pending campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this campaign?')) return;
    setProcessingId(id);
    try {
      await campaignService.approveCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to approve campaign');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return;
    setProcessingId(id);
    try {
      await campaignService.rejectCampaign(id, reason || 'No reason provided');
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to reject campaign');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading pending campaigns..." />;

  return (
    <div className="admin-pending-approvals">
      {/* Header */}
      <div className="header-section">
        <h1>
          <FileText size={40} />
          Pending Campaign Approvals
        </h1>
        <p className="subtitle">
          {campaigns.length === 0 ? (
            <>All caught up! No campaigns awaiting review.</>
          ) : (
            <>
              <Clock size={20} /> 
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} 
              need{campaigns.length !== 1 ? 's' : ''} your attention
            </>
          )}
        </p>
      </div>

      {/* Empty State */}
      {campaigns.length === 0 && (
        <div className="empty-state">
          <div className="celebration">
            <Sparkles size={80} />
          </div>
          <h2>All caught up!</h2>
          <p>No pending campaigns to review right now. Great job staying on top of things!</p>
        </div>
      )}

      {/* Campaign Cards */}
      {campaigns.length > 0 && (
        <div className="pending-grid">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="pending-card">
              {/* Image */}
              <div className="image-container">
                {campaign.imageUrl ? (
                  <img src={campaign.imageUrl} alt={campaign.name} className="campaign-image" />
                ) : (
                  <div className="placeholder-image">
                    <FileText size={80} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="card-content">
                <div className="card-header">
                  <div>
                    <h3 className="campaign-title">{campaign.name}</h3>
                    <p className="campaign-meta">
                      by <strong>{campaign.creatorUsername || 'Unknown'}</strong> • {campaign.category}
                    </p>
                  </div>
                  <span className="status-badge">PENDING REVIEW</span>
                </div>

                <p className="campaign-description">
                  {campaign.description || 'No description provided.'}
                </p>

                <div className="action-buttons">
                  <button
                    onClick={() => handleApprove(campaign.id)}
                    disabled={processingId === campaign.id}
                    className="btn approve"
                  >
                    <CheckCircle size={20} />
                    {processingId === campaign.id ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(campaign.id)}
                    disabled={processingId === campaign.id}
                    className="btn reject"
                  >
                    <XCircle size={20} />
                    Reject
                  </button>
                  <button className="btn view">
                    <Eye size={20} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Styles (2025 Premium Design) */}
      <style jsx>{`
        .admin-pending-approvals {
          padding: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .header-section h1 {
          font-size: 2.8rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 0 0 12px 0;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .empty-state {
          background: white;
          border-radius: 28px;
          padding: 80px 40px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          margin-top: 40px;
        }

        .celebration {
          color: #10b981;
          margin-bottom: 24px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .empty-state h2 {
          font-size: 3rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 16px 0;
        }

        .empty-state p {
          font-size: 1.3rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
        }

        .pending-grid {
          display: grid;
          gap: 32px;
          margin-top: 40px;
        }

        .pending-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          display: flex;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pending-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
        }

        .image-container {
          width: 320px;
          flex-shrink: 0;
        }

        .campaign-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .pending-card:hover .campaign-image {
          transform: scale(1.08);
        }

        .placeholder-image {
          width: 320px;
          height: 280px;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }

        .card-content {
          flex: 1;
          padding: 36px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .campaign-title {
          font-size: 1.9rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .campaign-meta {
          font-size: 1.05rem;
          color: #64748b;
          margin: 0;
        }

        .status-badge {
          background: linear-gradient(135deg, #fff7ed, #fed7aa);
          color: #c2410c;
          padding: 10px 20px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .campaign-description {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #475569;
          margin-bottom: 32px;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .action-buttons {
          display: flex;
          gap: 16px;
        }

        .btn {
          flex: 1;
          padding: 16px 24px;
          border-radius: 18px;
          font-weight: 600;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn.approve {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
        }

        .btn.reject {
          background: linear-gradient(135deg, #ef4444, #f87171);
          color: white;
        }

        .btn.view {
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          color: #475569;
        }

        .btn:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 1024px) {
          .pending-card {
            flex-direction: column;
          }
          .image-container {
            width: 100%;
            height: 300px;
          }
          .placeholder-image {
            width: 100%;
            height: 300px;
          }
        }

        @media (max-width: 640px) {
          .admin-pending-approvals {
            padding: 24px;
          }
          .action-buttons {
            flex-direction: column;
          }
          .header-section h1 {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPendingApprovals;