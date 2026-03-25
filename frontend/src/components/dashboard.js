import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faChartLine, faClipboardList, faUser, faBell } from '@fortawesome/free-solid-svg-icons';
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
  const [countdowns, setCountdowns] = useState({});
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [sliderImages, setSliderImages] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [imageErrorMap, setImageErrorMap] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchBalance();
    fetchPlans();
    fetchAccount();
    fetchReferralCode();
    fetchUser();
    fetchReferralStats();
    fetchTotalWithdrawn();
    fetchDashboardImages();
    fetchRecentTransactions();
  }, []);

  useEffect(() => {
    if (sliderImages.length <= 1) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % sliderImages.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [sliderImages]);

  // Countdown timer effect
  useEffect(() => {
    const updateCountdowns = () => {
      const updatedCountdowns = {};
      plans.forEach(plan => {
        if (plan.countdown_end_time) {
          try {
            const endTime = new Date(plan.countdown_end_time).getTime();
            const now = Date.now();
            const timeLeft = endTime - now;

            if (timeLeft > 0) {
              const hours = Math.floor(timeLeft / (1000 * 60 * 60));
              const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
              updatedCountdowns[plan._id] = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
              updatedCountdowns[plan._id] = 'EXPIRED';
            }
          } catch (error) {
            console.error(`Error calculating countdown for ${plan.name}:`, error);
          }
        }
      });
      setCountdowns(updatedCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [plans]);

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
      const response = await fetch(`${API_BASE_URL}/api/withdrawals/my-withdrawals`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const withdrawals = Array.isArray(data) ? data : (data.data || []);
        
        // Calculate total for approved withdrawals only
        const total = withdrawals
          .filter(w => w.status === 'approved' || w.status === 'accept')
          .reduce((sum, w) => sum + (Number(w.withdrawal_amount || w.amount || 0)), 0);
        
        setTotalWithdrawn(total);
      }
    } catch (err) {
      console.error('Error fetching total withdrawn:', err);
      setTotalWithdrawn(0);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const getSafeTimestamp = (value) => {
        if (!value) {
          return Number.NaN;
        }

        const time = new Date(value).getTime();
        return Number.isFinite(time) && time > 0 ? time : Number.NaN;
      };

      const authToken = localStorage.getItem('authToken');
      const [depositsRes, withdrawalsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/deposits/my-deposits`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        fetch(`${API_BASE_URL}/api/withdrawals/my-withdrawals`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      ]);

      let merged = [];
      let latestDeposit = null;
      let latestWithdrawal = null;

      if (depositsRes.ok) {
        const depositsData = await depositsRes.json();
        const deposits = Array.isArray(depositsData) ? depositsData : (depositsData.data || []);
        const mappedDeposits = deposits.map((d) => ({
          _id: d._id,
          type: 'Deposit',
          amount: Number(d.deposit_amount ?? d.amount ?? 0),
          date: d.created_at || d.createdAt || d.updated_at || d.updatedAt || d.date || ''
        }));

        mappedDeposits.sort((a, b) => {
          const aTime = getSafeTimestamp(a.date);
          const bTime = getSafeTimestamp(b.date);
          return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
        });

        latestDeposit = mappedDeposits[0] || null;
        merged = merged.concat(mappedDeposits);
      }

      if (withdrawalsRes.ok) {
        const withdrawalsData = await withdrawalsRes.json();
        const withdrawals = Array.isArray(withdrawalsData) ? withdrawalsData : (withdrawalsData.data || []);
        const mappedWithdrawals = withdrawals.map((w) => ({
          _id: w._id,
          type: 'Withdrawal',
          amount: Number(w.withdrawal_amount ?? w.amount ?? 0),
          date: w.created_at || w.createdAt || w.updated_at || w.updatedAt || w.date || ''
        }));

        mappedWithdrawals.sort((a, b) => {
          const aTime = getSafeTimestamp(a.date);
          const bTime = getSafeTimestamp(b.date);
          return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
        });

        latestWithdrawal = mappedWithdrawals[0] || null;
        merged = merged.concat(mappedWithdrawals);
      }

      merged.sort((a, b) => {
        const aTime = getSafeTimestamp(a.date);
        const bTime = getSafeTimestamp(b.date);
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
      });

      const picked = [];
      const usedIds = new Set();

      [latestDeposit, latestWithdrawal].forEach((item) => {
        if (item && !usedIds.has(item._id)) {
          picked.push(item);
          usedIds.add(item._id);
        }
      });

      for (const item of merged) {
        if (picked.length >= 3) {
          break;
        }

        if (!usedIds.has(item._id)) {
          picked.push(item);
          usedIds.add(item._id);
        }
      }

      picked.sort((a, b) => {
        const aTime = getSafeTimestamp(a.date);
        const bTime = getSafeTimestamp(b.date);
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
      });

      setRecentTransactions(picked.slice(0, 3));
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
      setRecentTransactions([]);
    }
  };

  const fetchDashboardImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/dashboard-image`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        setSliderImages([]);
        return;
      }

      const data = await response.json();
      const images = data?.data?.images || [];
      setSliderImages(images);
      setActiveSlideIndex(0);
      setImageErrorMap({});
    } catch (err) {
      console.error('Error fetching dashboard images:', err);
      setSliderImages([]);
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
        text: `Bonus of $${data.bonusAmount} added successfully!`
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

  const displayName = (user?.name || user?.username || user?.email || 'U').trim();
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'U';
  const avatarImage = user?.profileImage || user?.profile_image || user?.avatar || user?.image || '';
  const currentMonthly = plans.reduce((sum, plan) => sum + (Number(plan.daily_profit || 0) * 30), 0);
  const currentSlide = sliderImages[activeSlideIndex] || null;
  const currentSlideSrc = resolveImageUrl(currentSlide?.image_path || '');
  const isCurrentSlideBroken = !!imageErrorMap[activeSlideIndex];
  const transactionItems = recentTransactions.slice(0, 3);

  const formatTxTime = (value) => {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);
    const timestamp = date.getTime();
    if (Number.isNaN(timestamp) || timestamp <= 0) {
      return 'N/A';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTransactionIcon = (txType) => {
    return String(txType).toLowerCase() === 'withdrawal' ? faArrowUp : faArrowDown;
  };

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">
        <div className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Welcome back,</p>
              <h1 className="dashboard-modern-title">{displayName}</h1>
            </div>
            <div className="dashboard-header-actions">
              <Link to="/notifications" className="dashboard-header-icon" aria-label="Notifications">
                <FontAwesomeIcon icon={faBell} />
              </Link>
              <Link to="/profile" className="dashboard-modern-avatar" aria-label="User profile">
                {avatarImage && !avatarImageError ? (
                  <img
                    src={avatarImage}
                    alt={displayName}
                    onError={() => setAvatarImageError(true)}
                  />
                ) : (
                  <span>
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="dashboard-balance-card">
            <div>
              <p className="dashboard-balance-label">Current Balance</p>
              <h3 className="dashboard-balance-value">AED {Number(balance || 0).toFixed(2)}</h3>
            </div>
            <Link to="/active-plans" className="dashboard-modern-edit-link">SEE ALL</Link>
          </div>
        </div>

        {/* <section className="dashboard-showcase">
          <div className="dashboard-section-head">
            <h3>Special Offers</h3>
            <Link to="/active-plans" className="dashboard-modern-edit-link2">See all</Link>
          </div>
          <div className="dashboard-special-row">
            <Link to="/active-plans" className="dashboard-special-card dashboard-special-card-image">
              <div className="dashboard-special-overlay">
                {currentSlide && currentSlideSrc && !isCurrentSlideBroken ? (
                  <img
                    src={currentSlideSrc}
                    alt={`Dashboard slide ${activeSlideIndex + 1}`}
                    className="dashboard-special-image"
                    onError={() => setImageErrorMap((prev) => ({ ...prev, [activeSlideIndex]: true }))}
                  />
                ) : (
                  <div className="dashboard-special-image-fallback" />
                )}
              </div>
            </Link>
          </div>
          {sliderImages.length > 1 && (
            <div className="dashboard-slider-dots" aria-hidden="true">
              {sliderImages.map((img, idx) => (
                <span key={img._id || idx} className={`dashboard-dot ${idx === activeSlideIndex ? 'dashboard-dot-active' : ''}`} />
              ))}
            </div>
          )}
        </section> */}

        <section className="dashboard-showcase dashboard-quick-section">
          <div className="dashboard-categories-row">
            <Link to="/plans" className="dashboard-category-item">
              <span className="dashboard-category-icon"><FontAwesomeIcon icon={faChartLine} /></span>
              <span>Plans</span>
            </Link>
            <Link to="/bonus" className="dashboard-category-item">
              <span className="dashboard-category-icon"><FontAwesomeIcon icon={faChartLine} /></span>
              <span>Bonus</span>
            </Link>
            <Link to="/deposit" className="dashboard-category-item">
              <span className="dashboard-category-icon"><FontAwesomeIcon icon={faArrowDown} /></span>
              <span>Refferals</span>
            </Link>
            <Link to="/withdrawal" className="dashboard-category-item">
              <span className="dashboard-category-icon"><FontAwesomeIcon icon={faArrowUp} /></span>
              <span>Withdrawal</span>
            </Link>
          </div>
        </section>

        <section className="dashboard-showcase">
          <div className="dashboard-section-head dashboard-transaction-header">
            <div>
              <h3>Transation History</h3>
              <p className="dashboard-section-sub">See All Transations</p>
            </div>
            <Link to="/transactions" className="dashboard-modern-edit-link2">View</Link>
          </div>
          <div className="dashboard-transactions-list">
            {transactionItems.length > 0 ? (
              transactionItems.map((tx) => (
                <div key={tx._id} className="dashboard-transaction-card">
                  <div className="dashboard-transaction-left">
                    <div className="dashboard-transaction-icon">
                      <FontAwesomeIcon icon={getTransactionIcon(tx.type)} />
                    </div>
                    <div>
                      <h4>{tx.type}</h4>
                      <p>{formatTxTime(tx.date)}</p>
                    </div>
                  </div>
                  <div className="dashboard-transaction-right">
                    <h4>AED {Number(tx.amount || 0).toFixed(2)}</h4>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-transaction-card">
                <div className="dashboard-transaction-left">
                  <div>
                    <h4>No transactions yet</h4>
                    <p>Your latest deposit/withdrawal records will appear here.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

       
        {/* Error Modal */}
        <ErrorModal
          isOpen={errorModalOpen}
          message={errorMessage}
          onClose={() => setErrorModalOpen(false)}
          autoClose={true}
          closeDuration={3000}
        />


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