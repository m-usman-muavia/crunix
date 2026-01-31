import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser, faClock, faChartLine, faMoneyBillTransfer, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/refferrals.css';
import API_BASE_URL from '../config/api';

const Deposit = () => {
  const [depositData, setDepositData] = useState({
    deposit_amount: '',
    sender_mobile: '',
    transaction_id: '',
    screenshot: null
  });

  const [account, setAccount] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAccount();
    fetchWallet();
  }, []);

  const fetchAccount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch account details');
      }
      
      const data = await response.json();
      setAccount(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchWallet = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet');
      }
      
      const data = await response.json();
      setWallet(data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!depositData.deposit_amount || !depositData.sender_mobile || !depositData.transaction_id) {
      setError('Please fill all fields');
      return;
    }

    if (!depositData.screenshot) {
      setError('Please upload a screenshot');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('deposit_amount', depositData.deposit_amount);
      formData.append('sender_mobile', depositData.sender_mobile);
      formData.append('transaction_id', depositData.transaction_id);
      formData.append('screenshot', depositData.screenshot);

      const response = await fetch(`${API_BASE_URL}/api/deposits/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit deposit');
      }

      setSuccessMessage('Deposit request submitted successfully! Admin will verify soon.');
      setDepositData({
        deposit_amount: '',
        sender_mobile: '',
        transaction_id: '',
        screenshot: null
      });
      
      // Refresh wallet
      fetchWallet();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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
          <Link to="/transactions" className="link-bold plan-balance">
            <FontAwesomeIcon icon={faMoneyBillTransfer} />
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
                <span className="detail-label">Bank Name:</span>
                <span className="detail-value">{account.bankName}</span>
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
                    {copied ? ' Copied' : ' Copy'}
                  </button>
                  {account.accountNumber}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Name:</span>
                <span className="detail-value">{account.accountName}</span>
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
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
            {successMessage && <p style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{successMessage}</p>}
            
            {/* Amount Input */}
            <div className="deposit-amount">
              <label className="deposit-label">Enter Deposit Amount (Rs) *</label>
              <input 
                type="number" 
                className="deposit-input" 
                placeholder="e.g., 1000"
                name="deposit_amount"
                value={depositData.deposit_amount}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Mobile Number Input */}
            <div className="form-group">
              <label className="deposit-label">Sender Mobile Number *</label>
              <input 
                type="tel" 
                className="deposit-input" 
                placeholder="e.g., 03001234567"
                name="sender_mobile"
                value={depositData.sender_mobile}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Transaction ID Input */}
            <div className="form-group">
              <label className="deposit-label">Transaction ID / Reference Number *</label>
              <input 
                type="text" 
                className="deposit-input" 
                placeholder="Enter transaction ID from your bank"
                name="transaction_id"
                value={depositData.transaction_id}
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
            <button type="submit" className="sign-in-btn submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Deposit Request'}
            </button>
          </form>
        </div>

        <div className="how-it-works-section">
          <div className="how-it-works-card">
            <div className="how-it-works-header">
              <span className="how-icon">💳</span>
              <h3>Deposit Rules / ڈپوزٹ کے اصول</h3>
            </div>
            <ul className="how-it-works-list">
              <li>Select payment method and amount</li>
              <li>Send payment to the shown account/wallet</li>
              <li>Enter your details and transaction ID</li>
              <li>Admin will verify within 24 hours</li>
              <li>Balance will be added after approval</li>
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