import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './css/dashboard.css';
import './css/plans.css';
import './css/style.css';
import './css/profile.css';
import './css/hybrid-cards.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const CompletePlans = () => {
  const [completedPlans, setCompletedPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState('');
  const [expandedPlan, setExpandedPlan] = useState(null);

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

  const totalEarnings = completedPlans.reduce((sum, plan) => {
    return sum + (Number(plan.currentEarnings || plan.totalEarned || 0));
  }, 0);

  const totalInvested = completedPlans.reduce((sum, plan) => {
    return sum + (Number(plan.investmentAmount || 0));
  }, 0);

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Modern Hero Header - Consistent with Active Plans */}
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

          {/* Summary Stats */}
          <div className="plans-status-overview">
            <div className="plans-status-card">
              <p className="plans-status-label">Total Completed</p>
              <h3 className="plans-status-value">{completedPlans.length}</h3>
            </div>
            <div className="plans-status-card">
              <p className="plans-status-label">Total Earned</p>
              <h3 className="plans-status-value">AED{formatAmount(totalEarnings)}</h3>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {plansError && <div className="error-message" style={{ margin: '20px' }}>{plansError}</div>}

        {loadingPlans ? (
          <div className="loading-spinner">
            <p>Loading completed plans...</p>
          </div>
        ) : completedPlans.length === 0 ? (
          <div className="empty-state-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p className="empty-state-text">No completed plans yet.</p>
            <Link to="/plans" className="dashboard-modern-edit-link" style={{ marginTop: '16px', display: 'inline-block' }}>
              Start Investing
            </Link>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            {completedPlans.map((plan) => {
              const imagePath = plan.image_path || plan.plan?.image_path;
              const earned = Number(plan.currentEarnings || plan.totalEarned || 0);
              const invested = Number(plan.investmentAmount || 0);
              const profitPercent = invested > 0 ? ((earned - invested) / invested) * 100 : 0;
              const isExpanded = expandedPlan === plan._id;

              return (
                <div className="complete-plans-hybrid-card" key={plan._id} style={{ marginBottom: '16px' }}>
                  {/* Card Header - Always Visible */}
                  <div 
                    className="hybrid-card-header"
                    onClick={() => setExpandedPlan(isExpanded ? null : plan._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="hybrid-card-main">
                      <div className="hybrid-card-image">
                        {imagePath ? (
                          <img
                            src={resolveImageUrl(imagePath)}
                            alt={plan.planName || 'Plan'}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="hybrid-card-image-fallback">✅</div>
                        )}
                      </div>

                      <div className="hybrid-card-info">
                        <h3 className="hybrid-card-title">{plan.planName || plan.plan?.name || 'Investment Plan'}</h3>
                        <p className="hybrid-card-meta">Completed on {formatDate(plan.endDate || plan.updatedAt || plan.createdAt)}</p>
                        
                        {/* Achievement Badge */}
                        <div style={{ marginTop: '10px' }}>
                          <span className="achievement-badge">
                            <FontAwesomeIcon icon={faTrophy} /> Mission Accomplished
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hybrid-card-amount">
                      <p style={{ fontSize: '12px', color: '#999' }}>Total Earned</p>
                      <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                        ${formatAmount(earned)}
                      </h4>
                      <FontAwesomeIcon 
                        icon={faChevronDown} 
                        style={{
                          marginTop: '10px',
                          transition: 'transform 0.3s ease',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          color: '#10b981'
                        }}
                      />
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  {isExpanded && (
                    <div className="hybrid-card-details">
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Initial Investment</span>
                          <span className="detail-value">${formatAmount(invested)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Total Earnings</span>
                          <span className="detail-value">${formatAmount(earned)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Net Profit</span>
                          <span className="detail-value" style={{ color: '#10b981' }}>${formatAmount(Math.max(0, earned - invested))}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Return Rate</span>
                          <span className="detail-value" style={{ color: '#10b981' }}>{profitPercent.toFixed(1)}%</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Start Date</span>
                          <span className="detail-value">{formatDate(plan.investmentDate || plan.createdAt)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">End Date</span>
                          <span className="detail-value">{formatDate(plan.endDate || plan.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
};

export default CompletePlans;
