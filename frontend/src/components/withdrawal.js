import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import './css/dashboard.css';
import './css/deposit-new.css';
import './css/withdrawal-new.css';
import API_BASE_URL from '../config/api';
import ErrorModal from './ErrorModal';
import BottomNav from './BottomNav';

const Withdrawal = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    method: 'jazzcash',
    accountNumber: '',
    accountName: '',
    mobileNumber: ''
  });
  const [balance, setBalance] = useState(0);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSundayBlockModal, setIsSundayBlockModal] = useState(false);
  const [countdownText, setCountdownText] = useState('');

  const quickAmounts = [3, 10, 25, 50, 100];
  const accountOptions = ['jazzcash', 'easypaisa', 'hbl', 'ubl', 'meezan', 'sadapay', 'nayapay'];

  useEffect(() => {
    fetchWallet();
  }, []);

  useEffect(() => {
    if (!isSundayBlockModal || !errorModalOpen) {
      return;
    }

    const getNextMondayEightAM = () => {
      const now = new Date();
      const target = new Date(now);
      const day = now.getDay();
      const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7;
      target.setDate(now.getDate() + daysUntilMonday);
      target.setHours(8, 0, 0, 0);
      if (daysUntilMonday === 0 && now >= target) {
        target.setDate(target.getDate() + 7);
      }
      return target;
    };

    const formatCountdown = (milliseconds) => {
      if (milliseconds <= 0) {
        return '0h 0m 0s';
      }
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    const updateCountdown = () => {
      const now = new Date();
      const target = getNextMondayEightAM();
      const remaining = target.getTime() - now.getTime();
      const countdown = formatCountdown(remaining);
      setCountdownText(countdown);
      setErrorMessage(`Withdrawals are closed on Sunday. They will begin again on Monday morning at 8 a.m. Countdown: ${countdown}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isSundayBlockModal, errorModalOpen]);

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
      const main = data.main_balance || 0;
      const referral = data.referral_balance || 0;
      const bonus = data.bonus_balance || 0;
      const totalBalance = main + referral + bonus;
      setBalance(totalBalance);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleQuickAmount = (value) => {
    setFormData((prev) => ({ ...prev, amount: value.toString() }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWithdraw = (e) => {
    e.preventDefault();

    const today = new Date();
    if (today.getDay() === 0) {
      setIsSundayBlockModal(true);
      setErrorModalOpen(true);
      setErrorMessage(`Withdrawals are closed on Sunday. They will begin again on Monday morning at 8 a.m. Countdown: ${countdownText || 'calculating...'}`);
      return;
    }

    setIsSundayBlockModal(false);

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      setErrorModalOpen(true);
      return;
    }

    if (parseFloat(formData.amount) < 3) {
      setErrorMessage('Minimum withdrawal amount is AED 3');
      setErrorModalOpen(true);
      return;
    }

    if (parseFloat(formData.amount) > balance) {
      setErrorMessage('Insufficient balance for this withdrawal');
      setErrorModalOpen(true);
      return;
    }

    if (!formData.accountNumber.trim() || !formData.accountName.trim() || !formData.mobileNumber.trim()) {
      setErrorMessage('Please complete all required account details');
      setErrorModalOpen(true);
      return;
    }

    navigate('/withdrawconfirm', {
      state: {
        amount: formData.amount,
        channel: formData.method,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        mobileNumber: formData.mobileNumber
      }
    });
  };

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">
        <ErrorModal
          isOpen={errorModalOpen}
          message={errorMessage}
          onClose={() => {
            setErrorModalOpen(false);
            setIsSundayBlockModal(false);
            setCountdownText('');
          }}
          autoClose={!isSundayBlockModal}
          closeDuration={3000}
        />

        <section className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Withdraw Funds</p>
              <h1 className="dashboard-modern-title">Withdrawal</h1>
            </div>
            <div className="dashboard-header-actions">
              <button
                className="dashboard-header-icon"
                onClick={() => navigate('/transactions')}
                aria-label="Withdrawal history"
                type="button"
              >
                <FontAwesomeIcon icon={faHistory} />
              </button>
            </div>
          </div>

          <div className="withdraw-status-overview">
            <div className="withdraw-status-card">
              <p>Balance</p>
              <h3>AED {balance.toFixed(2)}</h3>
            </div>
            <div className="withdraw-status-card">
              <p>Minimum</p>
              <h3>AED 3.00</h3>
            </div>
            <div className="withdraw-status-card">
              <p>Process Time</p>
              <h3>2-24 Hours</h3>
            </div>
          </div>
        </section>

        <section className="withdraw-form-section withdraw-panel">
          <h2 className="section-title">Withdrawal Information</h2>

          <form className="deposit-form" onSubmit={handleWithdraw}>
            <div className="form-group">
              <label className="form-label">Withdrawal Amount (AED) <span className="required">*</span></label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">AED</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  min="3"
                  step="0.01"
                  className="form-input"
                  required
                />
              </div>
              <p className="form-hint">Minimum withdrawal amount is AED 3.00</p>
            </div>

            <div className="form-group">
              <label className="form-label">Account Type <span className="required">*</span></label>
              <div className="withdraw-select-wrap">
                <select name="method" value={formData.method} onChange={handleInputChange} className="form-input" required>
                  {accountOptions.map((option) => (
                    <option key={option} value={option}>{option.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <p className="form-hint">Select your payout account type</p>
            </div>

            <div className="form-group">
              <label className="form-label">Account Number <span className="required">*</span></label>
              <div className="withdraw-input-wrap">
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  className="form-input"
                  required
                />
              </div>
              <p className="form-hint">Verify the account number before submitting</p>
            </div>

            <div className="form-group">
              <label className="form-label">Account Name <span className="required">*</span></label>
              <div className="withdraw-input-wrap">
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="Enter account name"
                  className="form-input"
                  required
                />
              </div>
              <p className="form-hint">Enter the account holder name exactly as registered</p>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number <span className="required">*</span></label>
              <div className="withdraw-input-wrap">
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  className="form-input"
                  required
                />
              </div>
              <p className="form-hint">Add your emergency contact number</p>
            </div>

            <button className="submit-btn" type="submit">Continue</button>
          </form>
        </section>

        <section className="withdraw-instructions withdraw-panel">
          <div className="withdraw-section-head">
            <h3>Important Instructions</h3>
          </div>
          <ul>
            <li><FontAwesomeIcon icon={faCircleExclamation} /> Minimum withdrawal is AED 3.00.</li>
            <li><FontAwesomeIcon icon={faCircleExclamation} /> Enter account type and account details correctly.</li>
            <li><FontAwesomeIcon icon={faCircleExclamation} /> Withdrawals are closed on Sunday.</li>
            <li><FontAwesomeIcon icon={faCircleExclamation} /> Processing normally takes 2 to 24 hours.</li>
            <li><FontAwesomeIcon icon={faCircleExclamation} /> Incorrect account details may delay your payment.</li>
          </ul>
        </section>

        <BottomNav />
        </div>
    </div>
  );
};

export default Withdrawal;
