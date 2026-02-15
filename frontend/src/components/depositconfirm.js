import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/style.css';
import './css/refferrals.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const DepositConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, channel } = location.state || {};

  const [depositData, setDepositData] = useState({
    deposit_amount: amount || '',
    sender_mobile: '',
    transaction_id: '',
    screenshot: null
  });

  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // USDT BEP20 static details
  const usdtDetails = {
    qrImagePath: 'InternationalQRcode.jpeg',
    tillId: 'TAbBYea4sh7f9RZRKE26JgtcxpoMfbyYR3'
  };

  useEffect(() => {
    if (!amount) {
      navigate('/deposit');
      return;
    }
    // Only fetch account from database for JazzCash/EasyPaisa
    if (channel === 'jazzcash') {
      fetchAccount();
    }
  }, [amount, channel, navigate]);

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
        deposit_amount: amount || '',
        sender_mobile: '',
        transaction_id: '',
        screenshot: null
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
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
          <div className="plan-user-info">
            <h4 className="plan-username">Confirm Deposit</h4>
          </div>
        </header>
        <div className="plan-image">
          <img 
            src="/planimage.webp" 
            alt="Investment Plans" 
            style={{ 
              width: '100%', 
              height: '200px', 
              objectFit: 'cover',
              borderRadius: '0px 0px 15px 15px',
              borderBottom: '2px solid #000000',
            }} 
          />
        </div>

        {/* Send Payment To Section */}
        <div className="payment-details-section">
          <div className="payment-details-header">
            <h3 className="payment-details-title">Send Payment To</h3>
            <p className="payment-details-subtitle">
              {channel === 'usdt' ? 'Scan the QR or use the USDT BEP20 address' : 'Scan the QR or use the Till ID'}
            </p>
          </div>

          <div className="payment-details-body">
            {channel === 'usdt' ? (
              // Display USDT static details
              <div className="payment-details-card">
                <div className="payment-qr">
                  <img
                    src={`/${usdtDetails.qrImagePath}`}
                    alt="USDT BEP20 QR code"
                    className="payment-qr-image"
                  />
                </div>
                <div className="payment-till">
                  <span className="payment-label">USDT BEP20 Address</span>
                  <span className="payment-value" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                    {usdtDetails.tillId}
                  </span>
                  <button
                    type="button"
                    className="copy-till-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(usdtDetails.tillId).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }).catch(err => {
                        console.error('Failed to copy:', err);
                      });
                    }}
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              // Display JazzCash/EasyPaisa account from database
              account ? (
                <div className="payment-details-card">
                  <div className="payment-qr">
                    {account.qrImagePath ? (
                      <img
                        src={`/${account.qrImagePath}`}
                        alt="QR code"
                        className="payment-qr-image"
                      />
                    ) : (
                      <div className="payment-qr-placeholder">No QR</div>
                    )}
                  </div>
                  <div className="payment-till">
                    <span className="payment-label">Till ID</span>
                    <span className="payment-value">{account.tillId || 'N/A'}</span>
                    <button
                      type="button"
                      className="copy-till-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(account.tillId).then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }).catch(err => {
                          console.error('Failed to copy:', err);
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p>Loading account details...</p>
              )
            )}
          </div>
        </div>

        <div className="deposit-section">
          <form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
            {successMessage && <p style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{successMessage}</p>}
            
            {/* Amount Input */}
            <div className="deposit-amount">
              <label className="deposit-label">Deposit Amount ($) *</label>
              <input 
                type="number" 
                className="deposit-input" 
                placeholder="e.g., 100"
                name="deposit_amount"
                value={depositData.deposit_amount}
                onChange={handleInputChange}
                required
                readOnly
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
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Deposit Request'}
            </button>
          </form>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default DepositConfirm;
