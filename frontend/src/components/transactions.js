import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faCheckCircle, faClock, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import './css/style.css';
import './css/dashboard.css';
import './css/plans.css';
import './css/transactions.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');

      // Fetch deposits
      const depositsRes = await fetch(`${API_BASE_URL}/api/deposits/my-deposits`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      // Fetch withdrawals
      const withdrawalsRes = await fetch(`${API_BASE_URL}/api/withdrawals/my-withdrawals`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      let allTransactions = [];

      if (depositsRes.ok) {
        const depositsData = await depositsRes.json();
        const deposits = Array.isArray(depositsData) 
          ? depositsData 
          : (depositsData.data || []);
        
        const formattedDeposits = deposits.map(dep => ({
          _id: dep._id,
          type: 'deposit',
          amount: Number(dep.deposit_amount ?? dep.amount ?? 0),
          status: dep.status,
          date: dep.createdAt || dep.created_at || dep.approved_at,
          sender_mobile: dep.sender_mobile,
          transaction_id: dep.transaction_id
        }));
        allTransactions = [...allTransactions, ...formattedDeposits];
      }

      if (withdrawalsRes.ok) {
        const withdrawalsData = await withdrawalsRes.json();
        const withdrawals = Array.isArray(withdrawalsData) 
          ? withdrawalsData 
          : (withdrawalsData.data || []);
        
        const formattedWithdrawals = withdrawals.map(wit => ({
          _id: wit._id,
          type: 'withdrawal',
          amount: Number(wit.withdrawal_amount ?? wit.amount ?? 0),
          status: wit.status,
          date: wit.createdAt || wit.created_at || wit.approved_at,
          wallet_address: wit.wallet_address
        }));
        allTransactions = [...allTransactions, ...formattedWithdrawals];
      }

      // Sort by date descending
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(allTransactions);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = transactions.length;
    const pending = transactions.filter(tx => tx.status?.toLowerCase() === 'pending').length;
    const accepted = transactions.filter(tx => 
      tx.status?.toLowerCase() === 'approved' || 
      tx.status?.toLowerCase() === 'accept' ||
      tx.status?.toLowerCase() === 'accepted'
    ).length;
    const rejected = transactions.filter(tx => 
      tx.status?.toLowerCase() === 'rejected' || 
      tx.status?.toLowerCase() === 'reject'
    ).length;

    return { total, pending, accepted, rejected };
  }, [transactions]);

  // Filter transactions based on active filter
  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;
    if (activeFilter === 'deposits') return transactions.filter(tx => tx.type === 'deposit');
    if (activeFilter === 'withdrawals') return transactions.filter(tx => tx.type === 'withdrawal');
    if (activeFilter === 'pending') return transactions.filter(tx => tx.status?.toLowerCase() === 'pending');
    if (activeFilter === 'accepted') return transactions.filter(tx => 
      tx.status?.toLowerCase() === 'approved' || 
      tx.status?.toLowerCase() === 'accept' ||
      tx.status?.toLowerCase() === 'accepted'
    );
    if (activeFilter === 'rejected') return transactions.filter(tx => 
      tx.status?.toLowerCase() === 'rejected' || 
      tx.status?.toLowerCase() === 'reject'
    );
    return transactions;
  }, [transactions, activeFilter]);

  const getStatusColor = (status) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'pending') return '#f59e0b';
    if (lowerStatus === 'approved' || lowerStatus === 'accept' || lowerStatus === 'accepted') return '#10b981';
    if (lowerStatus === 'rejected' || lowerStatus === 'reject') return '#ef4444';
    return '#6b7280';
  };

  const getStatusIcon = (status) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'pending') return faClock;
    if (lowerStatus === 'approved' || lowerStatus === 'accept' || lowerStatus === 'accepted') return faCheckCircle;
    if (lowerStatus === 'rejected' || lowerStatus === 'reject') return faTimesCircle;
    return faCheckCircle;
  };

  const getStatusText = (status) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'approve' || lowerStatus === 'accept') return 'Accepted';
    if (lowerStatus === 'reject') return 'Rejected';
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  };

  const formatAmount = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num.toFixed(2) : '0.00';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      const parsed = Date.parse(String(dateString));
      if (Number.isNaN(parsed)) return 'N/A';
      const fallbackDate = new Date(parsed);
      return fallbackDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        <div className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">History</p>
              <h1 className="dashboard-modern-title">Transactions</h1>
            </div>
            <div className="dashboard-header-actions">
            
            </div>
          </div>
        </div>


        {/* Filter Chips */}
        <div className="notifications-filter-wrap">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${activeFilter === 'deposits' ? 'active' : ''}`}
            onClick={() => setActiveFilter('deposits')}
          >
            Deposits
          </button>
          <button
            className={`filter-btn ${activeFilter === 'withdrawals' ? 'active' : ''}`}
            onClick={() => setActiveFilter('withdrawals')}
          >
            Withdrawals
          </button>
        </div>

        {/* Transactions List Section */}
        <div className="transactions-content">
          {loading ? (
            <div className="transactions-empty">
              <p className="transactions-empty-text">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="transactions-empty">
              <p className="transactions-empty-text" style={{ color: '#ef4444' }}>Error: {error}</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="transactions-empty">
              <p className="transactions-empty-text">No transactions found</p>
              <p className="transactions-empty-subtext">Your transactions will appear here</p>
            </div>
          ) : (
            <div className="transactions-list">
              {filteredTransactions.map((tx) => (
                <div 
                  key={tx._id}
                  className={`modern-transaction-card modern-transaction-${tx.type}`}
                >
                  <div className="transaction-icon-wrap">
                    <div className={`transaction-icon transaction-icon-${tx.type}`}>
                      <FontAwesomeIcon icon={tx.type === 'deposit' ? faArrowDown : faArrowUp} />
                    </div>
                  </div>

                  <div className="transaction-info">
                    <div className="transaction-header">
                      <h3 className="transaction-type">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</h3>
                      <p className="transaction-date">
                        {formatDate(tx.date)}
                      </p>
                    </div>

                    <div className="transaction-details">
                      {tx.type === 'withdrawal' && (
                        <>
                          {tx.wallet_address && (
                            <p className="transaction-detail">
                              <span className="detail-label">Address:</span>
                              <span className="detail-value">{tx.wallet_address}</span>
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                      <span 
                        className="transaction-status"
                        style={{ color: getStatusColor(tx.status) }}
                      >
                        <FontAwesomeIcon icon={getStatusIcon(tx.status)} style={{ marginRight: '4px', fontSize: '12px' }} />
                        {getStatusText(tx.status)}
                      </span>
                  <div className="transaction-amount-wrap">
                    <div className={`transaction-amount transaction-amount-${tx.type}`}>
                      {tx.type === 'deposit' ? '+' : '-'} AED {formatAmount(tx.amount)}
                    </div>
                  </div>
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

export default Transactions;




