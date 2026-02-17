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

  useEffect(() => {
    fetchBalance();
    fetchReferralCode();
    fetchReferralStats();
    fetchReferralList();
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
            <div className="referral-hero">
              <div className="referral-hero-text">
                <h3>Invite & Earn</h3>
                <p>Build your team and earn passive income.</p>
              </div>
              <div className="referral-hero-chip">10% Commission</div>
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
                <strong>Level 1 Bonus:</strong> You will receive a 10% commission instantly on your active referrals.
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