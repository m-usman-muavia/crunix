import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser, faClock, faChartLine, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/refferrals.css';

const Refferrals = () => {
  const [balance, setBalance] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
    fetchReferralCode();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      
      const data = await response.json();
      setBalance(data.main_balance || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(0);
    }
  };

  const fetchReferralCode = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/referral/code', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch referral code');
      }
      
      const data = await response.json();
      setReferralCode(data.referralCode || 'N/A');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching referral code:', err);
      setReferralCode('N/A');
      setLoading(false);
    }
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const milestones = [
    { target: 30, salary: "2,000", current: 0, status: "Locked" },
    { target: 100, salary: "7,000", current: 0, status: "Locked" },
  ];
  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="plan-header">
          <div className="plan-avatar"><FontAwesomeIcon icon={faBox} /></div>
          <div className="plan-user-info">
            <h4 className="plan-username">Referral Program</h4>
            <p className="plan-email">دوستوں کو مدعو کریں اور کمائیں</p>
          </div>
          <div className="plan-balance">Balance: <span>Rs {balance}</span></div>
        </header>

        <div className="refferrals-section">
          <div className="refferrals-card">
            <h3 className="refferrals-header">Your Referral Code</h3>
            <div className="refferrals-links">
              <p className="refferrals-code">{loading ? 'Loading...' : referralCode}</p>
              <button 
                className="refferrals-link-btn" 
                onClick={handleCopyReferralCode}
                disabled={loading || referralCode === 'N/A'}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                {copied ? ' Copied!' : ' Copy'}
              </button>
            </div>
            <div className="refferrals-info">
              <div className="refferrals-info-stats">
                <h4 >👨‍👦‍👦 Total Referrals</h4>
                <p >01</p>
              </div><div className="refferrals-info-stats">
                <h4 >🙋🏻‍♂️ Active Referrals</h4>
                <p >01</p>
              </div><div className="refferrals-info-stats">
                <h4 >🤑 Earnings</h4>
                <p >01</p>
              </div>
              <div className="refferrals-info-stats">
                <h4 >💸 Commission Rate</h4>
                <p >01</p>
              </div>
            </div>

          </div>

        </div>

        <div className="refferrals-milestones-section">
  <h3 className="milestone-main-title">Weekly Salary Milestones</h3>
  <div className="refferrals-milestones-cards">
    {milestones.map((item, index) => (
      <div className="milestone-card" key={index}>
        <div className="milestone-top">
          <div className="milestone-icon-box">
             <FontAwesomeIcon icon={faLock} />
          </div>
          
          <div className="milestone-details">
            <h4 className="milestone-title">{item.target} Active Investors</h4>
            <div className="milestone-salary-row">
              <span className="milestone-amount">Rs {item.salary}</span>
            </div>
          </div>

          <div className="milestone-status">
            <span className="status-locked">
               <FontAwesomeIcon icon={faLock} style={{fontSize: '10px'}} /> {item.status}
            </span>
          </div>
        </div>

        <div className="milestone-progress-container">
          <div className="progress-labels">
            <span className="progress-current">{item.current} / {item.target} Active</span>
            <span className="progress-needed">{item.target - item.current} needed</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${(item.current / item.target) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    ))}
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