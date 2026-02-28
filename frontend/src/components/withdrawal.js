import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/DepositUI.css';
import API_BASE_URL from '../config/api';
import ErrorModal from './ErrorModal';
import BottomNav from './BottomNav';

const Withdrawal = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState('jazzcash');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSundayBlockModal, setIsSundayBlockModal] = useState(false);
  const [countdownText, setCountdownText] = useState('');

  const quickAmounts = [3, 10, 25, 50, 100];

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
      setWallet(data);
      const main = data.main_balance || 0;
      const referral = data.referral_balance || 0;
      const bonus = data.bonus_balance || 0;
      const totalBalance = main + referral + bonus;
      setBalance(totalBalance);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setLoading(false);
    }
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleWithdraw = () => {
    const today = new Date();
    if (today.getDay() === 0) {
      setIsSundayBlockModal(true);
      setErrorModalOpen(true);
      setErrorMessage(`Withdrawals are closed on Sunday. They will begin again on Monday morning at 8 a.m. Countdown: ${countdownText || 'calculating...'}`);
      return;
    }

    setIsSundayBlockModal(false);

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      setErrorModalOpen(true);
      return;
    }
    if (parseFloat(amount) > balance) {
      setErrorMessage('Insufficient balance for this withdrawal');
      setErrorModalOpen(true);
      return;
    }
    // Navigate to confirmation page with amount
    navigate('/withdrawconfirm', { state: { amount, channel: selectedChannel } });
  };

  return (
    <div className="deposit-container">
      {/* Error Modal */}
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

      {/* Header */}
      <div className="deposit-header">Withdraw</div>

      {/* Card */}
      <div className="deposit-card">
        {/* Top Row */}
        <div className="top-row">
          <p>
            Current Balance: <span>${balance.toFixed(2)}</span>
          </p>
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
            Withdraw History
          </button>
        </div>

        {/* Input */}
        <input
          type="number"
          placeholder="$ Input withdraw amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <p className="pkr-text">≈ {amount ? (parseFloat(amount) * 300).toFixed(0) : 0} PKR</p>

        {/* Quick Buttons */}
        <div className="quick-buttons">
          {quickAmounts.map((val) => (
            <button key={val} onClick={() => handleQuickAmount(val)}>
              ${val}
            </button>
          ))}
        </div>



        {/* Deposit Channel */}
        <h3 className="channel-title">Select Withdrawal Account</h3>

        <div className="channels">
          <div 
            className={`channel-box ${selectedChannel === 'jazzcash' ? 'active' : ''}`}
            onClick={() => setSelectedChannel('jazzcash')}
          >
            <p className="channel-name">JazzCash / EasyPaisa</p>
            
          </div>

          <div 
            className={`channel-box ${selectedChannel === 'usdt' ? 'active' : ''}`}
            onClick={() => setSelectedChannel('usdt')}
          >
            <span className="badge">No fee</span>
            <p className="channel-name">USDT</p>
            <span1>(TRC20)</span1>
          </div>
        </div>

        {/* Withdraw Button */}
        <button className="primary-btn" onClick={handleWithdraw}>Withdraw</button>

        {/* Footer Notes */}
        <ul className="notes">
          <li>$1.00 ≈ Rs 300</li>
          <li>5% handling fee will be charged</li>
          <li>No withdrawal Fee on USDT</li>
          <li>Minimum withdrawal $3</li>
          <li>Use only official channels</li>
          <li style={{color:'red'}}>No Withdrawal On Sunday</li>
        </ul>
      </div>


      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Withdrawal;
