import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faChartLine,faBell } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import InvestModal from './InvestModal';
import ErrorModal from './ErrorModal';
import './css/dashboard.css';
import './css/style.css';
import './css/plans.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loadingInvest, setLoadingInvest] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdowns, setCountdowns] = useState({});

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

  useEffect(() => {
    fetchPlans();
    fetchBalance();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    // Function to calculate and update all countdowns
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

    // Calculate immediately on mount/plans change
    updateCountdowns();

    // Then update every second
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [plans]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      
      const data = await response.json();
      setPlans(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

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
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(0);
    }
  };

  const handleInvestClick = async (plan) => {
    // Check if purchase limit is reached
    if (plan.purchase_limit > 0 && (plan.user_purchase_count || 0) >= plan.purchase_limit) {
      setErrorMessage(`You have reached the maximum purchase limit for "${plan.name}" plan.`);
      setErrorModalOpen(true);
      return;
    }

    setLoadingInvest(true);
    setSelectedPlan(plan);
    
    try {
      // First validate the investment with the backend
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

      // If validation successful, set the plan data from API response
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
    // Refresh balance after successful investment
    await fetchBalance();
    // Refresh plans after successful investment to update purchase counts
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

      // Investment successful - refresh data silently
      await handleInvestmentConfirmed();
    } catch (err) {
      console.error('Error confirming investment:', err);
      setErrorMessage('Error processing investment. Please try again.');
      setErrorModalOpen(true);
    }
  };

  const handleNotificationClick = () => {
    navigate('/profile', { state: { activeTab: 'notification' } });
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Error Modal */}
        <ErrorModal
          isOpen={errorModalOpen}
          message={errorMessage}
          onClose={() => setErrorModalOpen(false)}
          autoClose={true}
          closeDuration={3000}
        />

        {/* Top Header Section */}
        <div className="deposit-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Investment Plans</div>
          {/* <button
            type="button"
            className="helpcenter-button"
            aria-label="Notifications"
            onClick={handleNotificationClick}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <FontAwesomeIcon style={{fontSize:'20px'}} icon={faBell} />
          </button> */}
        </div>
        
        <div className="plan-image">
          <img 
            src="/planimage.webp" 
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
        

        <div className="plan-content">
          {loading ? (
            <p>Loading plans...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : plans.length === 0 ? (
            <p>No active plans available</p>
          ) : (
            plans.map((plan, index) => (
              <div className="plan-card-new" key={plan._id || index}>
                {/* Limited Badge - Show Countdown if Available */}
                {plan.countdown_end_time && countdowns[plan._id] && (
                  <div className="limited-badge">
                    ⏱️ {countdowns[plan._id]}
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
                             Limit {(plan.user_purchase_count || 0)}/{plan.purchase_limit}
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
                        <span className="detail-value-new">$ {plan.investment_amount}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label-new">Daily income:</span>
                        <span className="detail-value-new">$ {plan.daily_profit}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label-new">Total income:</span>
                        <span className="detail-value-new">$ {plan.total_profit}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label-new">Duration</span>
                        <span className="detail-value-new">{plan.duration_days || plan.duration} Days</span>
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
          )}
        </div>

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

export default Plans;