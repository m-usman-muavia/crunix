import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser, faClock, faChartLine, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/refferrals.css';
import API_BASE_URL from '../config/api';

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
      setBalance(data.main_balance || 0);
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
    { target: 15, salary: "1,000", current: activeReferrals, status: getMilestoneStatus(15) },
    { target: 25, salary: "3,000", current: activeReferrals, status: getMilestoneStatus(25) },
    { target: 50, salary: "7,000", current: activeReferrals, status: getMilestoneStatus(50) },
    { target: 100, salary: "15,000", current: activeReferrals, status: getMilestoneStatus(100) },
    { target: 250, salary: "40,000", current: activeReferrals, status: getMilestoneStatus(250) },
    { target: 500, salary: "90,000", current: activeReferrals, status: getMilestoneStatus(500) },
  ];
  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="plan-header">
          <div className="plan-avatar"><FontAwesomeIcon icon={faBox} /></div>
          <div className="plan-user-info">
            <h4 className="plan-username">Referrals</h4>
            <p className="plan-email">دوستوں کو مدعو کریں  </p>
          </div>
          <div className="plan-balance">Balance: <span>Rs {balance}</span></div>
        </header>

        <div className="refferrals-section">
          <div className="refferrals-card">
            <h3 className="refferrals-header">Your Referral Code</h3>
            <div className="refferrals-links">
              <p className="refferrals-code">{referralCode || 'N/A'}</p>
              <button 
                className="refferrals-link-btn" 
                onClick={handleCopyReferralCode}
                disabled={loading || referralCode === 'N/A'}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                {copied ? ' Copied!' : ' Copy Link'}
              </button>
            </div>
            <div className="refferrals-info">
              <div className="refferrals-info-stats">
                <h4>👨‍👦‍👦 Total Referrals</h4>
                <p>{totalReferrals}</p>
              </div>
              <div className="refferrals-info-stats">
                <h4>🙋🏻‍♂️ Active Referrals</h4>
                <p>{activeReferrals}</p>
              </div>
              <div className="refferrals-info-stats">
                <h4>🤑 Earnings</h4>
                <p>Rs {referralEarnings}</p>
              </div>
              <div className="refferrals-info-stats">
                <h4 >💸 Commission Rate</h4>
                <p >10%</p>
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
  <h3 className="milestone-main-title">Weekly Salary Milestones</h3>
  <div className="refferrals-milestones-cards">
    {milestones.map((item, index) => {
      const progressPercentage = Math.min((item.current / item.target) * 100, 100);
      const isUnlocked = item.status === "Unlocked";
      
      return (
        <div className="milestone-card" key={index} style={{ 
          opacity: isUnlocked ? 1 : 0.85,
          border: isUnlocked ? '2px solid #4CAF50' : '1px solid #ddd'
        }}>
          <div className="milestone-top">
            <div className="milestone-icon-box" style={{
              backgroundColor: isUnlocked ? '#4CAF50' : '#ccc'
            }}>
               <FontAwesomeIcon icon={isUnlocked ? faCheck : faLock} />
            </div>
            
            <div className="milestone-details">
              <h4 className="milestone-title">{item.target} Active Investors</h4>
              <div className="milestone-salary-row">
                <span className="milestone-amount">Rs {item.salary}</span>
              </div>
            </div>

            <div className="milestone-status">
              <span className={isUnlocked ? "status-unlocked" : "status-locked"} style={{
                backgroundColor: isUnlocked ? '#d4edda' : '#f8d7da',
                color: isUnlocked ? '#155724' : '#721c24',
                border: `1px solid ${isUnlocked ? '#c3e6cb' : '#f5c6cb'}`,
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px'
              }}>
                 <FontAwesomeIcon icon={isUnlocked ? faCheck : faLock} style={{fontSize: '10px'}} /> {item.status}
              </span>
            </div>
          </div>

          <div className="milestone-progress-container">
            <div className="progress-labels">
              <span className="progress-current">{item.current} / {item.target} Active</span>
              <span className="progress-needed">
                {item.current >= item.target 
                  ? '✅ Achieved!' 
                  : `${item.target - item.current} needed`}
              </span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${progressPercentage}%`,
                  backgroundColor: isUnlocked ? '#4CAF50' : '#6366f1',
                  transition: 'width 0.5s ease-in-out'
                }}
              ></div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>
          {/* Add faLightbulb or faMoneyBill to your FontAwesome imports if you prefer icons over emojis */}
<div className="how-it-works-section">
  <div className="how-it-works-card">
    <div className="how-it-works-header">
      <span className="how-icon">💰</span>
      <h3>How it Works</h3>
    </div>
    <ul className="how-it-works-list">
      <li>Share your referral code with friends</li>
      <li>
        Get 10% commission when they buy a plan
      </li>
      <li>
        Unlock weekly salary bonuses at milestones
      </li>
      <li>
        Weekly salary continues as long as active investors are maintained
      </li>
      {/* <li className="urdu-text">
        دوستوں کو مدعو کریں، 10% کمائیں اور ہفتہ وار تنخواہ حاصل کریں
      </li> */}
    </ul>
  </div>
</div>
          

        {/* Updated Plan Content Section */}

        {/* Bottom Navigation Section */}
        <nav className="bottom-nav">
          <div className="nav-item">
            <Link to="/dashboard" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faHouse} />
              <span>Dashboard</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/plans" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faBox} />
              <span>Plans</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/deposit" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faArrowDown} />
              <span>Deposit</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/withdrawal" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faArrowUp} />
              <span>Withdraw</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/refferrals" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faUsers} />
              <span>Referral</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/profile" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faUser} />
              <span>Profile</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Refferrals;