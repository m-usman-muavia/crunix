import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillTransfer } from '@fortawesome/free-solid-svg-icons';
import './css/style.css';
import './css/refferrals.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';
import ErrorModal from './ErrorModal';

const Withdrawal = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [mainBalance, setMainBalance] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'jazzcash',
    account_number: '',
    mobile_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      const main = data.main_balance || 0;
      const referral = data.referral_balance || 0;
      const bonus = data.bonus_balance || 0;
      const totalBalance = main + referral + bonus;
      setBalance(totalBalance);
      setMainBalance(main);
      setReferralEarnings(referral);
      setBonusBalance(bonus);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(0);
      setMainBalance(0);
      setReferralEarnings(0);
      setBonusBalance(0);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // Validation
    if (!formData.amount || !formData.account_number || !formData.mobile_number) {
      setMessage('All fields are required');
      setMessageType('error');
      setShowErrorModal(true);
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 100) {
      setMessage('Minimum withdrawal amount is Rs 100');
      setMessageType('error');
      setShowErrorModal(true);
      return;
    }

    if (amount > balance) {
      setMessage(`You need Rs ${(amount - balance).toFixed(2)} more to withdraw this amount.`);
      setMessageType('error');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/withdrawals/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          amount: amount,
          method: formData.method,
          account_number: formData.account_number,
          mobile_number: formData.mobile_number
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create withdrawal');
      }

      setMessage('Withdrawal request submitted successfully! Admin will review it shortly.');
      setMessageType('success');
      setFormData({
        amount: '',
        method: 'jazzcash',
        account_number: '',
        mobile_number: ''
      });

      // Refresh balance
      setTimeout(() => {
        fetchBalance();
      }, 1000);
    } catch (err) {
      console.error('Error submitting withdrawal:', err);
      setMessage(err.message || 'Error submitting withdrawal request');
      setMessageType('error');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Error Modal */}
        <ErrorModal
          isOpen={showErrorModal}
          message={message}
          onClose={() => setShowErrorModal(false)}
          autoClose={true}
          closeDuration={3000}
        />

        {/* Top Header Section */}
        <div className="deposit-header">Withdrawal</div>
        <button 
          onClick={() => navigate('/withdrawalhistory')}
          style={{
            background: 'linear-gradient(135deg, #036, #0055a4)',
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 8px 18px #2563eb47',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '.7px',
            padding: '8px 14px',
            textTransform: 'uppercase',
            transition: 'all .3s ease'
          }}
        >
          Withdrawal History
        </button>
        <div className="withdrawal-balance-card">
          <div className="withdrawal-main-balance">
            <p className="withdrawal-main-balance-label">Total Balance</p>
            <h2 className="withdrawal-main-balance-amount">${balance.toFixed(2)}</h2>
          </div>
        </div>

        <div className="refferrals-section">
          <div className="withdrawal-card">
            <h3 className="refferrals-header">Apply for Withdraw</h3>

            <form onSubmit={handleSubmit} className="deposit-form">
              {/* Withdrawal Amount */}
              <div className="deposit-amount" style={{marginTop: '10px'}}>
                <label className="deposit-label">Withdrawal Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Minimum Rs 100"
                  min="100"
                  step="1"
                  className="deposit-input"
                  required
                />
              </div>

              {/* Withdrawal Method */}
              <div className="form-group" style={{marginTop: '10px'}}>
                <label className="deposit-label">Withdrawal Method *</label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className="deposit-input"
                  required
                >
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="hbl">SadaPay</option>
                </select>
              </div>

              {/* Account Name */}
              <div className="form-group" style={{marginTop: '10px'}} >
                <label className="deposit-label">Account Name *</label>
                <input
                  type="text"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  placeholder="Enter your account name"
                  className="deposit-input"
                  required
                />
              </div>

              {/* Account Number */}
              <div className="form-group" style={{marginTop: '10px'}}>
                <label className="deposit-label">Account Number *</label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  placeholder="Enter your account number"
                  className="deposit-input"
                  required
                />
              </div>



              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="primary-btn"
                style={{ marginTop: '14px' }}
              >
                {loading ? 'Processing...' : 'Submit Withdrawal Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default Withdrawal;