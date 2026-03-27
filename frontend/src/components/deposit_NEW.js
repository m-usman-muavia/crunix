import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory,faCircleExclamation, faMobileAlt, faCheckCircle, faExclamationTriangle, faQrcode, faBuildingColumns, faCopy } from '@fortawesome/free-solid-svg-icons';
import './css/dashboard.css';
import './css/plans.css';
import './css/deposit-new.css';
import API_BASE_URL from '../config/api';
import ErrorModal from './ErrorModal';
import BottomNav from './BottomNav';

const Deposit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    transactionId: '',
    screenshot: null,
    screenshotName: '',
    senderMobile: ''
  });

  const [wallet, setWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [pendingDeposit, setPendingDeposit] = useState(0);
  const [rejectedDeposit, setRejectedDeposit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [copiedTill, setCopiedTill] = useState(false);

  useEffect(() => {
    fetchDepositData();
  }, []);

  const fetchDepositData = async () => {
    try {
      const token = localStorage.getItem('authToken');

      // Fetch wallet info
      const walletRes = await fetch(`${API_BASE_URL}/api/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWallet(walletData);
      }

      // Fetch active account (QR code, Till ID)
      const accountRes = await fetch(`${API_BASE_URL}/api/accounts/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (accountRes.ok) {
        const accountData = await accountRes.json();
        setAccount(accountData);
      }

      // Fetch deposit stats (total, pending, rejected)
      const depositsRes = await fetch(`${API_BASE_URL}/api/deposits/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (depositsRes.ok) {
        const depositsData = await depositsRes.json();
        const deposits = Array.isArray(depositsData) ? depositsData : depositsData.data || [];

        const total = deposits.reduce((sum, d) => sum + Number(d.deposit_amount ?? d.amount ?? 0), 0);
        const pending = deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + Number(d.deposit_amount ?? d.amount ?? 0), 0);
        const rejected = deposits.filter(d => d.status === 'rejected').reduce((sum, d) => sum + Number(d.deposit_amount ?? d.amount ?? 0), 0);

        setTotalDeposit(total);
        setPendingDeposit(pending);
        setRejectedDeposit(rejected);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching deposit data:', err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        screenshot: file,
        screenshotName: file.name
      }));
    }
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) < 5) {
      setErrorMessage('Minimum deposit amount is AED 5');
      setShowErrorModal(true);
      return false;
    }

    if (!formData.transactionId || formData.transactionId.trim() === '') {
      setErrorMessage('Transaction ID is required');
      setShowErrorModal(true);
      return false;
    }

    if (!formData.screenshot) {
      setErrorMessage('Screenshot is required');
      setShowErrorModal(true);
      return false;
    }

    if (!formData.senderMobile || formData.senderMobile.trim() === '') {
      setErrorMessage('Sender mobile number is required');
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const formDataObj = new FormData();
      formDataObj.append('deposit_amount', formData.amount);
      formDataObj.append('transaction_id', formData.transactionId);
      formDataObj.append('screenshot', formData.screenshot);
      formDataObj.append('sender_mobile', formData.senderMobile);

      const response = await fetch(`${API_BASE_URL}/api/deposits/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit deposit');
      }

      setErrorMessage('Deposit submitted successfully! Your deposit is pending approval.');
      setShowErrorModal(true);

      // Reset form
      setFormData({
        amount: '',
        transactionId: '',
        screenshot: null,
        screenshotName: '',
        senderMobile: ''
      });

      // Refresh data
      setTimeout(() => {
        fetchDepositData();
      }, 2000);
    } catch (err) {
      console.error('Error submitting deposit:', err);
      setErrorMessage(err.message);
      setShowErrorModal(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const normalized = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/${normalized}`;
  };

  const aedAmount = parseFloat(formData.amount) || 0;
  const rupeesAmount = aedAmount * 75;
  const totalBalance =
    Number(wallet?.main_balance || 0) +
    Number(wallet?.referral_balance || 0) +
    Number(wallet?.bonus_balance || 0);

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">


        <section className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Add Funds</p>
              <h1 className="dashboard-modern-title">Deposit</h1>
            </div>
            <div className="dashboard-header-actions">
              <button
                className="dashboard-header-icon"
                onClick={() => navigate('/transactions')}
                aria-label="Deposit history"
                type="button"
              >
                <FontAwesomeIcon icon={faHistory} />
              </button>
            </div>
          </div>

          <div className="withdraw-status-overview">
            <div className="withdraw-status-card">
              <p>Balance</p>
              <h3>AED {totalBalance.toFixed(2)}</h3>
            </div>
            <div className="withdraw-status-card">
              <p>Price </p>
              <h3>1 AED: Rs 75</h3>
            </div>
            <div className="withdraw-status-card">
              <p>Process Time</p>
              <h3>2-24 Hours</h3>
            </div>
          </div>
        </section>

        {account && (
          <section className="deposit-payment-section deposit-panel">
            <h2 className="section-title">Payment Details</h2>

            <div className="payment-content">
              <div className="payment-qr-box">
                <p className="qr-label"><FontAwesomeIcon icon={faQrcode} /> Scan to Pay || Till ID</p>
                {account.qrImagePath ? (
                  <img
                    src={resolveImageUrl(account.qrImagePath)}
                    alt="QR Code"
                    className="qr-image"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="qr-placeholder">No QR Uploaded</div>
                )}
                {/* <div className="till-value">{account.till_id || account.tillId || 'N/A'}</div> */}
                <button
                  className="profile-logout-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(account.till_id || account.tillId || '');
                    setCopiedTill(true);
                    setTimeout(() => setCopiedTill(false), 1800);
                  }}
                >
                  <FontAwesomeIcon icon={faCopy} /> {copiedTill ? 'Copied' : 'Copy Till ID'}
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="deposit-form-section deposit-panel">
          <h2 className="section-title">Deposit Information</h2>



          <form className="deposit-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Deposit Amount (AED) <span className="required">*</span>
              </label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">AED</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount (min: 5)"
                  min="5"
                  step="0.01"
                  className="form-input"
                  required
                />
                <span className="currency-symbol">Rs{rupeesAmount.toFixed(2)}</span>
              </div>
              
            </div>

            <div className="form-group">
              <label className="form-label">
                Transaction ID / Reference Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleInputChange}
                placeholder="Enter transaction ID (e.g., T123456789)"
                className="form-input"
                required
              />
              <p className="form-hint">Find this in your payment receipt or bank statement</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Upload Screenshot (Payment Proof) <span className="required">*</span>
              </label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="screenshot"
                  name="screenshot"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                  required
                />
                <label htmlFor="screenshot" className="file-upload-label">
                  <span className="upload-icon">📸</span>
                  <span className="upload-text">
                    {formData.screenshotName || 'Click to upload screenshot'}
                  </span>
                </label>
              </div>
              <p className="form-hint">Upload clear screenshot showing transaction details</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Sender Mobile Number <span className="required">*</span>
              </label>
              <div className="phone-input-wrapper">
                <span className="phone-prefix">
                  <FontAwesomeIcon icon={faMobileAlt} />
                </span>
                <input
                  type="tel"
                  name="senderMobile"
                  value={formData.senderMobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number (with country code)"
                  className="form-input"
                  required
                />
              </div>
              <p className="form-hint">Use the same mobile number used for payment transfer</p>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} /> Submit Deposit
                </>
              )}
            </button>
          </form>
        </section>
        <section className="withdraw-instructions withdraw-panel">
          <div className="withdraw-section-head">
            <h3>Important Instructions</h3>
          </div>
          <ul>
            <li><FontAwesomeIcon icon={faCircleExclamation} />AED 1.00 is equivalent to Rs 75.</li>
            <li><FontAwesomeIcon icon={faCircleExclamation} /> Minimum withdrawal amount is AED 3.00.</li>
            <li><FontAwesomeIcon icon={faCircleExclamation} /> Use provided Till ID or scan QR code for payment.</li>
            <li><FontAwesomeIcon icon={faCircleExclamation} /> Screenshot Image Must Be Clear and Legible.</li>
            <li><FontAwesomeIcon icon={faCircleExclamation} /> Deposits are verified within 2-4 hours .</li>
          </ul>
        </section>

        <BottomNav />

        {/* Error Modal */}
        {showErrorModal && (
          <ErrorModal
            message={errorMessage}
            onClose={() => setShowErrorModal(false)}
            closeDuration={3000}
          />
        )}
      </div>
    </div>
  );
};

export default Deposit;
