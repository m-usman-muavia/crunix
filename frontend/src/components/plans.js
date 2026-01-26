import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, faBox, faArrowDown, faArrowUp, 
  faUsers, faUser, faClock, faChartLine 
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import InvestModal from './InvestModal';
import './css/dashboard.css';
import './css/style.css';
import './css/plans.css';
import API_BASE_URL from '../config/api';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loadingInvest, setLoadingInvest] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchBalance();
  }, []);

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
      setBalance(data.main_balance || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(0);
    }
  };

  const handleInvestClick = async (plan) => {
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
        alert(`Error: ${data.message}`);
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
      alert('Error validating investment. Please try again.');
    } finally {
      setLoadingInvest(false);
    }
  };

  const handleInvestmentConfirmed = async () => {
    // Refresh balance after successful investment
    await fetchBalance();
    // Refresh plans after successful investment
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
        alert(`Error: ${data.message}`);
        return;
      }

      alert('Investment successful!');
      await handleInvestmentConfirmed();
    } catch (err) {
      console.error('Error confirming investment:', err);
      alert('Error processing investment. Please try again.');
    }
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="plan-header">
          <div className="plan-avatar"><FontAwesomeIcon icon={faBox} /></div>
          <div className="plan-user-info">
            <h4 className="plan-username">Plans</h4>
            <p className="plan-email">سرمایہ کاری کے منصوبے</p>
          </div>
          <div className="plan-balance">Balance: <span>Rs {balance.toFixed(2)}</span></div>
        </header>

        <div className="plan-content">
          {loading ? (
            <p>Loading plans...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : plans.length === 0 ? (
            <p>No active plans available</p>
          ) : (
            plans.map((plan, index) => (
              <div className="plan-card" key={plan._id || index}>
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

                <button 
                  className="invest-now-btn"
                  onClick={() => handleInvestClick(plan)}
                  disabled={loadingInvest}
                >
                  <FontAwesomeIcon icon={faChartLine} /> {loadingInvest ? 'Loading...' : 'Invest Now'}
                </button>
              </div>
            ))
          )}
        </div>

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