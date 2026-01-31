import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser, faClock, faChartLine, faMoneyBillTransfer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/refferrals.css';
import API_BASE_URL from '../config/api';

const Withdrawal = () => {
  const [balance, setBalance] = useState(0);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'jazzcash',
    account_number: '',
    mobile_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
      setBalance(data.main_balance || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(0);
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
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 100) {
      setMessage('Minimum withdrawal amount is Rs 100');
      setMessageType('error');
      return;
    }

    if (amount > balance) {
      setMessage('Insufficient balance for withdrawal');
      setMessageType('error');
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
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="plan-header">
          <div className="plan-avatar"><FontAwesomeIcon icon={faMoneyBillTransfer} /></div>
          <div className="plan-user-info">
            <h4 className="plan-username">Withdraw Funds</h4>
            <p className="plan-email">رقم نکالیں</p>
          </div>
          <Link to="/transactions" className="link-bold plan-balance">
            <FontAwesomeIcon icon={faMoneyBillTransfer} />
          </Link>
        </header>

        <div className="refferrals-section">
          <div className="withdrawal-card">
            <h3 className="refferrals-header">Withdrawal Now</h3>

            {message && (
              <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="deposit-form">
              {/* Withdrawal Amount */}
              <div className="deposit-amount" style={{marginTop: '10px'}}>
                <label className="deposit-label">Withdrawal Amount (Gross) *</label>
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

              {/* Mobile Number */}
              <div className="form-group" style={{marginTop: '10px'}} >
                <label className="deposit-label">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  className="deposit-input"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="sign-in-btn submit-btn"
              >
                {loading ? 'Processing...' : 'Submit Withdrawal Request'}
              </button>
            </form>
          </div>
        </div>

 

        <div className="how-it-works-section">
          <div className="how-it-works-card">
            <div className="how-it-works-header">
              <span className="how-icon">💳</span>
              <h3>Withdrawal Rules / قواعد</h3>
            </div>
            <ul className="how-it-works-list">
              <li>Minimum withdrawal: Rs 100</li>
              <li>
                10% tax will be deducted from all withdrawals
              </li>
              <li>
                Unlock weekly salary bonuses at milestones
              </li>
              <li>
                Weekly salary continues as long as active investors are maintained
              </li>
              {/* <li className="urdu-text">
        دوستوں کو مدعو کریں، 10% کمائیں اور ہفتہ وار تنخواہ حاصل کریں
      </li> */}
            </ul>
          </div>
        </div>


        {/* Updated Plan Content Section */}

        {/* Bottom Navigation Section */}
        <nav className="bottom-nav">
          <div className="nav-item">
            <Link to="/dashboard" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faHouse} />
              <span>Dashboard</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/plans" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faBox} />
              <span>Plans</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/deposit" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faArrowDown} />
              <span>Deposit</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/withdrawal" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faArrowUp} />
              <span>Withdraw</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/refferrals" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faUsers} />
              <span>Referral</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/profile" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faUser} />
              <span>Profile</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Withdrawal;