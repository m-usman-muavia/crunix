import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faArrowDown, faArrowUp, faClipboardList, faCartShopping, faChevronLeft, faChevronRight, faCirclePlus, faMinus } from '@fortawesome/free-solid-svg-icons';
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
  const [sectionSlideIndex, setSectionSlideIndex] = useState({});
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailPlan, setDetailPlan] = useState(null);

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
    const current = JSON.parse(localStorage.getItem('planCart') || '[]');
    const total = current.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    setCartCount(total);
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

  const getSectionLabel = (plan) => {
    const categoryValue = (plan?.category || plan?.plan_category || plan?.type || '').toString().trim();
    if (categoryValue) {
      const normalized = categoryValue.toLowerCase();
      if (normalized.includes('premium') || normalized.includes('preimum')) return 'Premium Plans';
      if (normalized.includes('special') || normalized.includes('specical')) return 'Special Plans';
      if (normalized.includes('elite')) return 'Elite Plans';
      if (normalized.includes('starter')) return 'Starter Plans';
      if (normalized.includes('business')) return 'Business Plans';
      const title = normalized.charAt(0).toUpperCase() + normalized.slice(1);
      return title.includes('plans') ? title : `${title} Plans`;
    }

    const name = (plan?.name || '').toLowerCase();
    if (name.includes('elite')) return 'Elite Plans';
    if (name.includes('premium')) return 'Premium Plans';
    return 'Premium Plans';
  };

  const planSections = useMemo(() => {
    const grouped = plans.reduce((acc, plan) => {
      const label = getSectionLabel(plan);
      if (!acc[label]) {
        acc[label] = [];
      }
      acc[label].push(plan);
      return acc;
    }, {});

    const preferredOrder = [
      'Premium Plans',
      'Special Plans',
      'Elite Plans',
      'Starter Plans',
      'Business Plans'
    ];

    const ordered = preferredOrder
      .filter((label) => Array.isArray(grouped[label]) && grouped[label].length > 0)
      .map((label) => ({
        key: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        plans: grouped[label]
      }));

    const extras = Object.keys(grouped)
      .filter((label) => !preferredOrder.includes(label) && grouped[label]?.length > 0)
      .map((label) => ({
        key: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        plans: grouped[label]
      }));

    return [...ordered, ...extras];
  }, [plans]);

  useEffect(() => {
    if (planSections.length === 0) {
      setSectionSlideIndex({});
      return;
    }

    setSectionSlideIndex((prev) => {
      const next = {};
      planSections.forEach((section) => {
        const current = prev[section.key] || 0;
        next[section.key] = Math.min(current, Math.max(section.plans.length - 1, 0));
      });
      return next;
    });
  }, [planSections]);

  useEffect(() => {
    if (planSections.length === 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setSectionSlideIndex((prev) => {
        const next = { ...prev };
        planSections.forEach((section) => {
          if (section.plans.length <= 1) {
            next[section.key] = 0;
            return;
          }
          const current = prev[section.key] || 0;
          next[section.key] = (current + 1) % section.plans.length;
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [planSections]);

  const goToSectionSlide = (sectionKey, nextIndex) => {
    setSectionSlideIndex((prev) => ({
      ...prev,
      [sectionKey]: nextIndex
    }));
  };

  const handleSlidePrev = (section) => {
    if (section.plans.length <= 1) return;
    const current = sectionSlideIndex[section.key] || 0;
    const next = (current - 1 + section.plans.length) % section.plans.length;
    goToSectionSlide(section.key, next);
  };

  const handleSlideNext = (section) => {
    if (section.plans.length <= 1) return;
    const current = sectionSlideIndex[section.key] || 0;
    const next = (current + 1) % section.plans.length;
    goToSectionSlide(section.key, next);
  };

  const getPlanQuantity = (planId) => {
    return selectedQuantities[planId] || 1;
  };

  const handleDecreaseQuantity = (planId) => {
    setSelectedQuantities((prev) => {
      const current = prev[planId] || 1;
      return {
        ...prev,
        [planId]: Math.max(1, current - 1)
      };
    });
  };

  const handleIncreaseQuantity = (plan) => {
    const planId = plan._id;
    setSelectedQuantities((prev) => {
      const current = prev[planId] || 1;
      const limit = Number(plan.purchase_limit || 0);
      const nextValue = limit > 0 ? Math.min(limit, current + 1) : current + 1;
      return {
        ...prev,
        [planId]: nextValue
      };
    });
  };

  const handleAddToCart = (plan) => {
    const qty = getPlanQuantity(plan._id);
    const cartKey = 'planCart';
    const existing = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const index = existing.findIndex((item) => item.planId === plan._id);

    if (index >= 0) {
      existing[index].quantity += qty;
    } else {
      existing.push({
        planId: plan._id,
        name: plan.name,
        price: Number(plan.investment_amount || 0),
        image_path: resolveImageUrl(plan.image_path || ''),
        duration_days: plan.duration_days || plan.duration || 0,
        quantity: qty,
        purchase_limit: Number(plan.purchase_limit || 0)
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(existing));
    const total = existing.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    setCartCount(total);
    setErrorMessage(`${plan.name} added to cart`);
    setErrorModalOpen(true);
  };

  const handleOpenDetails = (plan) => {
    setDetailPlan(plan);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailModalOpen(false);
    setDetailPlan(null);
  };

  const handleAddToCartFromDetails = () => {
    if (!detailPlan) return;
    handleAddToCart(detailPlan);
    handleCloseDetails();
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
                {cartCount > 0 && <span className="plans-cart-badge">{cartCount}</span>}
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

        <div className="plan-content plan-slider-content">
          {loading ? (
            <p>Loading plans...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : plans.length === 0 ? (
            <p>No active plans available</p>
          ) : (
            planSections.map((section, sectionIdx) => {
              const currentIndex = sectionSlideIndex[section.key] || 0;
              return (
                <div key={section.key} className="plans-slider-section-wrap">
                  <section className="plans-slider-section">
                    <div className="plans-slider-head">
                      <div style={{padding:'0px 10px'}} >
                        <h3 className="plans-slider-title">{section.label}</h3>
                        <p className="plans-slider-sub">Swipe To See More Plans</p>
                      </div>
                      <div className="plans-slider-controls">
                        <button
                          type="button"
                          className="plans-arrow-btn"
                          aria-label={`Previous ${section.label}`}
                          onClick={() => handleSlidePrev(section)}
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button
                          type="button"
                          className="plans-arrow-btn"
                          aria-label={`Next ${section.label}`}
                          onClick={() => handleSlideNext(section)}
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </div>
                    </div>

                    <div className="plans-slider-viewport">
                      <div className="plans-slider-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {section.plans.map((plan, index) => (
                          <article className="plan-card-slide" key={plan._id || `${section.key}-${index}`}>
                            <div className="plan-slide-image-wrap">
                              {plan.image_path ? (
                                <img
                                  src={resolveImageUrl(plan.image_path)}
                                  alt={plan.name}
                                  className="plan-slide-image"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="no-image plan-slide-image">No Image</div>
                              )}

                              {countdowns[plan._id] && (
                                <div className="plan-slide-countdown-badge">⏱ {countdowns[plan._id]}</div>
                              )}
                            </div>

                            <div className="plan-slide-content">
                              <h4 className="plan-slide-title">{plan.name}</h4>
                              <p className="plan-slide-desc">
                                {plan.description || 'Start this plan and earn stable daily income with full cycle return.'}
                              </p>

                              <div className="plan-slide-footer">
                                <p className="plan-slide-price">AED {Number(plan.investment_amount || 0).toFixed(2)}</p>
                                <div className="plan-slide-buy" aria-label="Quantity controls">
                                  <button
                                    type="button"
                                    className="plan-slide-buy-btn"
                                    onClick={() => handleDecreaseQuantity(plan._id)}
                                    aria-label={`Decrease ${plan.name} quantity`}
                                  >
                                    <FontAwesomeIcon icon={faMinus} />
                                  </button>
                                  <span className="plan-slide-buy-count">{String(getPlanQuantity(plan._id)).padStart(2, '0')}</span>
                                  <button
                                    type="button"
                                    className="plan-slide-buy-btn"
                                    onClick={() => handleIncreaseQuantity(plan)}
                                    aria-label={`Increase ${plan.name} quantity`}
                                    disabled={plan.purchase_limit > 0 && getPlanQuantity(plan._id) >= plan.purchase_limit}
                                  >
                                    <FontAwesomeIcon icon={faCirclePlus} />
                                  </button>
                                </div>
                              </div>

                              <div className="plan-slide-actions">
                                <button
                                  type="button"
                                  className="plan-slide-add-cart"
                                  onClick={() => handleAddToCart(plan)}
                                  disabled={plan.purchase_limit > 0 && (plan.user_purchase_count || 0) >= plan.purchase_limit}
                                >
                                  Add <FontAwesomeIcon icon={faCartShopping} />
        
                                </button>

                                <button
                                  type="button"
                                  className="plan-slide-invest"
                                  onClick={() => handleOpenDetails(plan)}
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>

                    <div className="plans-slider-dots" aria-hidden="true">
                      {section.plans.map((plan, dotIdx) => (
                        <button
                          key={plan._id || `${section.key}-dot-${dotIdx}`}
                          type="button"
                          className={`plans-slider-dot ${dotIdx === currentIndex ? 'plans-slider-dot-active' : ''}`}
                          onClick={() => goToSectionSlide(section.key, dotIdx)}
                          aria-label={`Go to ${section.label} plan ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  </section>

                  {sectionIdx < planSections.length - 1 && <div className="plans-slider-divider" />}
                </div>
              );
            })
          )}
        </div>

        {isDetailModalOpen && detailPlan && (
          <div className="plan-detail-modal-overlay" onClick={handleCloseDetails}>
            <div className="plan-detail-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="plan-detail-modal-header">
                <h3>Plan Details</h3>
                <button type="button" className="plan-detail-close" onClick={handleCloseDetails} aria-label="Close details">
                  X
                </button>
              </div>

              <div className="plan-detail-grid">
                <div className="plan-detail-row">
                  <span>Plan Name</span>
                  <strong>{detailPlan.name}</strong>
                </div>
                <div className="plan-detail-row">
                  <span>Investment Amount (Rs)</span>
                  <strong>AED {Number(detailPlan.investment_amount || 0).toFixed(2)}</strong>
                </div>
                <div className="plan-detail-row">
                  <span>Daily Profit (Rs)</span>
                  <strong> AED {Number(detailPlan.daily_profit || 0).toFixed(2)}</strong>
                </div>
                <div className="plan-detail-row">
                  <span>Duration (Days)</span>
                  <strong>{detailPlan.duration_days || detailPlan.duration || 0} Days</strong>
                </div>
                <div className="plan-detail-row">
                  <span>Purchase Limit</span>
                  <strong>
                    {Number(detailPlan.purchase_limit || 0) > 0
                      ? `${detailPlan.purchase_limit} times`
                      : 'Unlimited'}
                  </strong>
                </div>
                <div className="plan-detail-row">
                  <span>Quantity</span>
                  <strong>
                    <div className="plan-slide-buy plan-detail-buy" aria-label="Detail quantity controls">
                  <button
                    type="button"
                    className="plan-slide-buy-btn"
                    onClick={() => handleDecreaseQuantity(detailPlan._id)}
                    aria-label={`Decrease ${detailPlan.name} quantity`}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span className="plan-slide-buy-count">{String(getPlanQuantity(detailPlan._id)).padStart(2, '0')}</span>
                  <button
                    type="button"
                    className="plan-slide-buy-btn"
                    onClick={() => handleIncreaseQuantity(detailPlan)}
                    aria-label={`Increase ${detailPlan.name} quantity`}
                    disabled={detailPlan.purchase_limit > 0 && getPlanQuantity(detailPlan._id) >= detailPlan.purchase_limit}
                  >
                    <FontAwesomeIcon icon={faCirclePlus} />
                  </button>
                </div>
                  </strong>
                </div>
              </div>

              

              <div className="plan-detail-qty-wrap">
                <button type="button" className="plan-detail-btn plan-detail-btn-secondary" onClick={handleCloseDetails}>
                  Close
                </button>
                <button
                  type="button"
                  className="plan-detail-btn plan-detail-btn-primary"
                  onClick={handleAddToCartFromDetails}
                  disabled={detailPlan.purchase_limit > 0 && (detailPlan.user_purchase_count || 0) >= detailPlan.purchase_limit}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
        )}


       

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