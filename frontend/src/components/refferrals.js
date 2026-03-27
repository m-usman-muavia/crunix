import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck,faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import './css/dashboard.css';
import './css/style.css';
import './css/refferrals.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const Refferrals = () => {
  const [balance, setBalance] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralList, setReferralList] = useState([]);
  const [collectibleBonuses, setCollectibleBonuses] = useState({ count: 0, totalAmount: 0, referrals: [] });
  const [collecting, setCollecting] = useState(false);
  const [collectMessage, setCollectMessage] = useState('');

  useEffect(() => {
    fetchBalance();
    fetchReferralCode();
    fetchReferralStats();
    fetchReferralList();
    fetchCollectibleBonuses();
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
      const main = data.main_balance || 0;
      const referral = data.referral_balance || 0;
      const bonus = data.bonus_balance || 0;
      const totalBalance = main + referral + bonus;
      setBalance(totalBalance);
      setReferralEarnings(data.referral_balance || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(0);
    }
  };

  const fetchReferralStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referral/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referral stats');
      }

      const data = await response.json();
      setTotalReferrals(data.totalReferrals || 0);
      setActiveReferrals(data.activeReferrals || 0);
    } catch (err) {
      console.error('Error fetching referral stats:', err);
      setTotalReferrals(0);
      setActiveReferrals(0);
    }
  };

  const fetchReferralList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referral/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referral list');
      }

      const data = await response.json();
      setReferralList(data || []);
    } catch (err) {
      console.error('Error fetching referral list:', err);
      setReferralList([]);
    }
  };

  const fetchReferralCode = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No auth token found');
        setReferralCode('N/A');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/referral/code`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Referral Code Response:', data);
      
      // Try multiple possible field names
      const code = data.referralCode || data.referral_code || 'N/A';
      setReferralCode(code);
    } catch (err) {
      console.error('Error fetching referral code:', err);
      setReferralCode('N/A');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferralCode = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const shareLink = `${origin}/registration?code=${encodeURIComponent(referralCode)}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const fetchCollectibleBonuses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referral/collectible`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collectible bonuses');
      }

      const data = await response.json();
      setCollectibleBonuses(data);
    } catch (err) {
      console.error('Error fetching collectible bonuses:', err);
      setCollectibleBonuses({ count: 0, totalAmount: 0, referrals: [] });
    }
  };

  const handleCollectBonus = async () => {
    if (collectibleBonuses.count === 0) {
      setCollectMessage('No bonuses to collect');
      setTimeout(() => setCollectMessage(''), 3000);
      return;
    }

    setCollecting(true);
    setCollectMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/referral/collect-bonus`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setCollectMessage(data.message || 'Failed to collect bonuses');
        setTimeout(() => setCollectMessage(''), 3000);
        return;
      }

      setCollectMessage(`✅ ${data.message}`);
      
      // Refresh data
      await fetchBalance();
      await fetchCollectibleBonuses();
      
      setTimeout(() => setCollectMessage(''), 5000);
    } catch (err) {
      console.error('Error collecting bonuses:', err);
      setCollectMessage('Error collecting bonuses. Please try again.');
      setTimeout(() => setCollectMessage(''), 3000);
    } finally {
      setCollecting(false);
    }
  };

  // Calculate milestone status based on active referrals
  const getMilestoneStatus = (target) => {
    if (activeReferrals >= target) {
      return "Unlocked";
    } else if (activeReferrals >= target * 0.5) {
      return "In Progress";
    } else {
      return "Locked";
    }
  };

  const milestones = [
    { target: 10, bonus: 5, current: activeReferrals, status: getMilestoneStatus(10) },
    { target: 25, bonus: 10, current: activeReferrals, status: getMilestoneStatus(25) },
    { target: 50, bonus: 30, current: activeReferrals, status: getMilestoneStatus(50) },
    { target: 100, bonus: 80, current: activeReferrals, status: getMilestoneStatus(100) },
    { target: 200, bonus: 220, current: activeReferrals, status: getMilestoneStatus(200) }
  ];

  const referralShareLink =
    referralCode && referralCode !== 'N/A'
      ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/registration?code=${encodeURIComponent(referralCode)}`
      : 'Referral code not available';

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">
        <section className="dashboard-modern-hero dashboard-service-hero referral-hero-shell">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Grow your network</p>
              <h1 className="dashboard-modern-title">Referrals</h1>
            </div>
          </div>

          <div className="referral-hero-stats">
            <div className="referral-hero-stat-item">
              <p>Total Earned</p>
              <h3>AED {Number(referralEarnings || 0).toFixed(2)}</h3>
            </div>
            <div className="referral-hero-stat-item">
              <p>Team Size</p>
              <h3>{referralList.length}</h3>
            </div>
              <div className="referral-hero-stat-item">
              <p>Team Active</p>
              <h3>{activeReferrals}</h3>
            </div>
          </div>
        </section>

        <section className="refferrals-section refferrals-section-new refferrals-milestones-section">
          <div className="referral-panel1">
            <div className="referral-link-card">
              <div className="referral-link-header">
                <h4>Referral Code</h4>
                <span className="referral-code-pill">{referralCode || 'N/A'}</span>
              </div>
              <div className="referral-link-row">
                <button
                  className="profile-logout-btn"
                  onClick={handleCopyReferralCode}
                  disabled={loading || referralCode === 'N/A'}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                  {copied ? ' Copied' : ' Copy Link'}
                </button>
              </div>
            </div>
          </div>

          <h3 className="milestone-main-title milestone-subtitle">Team Growth Rewards</h3>
          <div className="refferrals-milestones-cards">
            {milestones.map((item, index) => {
              const progressPercentage = Math.min((item.current / item.target) * 100, 100);
              return (
                <div className="milestone-card milestone-card-dark" key={index}>
                  <div className="milestone-row">
                    <span className="milestone-target">Target: {item.target} Members</span>
                    <span className="milestone-bonus">AED {item.bonus} Bonus</span>
                  </div>
                  <div className="milestone-progress-bar">
                    <div
                      className="milestone-progress-fill"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="milestone-progress-meta">
                    <span>{item.current} / {item.target}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

          

        <section className="withdraw-instructions withdraw-panel" style={{textAlign:'left'}}>
                  <div className="withdraw-section-head">
                    <h3>Performance-Focused</h3>
                  </div>
                  <ul>
                    <li><FontAwesomeIcon icon={faCircleExclamation} /> Earn 10% daily commission on personal referrals' earnings.</li>
                    <li><FontAwesomeIcon icon={faCircleExclamation} /> Earn 3% daily commission on the income of your referrals' referrals.</li>
                    <li><FontAwesomeIcon icon={faCircleExclamation} /> Earn 1% daily commission on the income generated by the third layer of your team.</li>
                  </ul>
                </section>

                      {/* <h3 className="milestone-main-title">Bonus Milestones</h3>

          <div className="refferrals-milestones-cards referral-collect-wrap">
            <div className="milestone-card milestone-card-dark milestone-card-highlight">
              <div className="milestone-row referral-collect-row">
                <div className="referral-collect-left">
                  <span className="milestone-target referral-collect-title">Active Referral Bonus</span>
                  <span className="referral-collect-subtitle">Bonus: Get AED 0.8 for each active referral (one-time when they purchase a plan)</span>
                </div>
                <button
                  onClick={handleCollectBonus}
                  disabled={collecting || collectibleBonuses.count === 0}
                  className={`collect-bonus-btn ${collectibleBonuses.count > 0 ? 'collect-bonus-btn-active' : 'collect-bonus-btn-locked'}`}
                >
                  {collecting ? 'Collecting...' : collectibleBonuses.count > 0 ? `Collect AED ${collectibleBonuses.totalAmount.toFixed(2)}` : 'Locked'}
                </button>
              </div>
              
              {collectMessage && (
                <div className={`collect-message ${collectMessage.includes('✅') ? 'collect-message-success' : 'collect-message-error'}`}>
                  {collectMessage}
                </div>
              )}

            </div>
          </div> */}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default Refferrals;