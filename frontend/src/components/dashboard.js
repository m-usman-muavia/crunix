import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faChartLine, faCheck, faClock, faCopy, faHeadset, faHouse, faClipboardList, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faFacebook, faTelegram } from '@fortawesome/free-brands-svg-icons';
import './css/dashboard.css';
import './css/plans.css';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/profile.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';
import InvestModal from './InvestModal';
import ErrorModal from './ErrorModal';

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [plans, setPlans] = useState([]);
  const [account, setAccount] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [mainBalance, setMainBalance] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);
  const [bonusCode, setBonusCode] = useState('');
  const [redeemingBonus, setRedeemingBonus] = useState(false);
  const [bonusMessage, setBonusMessage] = useState('');
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingInvest, setLoadingInvest] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchBalance();
    fetchPlans();
    fetchAccount();
    fetchReferralCode();
    fetchUser();
    fetchReferralStats();
    fetchTotalWithdrawn();
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
      // Calculate total balance (main + referral + bonus)
      const main = data.main_balance || 0;
      const referral = data.referral_balance || 0;
      const bonus = data.bonus_balance || 0;
      const totalBalance = main + referral + bonus;
      setBalance(totalBalance);
      setMainBalance(main);
      setReferralEarnings(referral);
      setBonusBalance(bonus);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(0);
      setMainBalance(0);
      setReferralEarnings(0);
      setBonusBalance(0);
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

  const fetchTotalWithdrawn = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/withdrawal/total`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTotalWithdrawn(data.totalWithdrawn || 0);
      }
    } catch (err) {
      console.error('Error fetching total withdrawn:', err);
      setTotalWithdrawn(0);
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

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) {
      return '';
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }

    const normalized = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/${normalized}`;
  };

  const handleInvestClick = async (plan) => {
    if (plan.purchase_limit > 0 && (plan.user_purchase_count || 0) >= plan.purchase_limit) {
      setErrorMessage(`You have reached the maximum purchase limit for "${plan.name}" plan.`);
      setErrorModalOpen(true);
      return;
    }

    setLoadingInvest(true);
    setSelectedPlan(plan);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/investments/invest-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ planId: plan._id })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setErrorMessage(data.message);
        setErrorModalOpen(true);
        setLoadingInvest(false);
        return;
      }

      setSelectedPlan({
        ...plan,
        ...data.plan
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error validating investment:', err);
      setErrorMessage('Error validating investment. Please try again.');
      setErrorModalOpen(true);
    } finally {
      setLoadingInvest(false);
    }
  };

  const handleInvestmentConfirmed = async () => {
    await fetchBalance();
    await fetchPlans();
  };

  const handleConfirmInvestment = async (planId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/investments/invest-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ planId, confirm: true })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setErrorMessage(data.message);
        setErrorModalOpen(true);
        return;
      }

      await handleInvestmentConfirmed();
    } catch (err) {
      console.error('Error confirming investment:', err);
      setErrorMessage('Error processing investment. Please try again.');
      setErrorModalOpen(true);
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

  const handleRedeemBonusCode = async (e) => {
    e.preventDefault();
    setBonusMessage('');

    if (!bonusCode.trim()) {
      setBonusMessage({ type: 'error', text: 'Please enter a bonus code' });
      return;
    }

    setRedeemingBonus(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bonus/redeem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: bonusCode })
      });

      const data = await response.json();

      if (!response.ok) {
        setBonusMessage({ type: 'error', text: data.message || 'Failed to redeem bonus code' });
        return;
      }

      // Success - update bonus balance and show message
      setBonusBalance(data.newBonusBalance);
      setBalance(balance + data.bonusAmount);
      setBonusMessage({
        type: 'success',
        text: `Bonus of Rs ${data.bonusAmount} added successfully!`
      });
      setBonusCode('');

      // Refresh balance after 2 seconds
      setTimeout(() => {
        fetchBalance();
      }, 2000);
    } catch (err) {
      setBonusMessage({ type: 'error', text: 'Error redeeming bonus code. Please try again.' });
      console.error('Error redeeming bonus code:', err);
    } finally {
      setRedeemingBonus(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
            {/* Top Header Section */}
            <div className="deposit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',padding: '8px 20px' }}>
              <img 
            src="/homelogo3.svg" 
            alt="Investment Plans" 
            style={{ 
              width: 'auto', 
              height: '40px'
            }} 
          />
                      <div className="helpcenter">
                <a href="https://chat.whatsapp.com/BxU2NKIDvxvJVny2czRVAo?mode=gi_t" target="_blank" rel="noopener noreferrer" className="helpcenter-button" aria-label="WhatsApp">
                  <FontAwesomeIcon style={{fontSize:'24px'}} icon={faWhatsapp} />
                </a>
                <a href="https://www.facebook.com/share/1ATnDDf9HV/" target="_blank" rel="noopener noreferrer" className="helpcenter-button" aria-label="Facebook">
                  <FontAwesomeIcon style={{ fontSize: '24px' }} icon={faFacebook} />
                </a>
                <a href="https://chat.whatsapp.com/BxU2NKIDvxvJVny2czRVAo?mode=gi_t" target="_blank" rel="noopener noreferrer" className="helpcenter-button" aria-label="Customer care">
                  <FontAwesomeIcon style={{ fontSize: '24px' }} icon={faHeadset} />
                </a>
              </div>
            </div>
        
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
                 <header className="dashboard-header">

          <div className="dashboard-balance-card">
            <div className="dashboard-main-balance">
              <p className="dashboard-main-balance-label">Total  Assets</p>
              <h2 className="dashboard-main-balance-amount">$ {balance.toFixed(2)}</h2>
            </div>
            <div className="dashboard-main-balance">
              <p className="dashboard-main-balance-label">Total  Withdrawal</p>
              <h2 className="dashboard-main-balance-amount">$ {totalWithdrawn.toFixed(2)}</h2>
            </div>
          </div>
        </header> 

        <div className="dashboard-grid">
          <Link to="/dashboard" className="dashboard-grid-button">
            <FontAwesomeIcon className="dashboard-grid-icon" icon={faHouse} />
            <h2 className='dashboard-grid-text'>Home</h2>
          </Link>
          <Link to="/plans" className="dashboard-grid-button">
            <FontAwesomeIcon className="dashboard-grid-icon" icon={faChartLine} />
                        <h2 className='dashboard-grid-text'>Plans</h2>

          </Link>
          <Link to="/deposit" className="dashboard-grid-button">
            <FontAwesomeIcon className="dashboard-grid-icon" icon={faArrowDown} />
                        <h2 className='dashboard-grid-text'>Deposit</h2>

          </Link>
          <Link to="/profile" className="dashboard-grid-button">
            <FontAwesomeIcon className="dashboard-grid-icon" icon={faUser} />
                        <h2 className='dashboard-grid-text'>Profile</h2>

          </Link>
        </div>

        <div className="dashboard-refferal-section">
          <Link to="/transactions" className="dashboard-refferal-container">
            <span className="new-badge">New</span>
            <FontAwesomeIcon className="dashboard-refferal-icon" style={{ fontSize: '23px' }} icon={faClipboardList} />
            <div className="dashboard-refferal-content">
              <h2 className="dashboard-refferal-header">Active Plans</h2>
              <p className="dashboard-refferal-text">Check Plans</p>
            </div>
          </Link>
          <Link to="#" className="dashboard-refferal-container">
            <span className="soon-badge">Soon</span>

            <FontAwesomeIcon className="dashboard-refferal-icon" style={{ fontSize: '23px' }} icon={faUsers} />  
            <div className="dashboard-refferal-content">
              <h2 className="dashboard-refferal-header">Referrals</h2>
              <p className="dashboard-refferal-text">Earn Money</p>
            </div>
          </Link>
        </div>

        <div className="dashboard-plans-section">
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'left', margin: '0 0 15px 0', color: '#0f172a' }}>Investment Plan</h2>
            
            {plans.length > 0 ? (
              plans.map((plan, index) => (
                <div className="plan-card-new" key={plan._id || index}>
                  {/* Limited Badge */}
                  {plan.purchase_limit > 0 && (
                    <div className="limited-badge">
                      Limited {(plan.user_purchase_count || 0)}/{plan.purchase_limit}
                    </div>
                  )}
                  
                  {/* Top Section with Image and Details */}
                  <div className="plan-card-top">
                    {/* Product Image */}
                    <div className="plan-product-image">
                      {plan.image_path ? (
                        <>
                          <img 
                            src={resolveImageUrl(plan.image_path)} 
                            alt={plan.name}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          {/* Purchase count badge on image */}
                          {plan.purchase_limit > 0 && (
                            <div className="image-badge">
                              {plan.purchase_limit} Days
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="plan-product-info">
                      <h3 className="product-title">{plan.name}</h3>
                      
                      <div className="product-details">
                        <div className="detail-item">
                          <span className="detail-label-new">Price:</span>
                          <span className="detail-value-new">${plan.investment_amount}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label-new">Daily income:</span>
                          <span className="detail-value-new">${plan.daily_profit}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label-new">Total income:</span>
                          <span className="detail-value-new">${plan.total_profit}</span>
                        </div>
                      </div>

                      <button 
                        className="buy-now-btn"
                        onClick={() => handleInvestClick(plan)}
                        disabled={loadingInvest || (plan.purchase_limit > 0 && (plan.user_purchase_count || 0) >= plan.purchase_limit)}
                        style={{
                          opacity: (plan.purchase_limit > 0 && (plan.user_purchase_count || 0) >= plan.purchase_limit) ? 0.5 : 1,
                          cursor: (plan.purchase_limit > 0 && (plan.user_purchase_count || 0) >= plan.purchase_limit) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {loadingInvest ? 'Loading...' : 
                         (plan.purchase_limit > 0 && (plan.user_purchase_count || 0) >= plan.purchase_limit) ? 'LIMIT REACHED' : 
                         'BUY NOW'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b' }}>No plans available</p>
            )}
          </div>
        </div>

        {/* Error Modal */}
        <ErrorModal
          isOpen={errorModalOpen}
          message={errorMessage}
          onClose={() => setErrorModalOpen(false)}
          autoClose={true}
          closeDuration={3000}
        />


            


        {/* Top Header Section */}



        {/* All Sections One Item Start Here */}
        {/* <div className="section">
          <div className="withdrawal-card">
            <h2 style={{ margin: '0px' }}>Get A Free Bonus</h2>
            <form onSubmit={handleRedeemBonusCode} className="deposit-form">
              {bonusMessage && (
                <div style={{
                  padding: '0px 5px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  backgroundColor: bonusMessage.type === 'error' ? '#fee' : '#efe',
                  color: bonusMessage.type === 'error' ? '#c00' : '#060',
                  border: `1px solid ${bonusMessage.type === 'error' ? '#fcc' : '#0f0'}`
                }}>
                  {bonusMessage.text}
                </div>
              )}
              <div className="deposit-amount" style={{ marginTop: '10px' }}>
                <label className="deposit-label">Bonus Code *</label>
                <input
                  type="text"
                  value={bonusCode}
                  onChange={(e) => setBonusCode(e.target.value.toUpperCase())}
                  placeholder="Enter Bonus Code"
                  className="deposit-input"
                  disabled={redeemingBonus}
                  required
                />
                <button
                  type="submit"
                  disabled={redeemingBonus}
                  className="section-button"
                  style={{
                    background: redeemingBonus ? '#ccc' : "linear-gradient(135deg, #22d3ee, #16a34a)",
                    color: "white",
                    cursor: redeemingBonus ? 'not-allowed' : 'pointer'
                  }}
                >
                  {redeemingBonus ? 'Processing...' : 'Get Now'}
                </button>
              </div>
            </form>
          </div>

        </div> */}

        {/* <div className="section">
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
        </div> */}

        {/* <div className="section">
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

        </div> */}

        {/* <div className="section">
          <div className="dashboard-plans-header">
            <h2>Referral Now</h2>
            <Link to="/refferrals" className="section-button" style={{ background: "linear-gradient(135deg, #22d3ee, #16a34a)", color: "white" }}>View All</Link>
          </div>
          <div className="dashboard-payment-details-section">
            <div className="refferrals-card">
              <div className="refferrals-links">
                <h5 className="refferrals-header" style={{ fontSize: '18px' }}>Referral Code</h5>
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

        </div> */}


        {/* All Sections One Item End Here */}



        {/* Bottom Navigation */}
        <BottomNav />

      </div>

      <InvestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        balance={balance}
        onInvest={handleConfirmInvestment}
        onInvestmentConfirmed={handleInvestmentConfirmed}
      />
    </div>
  );
};

export default Dashboard;