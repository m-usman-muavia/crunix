import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faChartLine, faArrowDown, faArrowUp, faClipboardList, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import InvestModal from './InvestModal';
import ErrorModal from './ErrorModal';
import './css/dashboard.css';
import './css/style.css';
import './css/plans.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [balance, setBalance] = useState(0);
  const [activePlanCount, setActivePlanCount] = useState(0);
  const [completedPlanCount, setCompletedPlanCount] = useState(0);
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
    fetchUserPlanSummary();
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

  const fetchUserPlanSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans/user/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plan summary');
      }

      const data = await response.json();
      const userPlans = Array.isArray(data) ? data : data.data || [];
      const activeCount = userPlans.filter((plan) => plan.status === 'active' || plan.status === 'paused').length;
      const completedCount = userPlans.filter((plan) => plan.status === 'completed').length;
      setActivePlanCount(activeCount);
      setCompletedPlanCount(completedCount);
    } catch (err) {
      console.error('Error fetching plan summary:', err);
      setActivePlanCount(0);
      setCompletedPlanCount(0);
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
      setBalance(main + referral + bonus);
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
    await fetchBalance();
    // Refresh user plan counts after successful investment
    await fetchUserPlanSummary();
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

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">
        {/* Error Modal */}
        <ErrorModal
          isOpen={errorModalOpen}
          message={errorMessage}
          onClose={() => setErrorModalOpen(false)}
          autoClose={true}
          closeDuration={3000}
        />

        <div className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Explore</p>
              <h1 className="dashboard-modern-title">Investment Plans</h1>
            </div>
            <div className="dashboard-header-actions">
              <Link to="/add-to-cart" className="dashboard-header-icon" aria-label="Add to cart">
                <FontAwesomeIcon icon={faCartShopping} />
              </Link>
            </div>
          </div>

          <div className="plans-status-overview">
            <div className="plans-status-card">
              <p className="plans-status-label">Active Plans</p>
              <h3 className="plans-status-value">{activePlanCount}</h3>
              <Link to="/active-plans" className="dashboard-modern-edit-link">VIEW ACTIVE</Link>
            </div>
            <div className="plans-status-card">
              <p className="plans-status-label">Complete Plans</p>
              <h3 className="plans-status-value">{completedPlanCount}</h3>
              <Link to="/complete-plans" className="dashboard-modern-edit-link">VIEW COMPLETE</Link>
            </div>
          </div>
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