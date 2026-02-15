import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/DepositUI.css';
import API_BASE_URL from '../config/api';
import ErrorModal from './ErrorModal';
import BottomNav from './BottomNav';

const Deposit = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState('jazzcash');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const quickAmounts = [5, 10, 25, 50,100];

  useEffect(() => {
    fetchWallet();
  }, []);

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

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      setErrorModalOpen(true);
      return;
    }
    // Navigate to confirmation page with amount
    navigate('/depositconfirm', { state: { amount, channel: selectedChannel } });
  };

  return (
    <div className="deposit-container">
      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModalOpen}
        message={errorMessage}
        onClose={() => setErrorModalOpen(false)}
        autoClose={true}
        closeDuration={3000}
      />

      {/* Header */}
      <div className="deposit-header">Deposit</div>

      {/* Card */}
      <div className="deposit-card">
        {/* Top Row */}
        <div className="top-row">
          <p>
            Current Balance: <span>${balance.toFixed(2)}</span>
          </p>
          <button 
            onClick={() => navigate('/deposithistory')}
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
            Deposit History
          </button>
        </div>

        {/* Input */}
        <input
          type="number"
          placeholder="$ Input recharge amount"
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
        <h3 className="channel-title">Select Deposit Account</h3>

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

        {/* Deposit Button */}
        <button className="primary-btn" onClick={handleDeposit}>Deposit</button>

        {/* Footer Notes */}
        <ul className="notes">
          <li>$1.00 ≈ Rs 300</li>
          <li>Minimum first deposit $5</li>
          <li>Use only official channels</li>
          <li>Transfer exact amount shown</li>
        </ul>
      </div>


      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Deposit;
