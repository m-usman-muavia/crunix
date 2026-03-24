import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGift,
  faClockRotateLeft,
  faCheckCircle,
  faCoins,
  faTicket,
  faArrowRotateRight
} from '@fortawesome/free-solid-svg-icons';
import './css/dashboard.css';
import './css/plans.css';
import './css/bonus.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';
import ErrorModal from './ErrorModal';

const BONUS_HISTORY_KEY = 'bonusRedeemHistory';

const Bonus = () => {
  const [bonusCode, setBonusCode] = useState('');
  const [bonusBalance, setBonusBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [redeemingBonus, setRedeemingBonus] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchWallet();
    loadLocalHistory();
  }, []);

  const loadLocalHistory = () => {
    try {
      const stored = localStorage.getItem(BONUS_HISTORY_KEY);
      if (!stored) {
        setHistory([]);
        return;
      }
      const parsed = JSON.parse(stored);
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error('Failed to parse bonus history:', err);
      setHistory([]);
    }
  };

  const fetchWallet = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet');
      }

      const data = await response.json();
      setBonusBalance(Number(data.bonus_balance || 0));
    } catch (err) {
      console.error('Error fetching wallet bonus:', err);
      setBonusBalance(0);
    }
  };

  const oldCollectedTotal = useMemo(() => {
    return history.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [history]);

  const handleCodeChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    setBonusCode(digitsOnly);
  };

  const saveHistoryItem = (entry) => {
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem(BONUS_HISTORY_KEY, JSON.stringify(updated));
  };

  const handleRedeem = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(bonusCode)) {
      setErrorMessage('Please enter a valid 6 digit bonus number');
      setErrorModalOpen(true);
      return;
    }

    setRedeemingBonus(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bonus/redeem`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: bonusCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to redeem bonus');
      }

      setBonusBalance(Number(data.newBonusBalance || 0));
      saveHistoryItem({
        id: `${Date.now()}-${bonusCode}`,
        code: bonusCode,
        amount: Number(data.bonusAmount || 0),
        status: 'Collected',
        date: new Date().toISOString()
      });

      setBonusCode('');
      setErrorMessage(`Bonus collected successfully. AED ${Number(data.bonusAmount || 0).toFixed(2)} added.`);
      setErrorModalOpen(true);
    } catch (err) {
      console.error('Error redeeming bonus:', err);
      setErrorMessage(err.message || 'Error redeeming bonus code. Please try again.');
      setErrorModalOpen(true);
    } finally {
      setRedeemingBonus(false);
    }
  };

  const formatDateTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">
        <div className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Rewards</p>
              <h1 className="dashboard-modern-title">Bonus</h1>
            </div>
            <div className="dashboard-header-actions">
              <span className="dashboard-header-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faGift} />
              </span>
            </div>
          </div>

          <div className="bonus-status-overview plans-status-overview">
            <div className="plans-status-card">
              <p className="plans-status-label">Current Bonus Balance</p>
              <h3 className="plans-status-value">AED {bonusBalance.toFixed(2)}</h3>
            </div>
            <div className="plans-status-card">
              <p className="plans-status-label">Old Bonus Collected</p>
              <h3 className="plans-status-value">AED {oldCollectedTotal.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <section className="dashboard-showcase bonus-redeem-section">
          <div className="bonus-card">
            <div className="bonus-card-head">
              <h3>
                <FontAwesomeIcon icon={faTicket} /> Enter 6 Digit Bonus Number
              </h3>
            </div>

            <form onSubmit={handleRedeem} className="bonus-redeem-form">
              <input
                type="text"
                value={bonusCode}
                onChange={handleCodeChange}
                placeholder="000000"
                inputMode="numeric"
                maxLength={6}
                className="bonus-code-input"
                required
              />
              <button type="submit" className="bonus-submit-btn" disabled={redeemingBonus}>
                {redeemingBonus ? (
                  <>
                    <FontAwesomeIcon icon={faArrowRotateRight} spin /> Processing
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} /> Collect Bonus
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        <section className="dashboard-showcase bonus-history-section">
          <div className="dashboard-section-head">
            <h3>
              <FontAwesomeIcon icon={faClockRotateLeft} /> Old Bonus History
            </h3>
          </div>

          <div className="bonus-history-list">
            {history.length === 0 ? (
              <div className="bonus-empty-history">
                <p>No bonus collected yet.</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bonus-history-item">
                  <div className="bonus-history-left">
                    <div className="bonus-history-icon">
                      <FontAwesomeIcon icon={faCoins} />
                    </div>
                    <div>
                      <h4>Code: {item.code}</h4>
                      <p>{formatDateTime(item.date)}</p>
                    </div>
                  </div>
                  <div className="bonus-history-right">
                    <h4>AED {Number(item.amount || 0).toFixed(2)}</h4>
                    <p>{item.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <ErrorModal
          isOpen={errorModalOpen}
          message={errorMessage}
          onClose={() => setErrorModalOpen(false)}
          autoClose={true}
          closeDuration={2500}
        />

        <BottomNav />
      </div>
    </div>
  );
};

export default Bonus;
