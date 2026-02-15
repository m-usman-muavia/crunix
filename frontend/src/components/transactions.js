import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillTransfer } from '@fortawesome/free-solid-svg-icons';
import './css/style.css';
import './css/refferrals.css';
import './css/transactions.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('deposits');

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
          date: dep.createdAt,
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
          date: wit.createdAt,
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

  const filteredTransactions = transactions.filter(tx => tx.type === activeTab.slice(0, -1));

  const formatAmount = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num.toFixed(2) : '0.00';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
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
        {/* Top Header Section */}
                <div className="deposit-header">Transaction History</div>


       
       

        {/* Transactions List Section */}
        <div className="plan-content">
          {loading ? (
            <p className="tx-message">Loading transactions...</p>
          ) : error ? (
            <p className="tx-message tx-error">Error: {error}</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="tx-message">No transactions found</p>
          ) : (
            <div className="transactions-list">
              {filteredTransactions.map((tx) => (
                <div 
                  key={tx._id}
                  className={`tx-card ${tx.type === 'deposit' ? 'tx-deposit' : 'tx-withdrawal'}`}
                  style={{ borderLeftColor: getStatusColor(tx.status) }}
                >
                  <div className="tx-main">
                    <div className="tx-header">
                      {/* <FontAwesomeIcon 
                        icon={tx.type === 'deposit' ? faArrowDown : faArrowUp}
                        className="tx-icon"
                      /> */}
                      <span className="tx-type">{tx.type}</span>
                      <span className="tx-status" style={{ backgroundColor: getStatusColor(tx.status) }}>
                        {getStatusText(tx.status)}
                      </span>
                    </div>

                    <div className="tx-details">
                      {tx.type === 'deposit' && (
                        <>
                        </>
                      )}
                      
                    </div>
                  </div>

                  <div className="tx-amount">
                    <div className={tx.type === 'deposit' ? 'tx-amount-deposit' : 'tx-amount-withdrawal'}>
                      {tx.type === 'deposit' ? '+' : '-'}Rs {formatAmount(tx.amount)}
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