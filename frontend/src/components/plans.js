import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faChartLine } from '@fortawesome/free-solid-svg-icons';
import InvestModal from './InvestModal';
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
        <div className="deposit-header">Investment Plans</div>
        
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
                          src={`/${plan.image_path}`} 
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
                        <span className="detail-value-new">Rs {plan.investment_amount}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label-new">Daily income:</span>
                        <span className="detail-value-new">Rs {plan.daily_profit}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label-new">Total income:</span>
                        <span className="detail-value-new">Rs {plan.total_profit}</span>
                      </div>
                    </div>

                    <button 
                  className="buy-now-btn"
                  onClick={() => handleInvestClick(plan)}
                  disabled={loadingInvest || (plan.purchase_limit > 0 && (plan.user_purchase_count || 0) >= plan.purchase_limit)}
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