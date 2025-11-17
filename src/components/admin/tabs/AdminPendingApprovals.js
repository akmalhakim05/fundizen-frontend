// src/components/admin/tabs/AdminPendingApprovals.js
import React, { useState, useEffect } from 'react';
import campaignService from '../../../services/campaignService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this campaign?')) return;
    setProcessingId(id);
    try {
      await campaignService.approveCampaign(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to approve');
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
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading pending campaigns..." />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FileText size={36} />
          Pending Campaign Approvals
        </h1>
        <p className="text-gray-600 mt-2">{campaigns.length} campaign(s) awaiting review</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">All caught up!</div>
          <p className="text-xl text-gray-600">No pending campaigns to review right now.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="flex">
                {campaign.imageUrl ? (
                  <img src={campaign.imageUrl} alt={campaign.name} className="w-64 h-48 object-cover" />
                ) : (
                  <div className="w-64 h-48 bg-gray-200 flex items-center justify-center">
                    <FileText size={64} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{campaign.name}</h3>
                      <p className="text-gray-600 mt-1">
                        by <span className="font-medium">{campaign.creatorUsername}</span> • {campaign.category}
                      </p>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold">
                      PENDING
                    </span>
                  </div>

                  <p className="text-gray-700 mb-6 line-clamp-3">{campaign.description}</p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(campaign.id)}
                      disabled={processingId === campaign.id}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-70"
                    >
                      <CheckCircle size={20} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(campaign.id)}
                      disabled={processingId === campaign.id}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-70"
                    >
                      <XCircle size={20} />
                      Reject
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium">
                      <Eye size={20} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPendingApprovals;