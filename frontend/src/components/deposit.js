import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser, faClock, faChartLine, faMoneyBillTransfer, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/refferrals.css';

const Deposit = () => {
  const [depositData, setDepositData] = useState({
    amount: '',
    paymentMethod: 'bank',
    mobileNumber: '',
    transactionId: '',
    screenshot: null
  });

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const response = await fetch('/api/accounts/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch account details');
      }
      
      const data = await response.json();
      setAccount(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(account.accountNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDepositData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setDepositData(prev => ({
      ...prev,
      screenshot: file
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!depositData.screenshot) {
      alert('Please upload a screenshot');
      return;
    }
    console.log('Deposit request:', depositData);
    // Add your API call here
  };

  return (
 <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="plan-header">
          <div className="plan-avatar"><FontAwesomeIcon icon={faMoneyBillTransfer} /></div>
          <div className="plan-user-info">
            <h4 className="plan-username">Deposit Funds</h4>
            <p className="plan-email">رقم جمع کروائیں</p>
          </div>
          <Link to="/dashboard" className="link-bold plan-balance">
            <span>Balance: 50</span>
          </Link>  
        </header>

        {/* Send Payment To Section */}
        <div className="payment-details-section">
        <div className="payment-details">
          <h3 className="payment-details-title">Send Payment To:</h3>
          <Link to="/refferrals" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faUsers} />
            </Link>
          </div>
          {loading ? (
            <div className="payment-details-card">
              <p>Loading account details...</p>
            </div>
          ) : error ? (
            <div className="payment-details-card">
              <p>Error: {error}</p>
            </div>
          ) : account ? (
            <div className="payment-details-card">
              <div className="detail-item">
                <span className="detail-label">Account Name:</span>
                <span className="detail-value">{account.accountName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Number:</span>
                <span className="detail-value copy-value">
                  <button 
                    className="copy-btn" 
                    onClick={handleCopyAccountNumber}
                    title="Copy to clipboard"
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                    {copied }
                  </button>
                  {account.accountNumber}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Type:</span>
                <span className="detail-value">{account.accountType}</span>
              </div>
            </div>
          ) : (
            <div className="payment-details-card">
              <p>No account details available</p>
            </div>
          )}
        </div>

        <div className="deposit-section">
          <form onSubmit={handleSubmit}>
            {/* Amount Input */}
            <div className="deposit-amount">
              <label className="deposit-label">Enter Deposit Amount (Rs):</label>
              <input 
                type="number" 
                className="deposit-input" 
                placeholder="e.g., 1000"
                name="amount"
                value={depositData.amount}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Mobile Number Input */}
            <div className="form-group">
              <label className="deposit-label">Mobile Number (for verification):</label>
              <input 
                type="tel" 
                className="deposit-input" 
                placeholder="e.g., 03001234567"
                name="mobileNumber"
                value={depositData.mobileNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Transaction ID Input */}
            <div className="form-group">
              <label className="deposit-label">Transaction ID / Reference Number:</label>
              <input 
                type="text" 
                className="deposit-input" 
                placeholder="Enter transaction ID from your bank"
                name="transactionId"
                value={depositData.transactionId}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Screenshot Upload */}
            <div className="form-group">
              <label className="deposit-label">Upload Screenshot (Required) *</label>
              <div className="file-upload-area">
                <input 
                  type="file" 
                  className="file-input" 
                  id="screenshot-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <label htmlFor="screenshot-upload" className="file-label">
                  <span className="upload-icon">📸</span>
                  <span className="upload-text">
                    {depositData.screenshot ? depositData.screenshot.name : 'Click to upload or drag screenshot'}
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="deposit-btn submit-btn">
              Submit Deposit Request
            </button>
          </form>
        </div>

        <div className="how-it-works-section">
          <div className="how-it-works-card">
            <div className="how-it-works-header">
              <span className="how-icon">💳</span>
              <h3>Withdrawal Rules / قواعد</h3>
            </div>
            <ul className="how-it-works-list">
              <li>Minimum withdrawal: Rs 500</li>
              <li>10% tax will be deducted from all withdrawals</li>
              <li>Unlock weekly salary bonuses at milestones</li>
              <li>Weekly salary continues as long as active investors are maintained</li>
            </ul>
          </div>
        </div>

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

export default Deposit;