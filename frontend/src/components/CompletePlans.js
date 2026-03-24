import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import './css/dashboard.css';
import './css/plans.css';
import './css/style.css';
import './css/profile.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const CompletePlans = () => {
  const [completedPlans, setCompletedPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState('');

  useEffect(() => {
    fetchCompletedPlans();
  }, []);

  const fetchCompletedPlans = async () => {
    setLoadingPlans(true);
    setPlansError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/plans/user/active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch completed plans');
      }

      const data = await response.json();
      const userPlans = Array.isArray(data) ? data : data.data || [];
      setCompletedPlans(userPlans.filter((plan) => plan.status === 'completed'));
    } catch (err) {
      console.error('Error fetching completed plans:', err);
      setPlansError(err.message);
      setCompletedPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num.toFixed(2) : '0.00';
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

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">
        <div className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Plan performance</p>
              <h1 className="dashboard-modern-title">Complete Plans</h1>
            </div>
            <div className="dashboard-header-actions">
              <span className="dashboard-header-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faTrophy} />
              </span>
            </div>
          </div>

          <div className="plans-status-overview" style={{ gridTemplateColumns: '1fr' }}>
            <div className="plans-status-card" style={{ textAlign: 'center' }}>
              <p className="plans-status-label">Total Completed</p>
              <h3 className="plans-status-value">{completedPlans.length}</h3>
            </div>
          </div>
        </div>

        <div className="plan-content">
          {plansError && <div className="error-message">{plansError}</div>}

          {loadingPlans ? (
            <p>Loading completed plans...</p>
          ) : completedPlans.length === 0 ? (
            <p>No completed plans available</p>
          ) : (
            completedPlans.map((plan) => {
              const imagePath = plan.image_path || plan.plan?.image_path;
              return (
                <div className="plan-card-new" key={plan._id}>
                  <div className="plan-card-top">
                    <div className="plan-product-image">
                      {imagePath ? (
                        <img
                          src={resolveImageUrl(imagePath)}
                          alt={plan.planName || plan.plan?.name || 'Completed Plan'}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>

                    <div className="plan-product-info">
                      <h3 className="product-title">{plan.planName || plan.plan?.name || 'Completed Plan'}</h3>
                      <div className="product-details">
                        <div className="detail-item">
                          <span className="detail-label-new">Invested:</span>
                          <span className="detail-value-new">AED {formatAmount(plan.investmentAmount || 0)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label-new">Earned:</span>
                          <span className="detail-value-new">AED {formatAmount(plan.currentEarnings || plan.totalEarned || 0)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label-new">Completed:</span>
                          <span className="detail-value-new">{formatDate(plan.endDate || plan.updatedAt || plan.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default CompletePlans;
