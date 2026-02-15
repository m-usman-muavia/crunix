import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './css/style.css';
import './css/refferrals.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const WithdrawalHistory = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  useEffect(() => {
    fetchWithdrawalHistory();
  }, []);

  const fetchWithdrawalHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/withdrawals/my-withdrawals`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const withdrawalsData = Array.isArray(data) ? data : (data.data || []);
        
        // Calculate total withdrawn (only approved)
        const approved = withdrawalsData.filter(w => w.status?.toLowerCase() === 'approved' || w.status?.toLowerCase() === 'accept');
        const total = approved.reduce((sum, w) => sum + (Number(w.amount) || Number(w.withdrawal_amount) || 0), 0);
        setTotalWithdrawn(total);
        
        // Sort by date descending
        const sorted = withdrawalsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setWithdrawals(sorted);
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accept':
        return '#27ae60';
      case 'rejected':
      case 'reject':
        return '#e74c3c';
      case 'pending':
        return '#f39c12';
      default:
        return '#7f8c8d';
    }
  };

  const getStatusText = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Header */}
<div className="deposit-header">Withdrawal History</div>

        {/* Content */}
        <div style={{ padding: '0px' }}>
          {/* Total Withdrawn Card */}
          <div className="withdrawal-balance-card">
          <div className="withdrawal-main-balance">
            <p className="withdrawal-main-balance-label">Total Withdrawn</p>
            <h2 className="withdrawal-main-balance-amount">${totalWithdrawn.toFixed(2)}</h2>
          </div>
        </div>

          {/* Withdrawals List */}
          {loading ? (
            <p style={{ textAlign: 'center', color: '#999' }}>Loading...</p>
          ) : withdrawals.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>No withdrawals found</p>
          ) : (
            <div  style={{ padding: '20px' }}>
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#333' }}>
                      ${Number(withdrawal.amount || withdrawal.withdrawal_amount || 0).toFixed(2)}
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#999' }}>
                      {formatDate(withdrawal.createdAt || withdrawal.created_at || withdrawal.date || withdrawal.created)}
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: getStatusColor(withdrawal.status),
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {getStatusText(withdrawal.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default WithdrawalHistory;
