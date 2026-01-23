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

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchPlans();
    fetchBalance();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      const response = await fetch('/api/wallet/balance', {
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

  const handleInvestClick = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="plan-header">
          <div className="plan-avatar"><FontAwesomeIcon icon={faBox} /></div>
          <div className="plan-user-info">
            <h4 className="plan-username">Investment Plans</h4>
            <p className="plan-email">سرمایہ کاری کے منصوبے</p>
          </div>
          <div className="plan-balance">Balance: <span>Rs {balance}</span></div>
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
                  <h3 className="plan-title">{plan.title}</h3>
                  <span className="percentage-badge">{plan.percentage}</span>
                </div>
                
                <div className="plan-duration">
                  <FontAwesomeIcon icon={faClock} className="clock-icon" /> {plan.duration}
                </div>

                <div className="plan-details-grid">
                  <div className="detail-row">
                    <span className="detail-label">Investment</span>
                    <span className="detail-value text-bold">Rs {plan.investment}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Daily Income</span>
                    <span className="detail-value text-purple">Rs {plan.dailyIncome}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Return</span>
                    <span className="detail-value text-green">Rs {plan.totalReturn}</span>
                  </div>
                </div>

                <button 
                  className="invest-now-btn"
                  onClick={() => handleInvestClick(plan)}
                >
                  <FontAwesomeIcon icon={faChartLine} /> Invest Now
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
      />
    </div>
  );
};

export default Plans;