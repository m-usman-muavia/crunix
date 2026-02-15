import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './css/style.css';
import './css/refferrals.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const DepositHistory = () => {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDeposited, setTotalDeposited] = useState(0);

  useEffect(() => {
    fetchDepositHistory();
  }, []);

  const fetchDepositHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/deposits/my-deposits`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const depositsData = Array.isArray(data) ? data : (data.data || []);
        
        // Calculate total deposited (only approved)
        const approved = depositsData.filter(d => d.status?.toLowerCase() === 'approved' || d.status?.toLowerCase() === 'accept');
        const total = approved.reduce((sum, d) => sum + (Number(d.deposit_amount) || 0), 0);
        setTotalDeposited(total);
        
        // Sort by date descending
        const sorted = depositsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDeposits(sorted);
      }
    } catch (err) {
      console.error('Error fetching deposits:', err);
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
<div className="deposit-header">Deposit History</div>

        {/* Content */}
        <div style={{ padding: '0px' }}>
          {/* Total Deposited Card */}
          <div className="withdrawal-balance-card">
          <div className="withdrawal-main-balance">
            <p className="withdrawal-main-balance-label">Total Deposited</p>
            <h2 className="withdrawal-main-balance-amount">${totalDeposited.toFixed(2)}</h2>
          </div>
        </div>

          {/* Deposits List */}
          {loading ? (
            <p style={{ textAlign: 'center', color: '#999' }}>Loading...</p>
          ) : deposits.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>No deposits found</p>
          ) : (
            <div style={{ padding: '20px' }}>
              {deposits.map((deposit) => (
                <div
                  key={deposit._id}
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
                      ${Number(deposit.deposit_amount || 0).toFixed(2)}
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#999' }}>
                      {formatDate(deposit.createdAt || deposit.created_at || deposit.date || deposit.created)}
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: getStatusColor(deposit.status),
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {getStatusText(deposit.status)}
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

export default DepositHistory;
