import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faBox, faLock } from '@fortawesome/free-solid-svg-icons';
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
    { target: 10, bonus: 3, current: activeReferrals, status: getMilestoneStatus(10) },
    { target: 25, bonus: 8, current: activeReferrals, status: getMilestoneStatus(25) },
    { target: 50, bonus: 20, current: activeReferrals, status: getMilestoneStatus(50) },
    { target: 100, bonus: 50, current: activeReferrals, status: getMilestoneStatus(100) },
    { target: 200, bonus: 110, current: activeReferrals, status: getMilestoneStatus(200) }
  ];
  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
                        <div className="deposit-header">Referrals</div>
          <div className="plan-image">
          <img 
            src="/image2.webp" 
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

        <div className="withdrawal-balance-card">
          <div className="withdrawal-main-balance">
            <p className="withdrawal-main-balance-label">Total Earned <br /> <span style={{fontSize: '12px'}}>Total Earning from Refferals</span></p>
            <h2 className="withdrawal-main-balance-amount">${referralEarnings}</h2>
          </div>
        </div>
       

        <div className="refferrals-section refferrals-section-new">
          <div className="referral-panel">
              <div className="referral-hero-text">
                <h3>Invite & Earn</h3>
                <p>Build your team and earn passive income.</p>
              </div>
  
            

            <div className="referral-stats-grid">
              <div className="referral-stat-card">
                <span className="referral-stat-label">Total Referrals</span>
                <span className="referral-stat-value">{totalReferrals}</span>
              </div>
              <div className="referral-stat-card">
                <span className="referral-stat-label">Active Referrals</span>
                <span className="referral-stat-value">{activeReferrals}</span>
              </div>
              <div className="referral-stat-card referral-stat-accent">
                <span className="referral-stat-label">Commission Earned</span>
                <span className="referral-stat-value">$ {referralEarnings}</span>
              </div>
            </div>

            <div className="referral-link-card">
              <div className="referral-link-header">
                <h4>Referral Code</h4>
                <span className="referral-code-pill">{referralCode || 'N/A'}</span>
              </div>
              <div className="referral-link-row">
                <div className="referral-link-input">
                  {referralCode && referralCode !== 'N/A'
                    ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/registration?code=${encodeURIComponent(referralCode)}`
                    : 'Referral code not available'}
                </div>
                <button
                  className="referral-copy-btn"
                  onClick={handleCopyReferralCode}
                  disabled={loading || referralCode === 'N/A'}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                  {copied ? ' Copied' : ' Copy Link'}
                </button>
              </div>
              <div className="referral-info-banner">
                <strong>Multi-Level System:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
                  <li>Level 1 (Direct): 10% on their daily income</li>
                  <li>Level 2: 3% on indirect referrals' daily income</li>
                  <li>Level 3: 1% on 3rd tier referrals' daily income</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Referral List Section */}
        {/* {referralList.length > 0 && (
          <div className="refferrals-section">
            <div className="refferrals-card">
              <h3 className="refferrals-header">Your Referrals</h3>
              <div className="referrals-table">
                {referralList.map((referral) => (
                  <div key={referral._id} className="referral-item" style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{referral.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{referral.email}</div>
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                        Joined: {new Date(referral.joinedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: referral.status === 'activated' ? '#d4edda' : '#fff3cd',
                      color: referral.status === 'activated' ? '#155724' : '#856404',
                      border: `1px solid ${referral.status === 'activated' ? '#c3e6cb' : '#ffeeba'}`
                    }}>
                      {referral.status === 'activated' ? '✅ Active' : '⏳ Registered'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}

        <div className="refferrals-milestones-section">
          <h3 className="milestone-main-title">Bonus Milestones</h3>

          {/* Per-Active-Referral Collection Card */}
          <div className="refferrals-milestones-cards" style={{ marginBottom: '20px' }}>
            <div className="milestone-card milestone-card-dark" style={{background: '#eaf4ff', border: '2px solid #0055A4', borderRadius: '8px' }} >
              <div className="milestone-row" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <span className="milestone-target" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    Active Referral Bonus
                  </span>
                  <span style={{ 
                fontSize: '12px'
              }}>Bonus: Get $0.8 for each active referral (one-time when they purchase a plan)</span>
                </div>
                <button
                  onClick={handleCollectBonus}
                  disabled={collecting || collectibleBonuses.count === 0}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: collectibleBonuses.count > 0 ? '#10b981' : '#6b7280',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: collectibleBonuses.count > 0 ? 'pointer' : 'not-allowed',
                    opacity: collecting ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: collectibleBonuses.count > 0 ? '0 4px 6px rgba(0, 51, 102, 0.3)' : 'none'
                  }}
                >
                  {collecting ? 'Collecting...' : collectibleBonuses.count > 0 ? `Collect $${collectibleBonuses.totalAmount.toFixed(2)}` : 'Locked  '}
                </button>
              </div>
              
              {collectMessage && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: collectMessage.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: 'white',
                  fontSize: '13px',
                  marginTop: '10px',
                  border: `1px solid ${collectMessage.includes('✅') ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                }}>
                  {collectMessage}
                </div>
              )}

            </div>
          </div>
          <h3 className="milestone-main-title" style={{ marginTop: '30px' }}>Team Growth Rewards</h3>
          <div className="refferrals-milestones-cards">
            {milestones.map((item, index) => {
              const progressPercentage = Math.min((item.current / item.target) * 100, 100);
              return (
                <div className="milestone-card milestone-card-dark" key={index}>
                  <div className="milestone-row">
                    <span className="milestone-target">Target: {item.target} Members</span>
                    <span className="milestone-bonus">${item.bonus} Bonus</span>
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
        </div>

          

        {/* Updated Plan Content Section */}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default Refferrals;