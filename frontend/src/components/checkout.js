import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import './css/style.css';
import './css/plans.css';
import './css/checkout.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';
import ErrorModal from './ErrorModal';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [account, setAccount] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const amountFromState = Number(location.state?.amount || 0);
  const [formData, setFormData] = useState({
    deposit_amount: amountFromState,
    transaction_id: '',
    screenshot: null,
    sender_mobile: ''
  });

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const normalized = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/${normalized}`;
  };

  useEffect(() => {
    if (!amountFromState || amountFromState <= 0) {
      navigate('/add-to-cart');
      return;
    }
    fetchActiveAccount();
  }, [amountFromState, navigate]);

  const fetchActiveAccount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load payment account');
      }

      const data = await response.json();
      setAccount(data);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to load account details');
      setErrorModalOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, screenshot: file }));
  };

  const handleCopyTill = () => {
    const tillId = account?.tillId || account?.till_id || '';
    if (!tillId) return;

    navigator.clipboard.writeText(tillId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {
      setErrorMessage('Failed to copy Till ID');
      setErrorModalOpen(true);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.transaction_id || !formData.sender_mobile || !formData.screenshot) {
      setErrorMessage('Please complete all required fields and upload screenshot.');
      setErrorModalOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('deposit_amount', String(formData.deposit_amount || 0));
      payload.append('transaction_id', formData.transaction_id);
      payload.append('sender_mobile', formData.sender_mobile);
      payload.append('screenshot', formData.screenshot);

      const response = await fetch(`${API_BASE_URL}/api/deposits/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: payload
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Checkout submission failed');
      }

      localStorage.removeItem('planCart');
      setErrorMessage('Payment submitted successfully. Admin will verify your checkout.');
      setErrorModalOpen(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1300);
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong');
      setErrorModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const tillId = account?.tillId || account?.till_id || 'N/A';
  const qrPath = account?.qrImagePath || account?.qr_image_path || '';

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">
        <ErrorModal
          isOpen={errorModalOpen}
          message={errorMessage}
          onClose={() => setErrorModalOpen(false)}
          autoClose={true}
          closeDuration={2500}
        />

        <div className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Secure payment</p>
              <h1 className="dashboard-modern-title">Checkout</h1>
            </div>
            <div className="dashboard-header-actions">
              <Link to="/add-to-cart" className="dashboard-header-icon" aria-label="Back to cart">C</Link>
            </div>
          </div>

          <div className="plans-status-overview" style={{ gridTemplateColumns: '1fr' }}>
            <div className="plans-status-card">
              <p className="plans-status-label">Checkout Amount</p>
              <h3 className="plans-status-value">AED {Number(formData.deposit_amount || 0).toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="checkout-page-content">
          <section className="checkout-pay-card">
            <h3 className="checkout-section-title">Pay To This Account</h3>

            <div className="checkout-qr-wrap">
              {qrPath ? (
                <img
                  src={resolveImageUrl(qrPath)}
                  alt="Payment QR"
                  className="checkout-qr-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="checkout-qr-fallback">QR Not Available</div>
              )}
            </div>

            <div className="checkout-till-box">
              <p className="checkout-till-label">Till ID</p>
              <p className="checkout-till-value">{tillId}</p>
              <button type="button" className="checkout-copy-btn" onClick={handleCopyTill}>
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} /> {copied ? 'Copied' : 'Copy Till ID'}
              </button>
            </div>
          </section>

          <section className="checkout-form-card">
            <h3 className="checkout-section-title">Payment Proof Form</h3>
            <form onSubmit={handleSubmit}>
              <div className="checkout-form-group">
                <label>Transaction ID / Reference Number</label>
                <input
                  type="text"
                  name="transaction_id"
                  value={formData.transaction_id}
                  onChange={handleInputChange}
                  placeholder="Enter transaction reference"
                  required
                />
              </div>

              <div className="checkout-form-group">
                <label>Upload Screenshot (Required)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                {formData.screenshot && (
                  <p className="checkout-file-name">{formData.screenshot.name}</p>
                )}
              </div>

              <div className="checkout-form-group">
                <label>Sender Mobile Number</label>
                <input
                  type="tel"
                  name="sender_mobile"
                  value={formData.sender_mobile}
                  onChange={handleInputChange}
                  placeholder="e.g. 03001234567"
                  required
                />
              </div>

              <button type="submit" className="checkout-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Payment'}
              </button>
            </form>
          </section>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Checkout;
