import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faBox, faArrowDown, faArrowUp, faUsers, faUser, faCopy, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faFacebook } from '@fortawesome/free-brands-svg-icons';
import './css/dashboard.css';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/profile.css';
import API_BASE_URL from '../config/api';

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [plans, setPlans] = useState([]);
  const [account, setAccount] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);

  useEffect(() => {
    fetchBalance();
    fetchPlans();
    fetchAccount();
    fetchReferralCode();
    fetchUser();
    fetchReferralStats();
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

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data.slice(0, 1)); // Get only first plan
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const fetchAccount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAccount(data);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchReferralCode = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/referral/code`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReferralCode(data.referralCode || 'N/A');
      }
    } catch (err) {
      console.error('Error fetching referral code:', err);
      setReferralCode('N/A');
    }
  };

  const fetchUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const handleCopyAccountNumber = () => {
    if (account?.accountNumber) {
      navigator.clipboard.writeText(account.accountNumber).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  const handleCopyReferralCode = () => {
    if (referralCode && referralCode !== 'N/A') {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const shareLink = `${origin}/registration?code=${encodeURIComponent(referralCode)}`;
      navigator.clipboard.writeText(shareLink).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="dashboard-header">
          <div className="dashboard-content">
            <div className="dashboard-user-info">
              <h4 className="dashboard-greeting">HI</h4>
              <p className="dashboard-name">{user?.name || 'User'}</p>
            </div>
            <div className='' style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '10px'}}>
              <Link to="https://www.facebook.com/share/177yhDTdEt/" className=" dashboard-whatsapp">
                <FontAwesomeIcon icon={faFacebook} />
              </Link>
              <Link to="https://whatsapp.com/channel/0029VbByYGN23n3lGBS2n00I" className="link-bold dashboard-whatsapp">

                <FontAwesomeIcon icon={faWhatsapp} />
              </Link>
            </div>

          </div>
          <div className="dashboard-balance">
            <p className="dashboard-balance-label">Total Balance</p>
            <h2 className="dashboard-balance-amount">Rs {balance.toFixed(2)}</h2>
          </div>
          <div className="dashboard-buttons">
            <Link to="/plans" className="dashboard-shortcut-buttons">Plans</Link>
            <Link to="/deposit" className="dashboard-shortcut-buttons">Deposit</Link>
            <Link to="/withdrawal" className="dashboard-shortcut-buttons">Withdraw</Link>
            <Link to="/refferrals" className="dashboard-shortcut-buttons  ">Referrals  </Link>


          </div>



        </header>


        {/* All Sections One Item Start Here */}

        <div className="section">
          <div className="dashboard-plans-header">
            <h2>Investment Plans</h2>
            <Link to="/plans" className="section-button" style={{ background: "linear-gradient(135deg, #22d3ee, #16a34a)", color: "white" }}>View All</Link>
          </div>
          {plans.length > 0 ? (
            plans.map((plan) => (
              <div className="plan-card" key={plan._id}>
                <div className="plan-card-header">
                  <h3 className="plan-title">{plan.name}</h3>
                  <span className="percentage-badge">{plan.roi_percentage}%</span>
                </div>

                <div className="plan-duration">
                  <FontAwesomeIcon icon={faClock} className="clock-icon" /> {plan.duration_days} Days
                </div>

                <div className="plan-details-grid">
                  <div className="detail-row">
                    <span className="detail-label">Investment</span>
                    <span className="detail-value text-bold">Rs {plan.investment_amount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Daily Income</span>
                    <span className="detail-value text-purple">Rs {plan.daily_profit}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Return</span>
                    <span className="detail-value text-green">Rs {plan.total_profit}</span>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="plan-card">
              <p style={{ textAlign: 'center', padding: '20px' }}>No plans available</p>
            </div>
          )}
        </div>

        <div className="section">
          <div className="dashboard-plans-header">
            <h2>Deposit Now</h2>
            <Link to="/deposit" className="section-button" style={{ background: "linear-gradient(135deg, #22d3ee, #16a34a)", color: "white" }}>View All</Link>
          </div>
          <div className="dashboard-payment-details-section">
            <div className="payment-details">
              <h3 className="payment-details-title">Send Payment To:</h3>
              <Link to="/refferrals" className="link-bold nav-link-col">
                <FontAwesomeIcon icon={faUsers} />
              </Link>
            </div>
            {loading ? (
              <div className="payment-details-card">
                <p>Loading account details...</p>
              </div>
            ) : error ? (
              <div className="payment-details-card">
                <p>Error: {error}</p>
              </div>
            ) : account ? (
              <div className="payment-details-card">
                <div className="detail-item">
                  <span className="detail-label">Bank Name:</span>
                  <span className="detail-value">{account.bankName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Account Number:</span>
                  <span className="detail-value copy-value">
                    <button
                      className="copy-btn"
                      onClick={handleCopyAccountNumber}
                      title="Copy to clipboard"
                    >
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                      {copied ? ' Copied' : ' Copy'}
                    </button>
                    {account.accountNumber}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Account Name:</span>
                  <span className="detail-value">{account.accountName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Account Type:</span>
                  <span className="detail-value">{account.accountType}</span>
                </div>
              </div>
            ) : (
              <div className="payment-details-card">
                <p>No account details available</p>
              </div>
            )}
          </div>

        </div>

        <div className="section">
          <div className="dashboard-plans-header">
            <h2>Referral Now</h2>
            <Link to="/refferrals" className="section-button" style={{ background: "linear-gradient(135deg, #22d3ee, #16a34a)", color: "white" }}>View All</Link>
          </div>
          <div className="dashboard-payment-details-section">
            <div className="refferrals-card">
              <div className="refferrals-links">
                <h5 className="refferrals-header" style={{ fontSize: '18px' }}>Referral Code</h5>
                {/* <p className="refferrals-code">{referralCode || 'N/A'}</p> */}
                <button
                  className="refferrals-link-btn"
                  onClick={handleCopyReferralCode}
                  disabled={referralCode === 'N/A'}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                  {copied ? ' Copied!' : ' Copy'}
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
                  <h4>💸 Commission Rate</h4>
                  <p>10%</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        {/* All Sections One Item End Here */}



        {/* Bottom Navigation */}
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

export default Dashboard;