// src/components/admin/tabs/AdminFoodBankManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import foodbankService from '../../../services/foodbankService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ErrorMessage from '../../../common/ErrorMessage';
import { MapPin, Package, CheckCircle, Users, Clock, Home, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STAT_CARDS = [
  { key: 'totalItems', label: 'Total Items Listed', icon: Package, color: '#3B82F6' },
  { key: 'availableItems', label: 'Still Available', icon: CheckCircle, color: '#10B981' },
  { key: 'distributedItems', label: 'Distributed', icon: Package, color: '#8B5CF6' },
  { key: 'peopleFed', label: 'People Fed', icon: Users, color: '#F59E0B' },
  { key: 'reservedItems', label: 'Reserved', icon: Clock, color: '#F97316' },
  { key: 'totalFoodBanks', label: 'Active Food Banks', icon: Home, color: '#EC4899' },
];

const AdminFoodBankManagement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
    status: 'all',
    search: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await foodbankService.getAdminFoodBankPage(filters);
      setData(response);
    } catch (err) {
      setError('Failed to load food bank data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = data?.statistics?.distribution || {};
  const globalStats = data?.statistics?.global || {};
  const foodBanks = data?.foodBanks || [];
  const pagination = data?.pagination || {};
  const markers = data?.mapData?.markers || [];

  if (loading) return <LoadingSpinner message="Loading food bank dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <div className="admin-foodbank-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <MapPin size={40} className="title-icon" />
            <div>
              <h1>Food Bank Management</h1>
              <p>Monitor and manage surplus food distribution across Malaysia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="stat-card" style={{ borderTop: `5px solid ${color}` }}>
            <Icon size={36} style={{ color }} />
            <div>
              <div className="stat-number">{stats[key] ?? globalStats[key.replace('Items', 'FoodPosts')] ?? 0}</div>
              <div className="stat-title">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Section */}
      <div className="map-section">
        <h2>Live Food Bank Locations</h2>
        <div className="map-container">
          <MapContainer center={[3.139, 101.6869]} zoom={6} style={{ height: '500px', borderRadius: '16px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            {markers.map(marker => (
              <Marker key={marker.id} position={[marker.latitude, marker.longitude]}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong>{marker.title}</strong><br />
                    {marker.description}<br />
                    <small>{marker.locationName}</small>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filters-left">
          <div className="filter-group">
            <label>Status</label>
            <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 0 })}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="taken">Taken</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Items per page</label>
            <select value={filters.size} onChange={e => setFilters({ ...filters, size: +e.target.value, page: 0 })}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="results-info">
          Showing {pagination.totalElements ? `${filters.page * filters.size + 1}-${Math.min((filters.page + 1) * filters.size, pagination.totalElements)}` : '0'} of {pagination.totalElements || 0} food banks
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="foodbank-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Food Name</th>
              <th>Location</th>
              <th>Qty (Avail/Total)</th>
              <th>Status</th>
              <th>Expiry</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foodBanks.map(fb => (
              <tr key={fb.id}>
                <td>
                  {fb.imageUrl ? (
                    <img src={fb.imageUrl} alt={fb.foodName} className="table-img" />
                  ) : (
                    <div className="table-img placeholder">No Image</div>
                  )}
                </td>
                <td>
                  <strong>{fb.foodName}</strong>
                  <br />
                  <small>{fb.quantityUnit} • {fb.foodType}</small>
                </td>
                <td>
                  <small>{fb.locationName}</small>
                </td>
                <td>
                  <strong>{fb.availableQuantity}</strong> / {fb.totalQuantity}
                  <br />
                  <small>Max/person: {fb.maxQuantityPerPerson}</small>
                </td>
                <td>
                  <span className={`status-badge ${fb.status}`}>
                    {fb.status.charAt(0).toUpperCase() + fb.status.slice(1)}
                  </span>
                </td>
                <td>
                  {new Date(fb.expiryDate).toLocaleDateString('en-MY')}
                  {fb.expired && <span style={{ color: '#EF4444', marginLeft: 8 }}>Expired</span>}
                </td>
                <td>{new Date(fb.createdAt).toLocaleDateString('en-MY')}</td>
                <td>
                  <button className="btn-small view">View</button>
                  <button className="btn-small edit">Edit</button>
                  <button className="btn-small delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={() => setFilters(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))} disabled={filters.page === 0}>
            <ChevronLeft size={20} /> Previous
          </button>
          <span className="page-info">
            Page <strong>{filters.page + 1}</strong> of <strong>{pagination.totalPages}</strong>
          </span>
          <button onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages - 1, prev.page + 1) }))} disabled={filters.page >= pagination.totalPages - 1}>
            Next <ChevronRight size={20} />
          </button>
        </div>
      )}

      <style jsx>{`
        .admin-foodbank-management { padding: 32px 40px; background: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .page-header { background: white; border-radius: 20px; padding: 32px 40px; margin-bottom: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; }
        .header-title { display: flex; align-items: center; gap: 20px; }
        .title-icon { color: #EC4899; }
        .header-title h1 { font-size: 2.5rem; font-weight: 800; margin: 0; color: #111827; }
        .header-title p { color: #6B7280; font-size: 1.1rem; margin: 8px 0 0; }

        .stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; margin-bottom: 32px; }
        .stat-card { background: white; border-radius: 18px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 18px; }
        .stat-number { font-size: 2.8rem; font-weight: 900; color: #111827; }
        .stat-title { font-size: 1rem; font-weight: 600; color: #4B5563; }

        .map-section h2 { font-size: 1.6rem; font-weight: 700; margin: 0 0 16px; color: #111827; }
        .map-container { border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }

        .filters-bar { background: white; border-radius: 18px; padding: 24px 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; }
        .filters-left { display: flex; gap: 24px; align-items: end; }
        .filter-group label { font-weight: 600; font-size: 0.9rem; color: #374151; display: block; margin-bottom: 8px; }
        .filter-group select { padding: 12px 16px; border: 1.5px solid #D1D5DB; border-radius: 12px; min-width: 160px; }
        .results-info { color: #6B7280; font-weight: 500; }

        .table-container { background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); margin-bottom: 40px; }
        .foodbank-table { width: 100%; border-collapse: collapse; }
        .foodbank-table th, .foodbank-table td { padding: 16px; text-align: left; border-bottom: 1px solid #E5E7EB; }
        .foodbank-table th { background: #F9FAFB; font-weight: 700; color: #374151; }
        .table-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
        .table-img.placeholder { background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #9CA3AF; }
        .status-badge { padding: 4px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .status-badge.available { background: #ECFDF5; color: #065F46; border: 2px solid #10B981; }
        .status-badge.taken { background: #FEF3C7; color: #92400E; border: 2px solid #F59E0B; }
        .status-badge.expired { background: #FEE2E2; color: #991B1B; border: 2px solid #EF4444; }
        .btn-small { padding: 6px 12px; margin: 0 4px; border: none; border-radius: 8px; font-size: 0.8rem; cursor: pointer; }
        .btn-small.view { background: #DBEAFE; color: #1D4ED8; }
        .btn-small.edit { background: #FEF3C7; color: #92400E; }
        .btn-small.delete { background: #FEE2E2; color: #991B1B; }

        .pagination-controls { display: flex; justify-content: center; align-items: center; gap: 32px; margin-bottom: 40px; }
        .pagination-controls button { padding: 12px 28px; background: #EC4899; color: white; border: none; border-radius: 16px; display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .pagination-controls button:disabled { background: #D1D5DB; cursor: not-allowed; }
        .page-info { font-weight: 600; color: #374151; }

        @media (max-width: 1400px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 900px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } .filters-bar { flex-direction: column; align-items: stretch; } }
      `}</style>
    </div>
  );
};

export default AdminFoodBankManagement;