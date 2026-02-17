import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faPause, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import './css/plans.css';
import './css/style.css';
import './css/profile.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const ActivePlans = () => {
    const [activePlans, setActivePlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [plansError, setPlansError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchActivePlans();
    }, []);

    const fetchActivePlans = async () => {
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
                throw new Error('Failed to fetch active plans');
            }

            const data = await response.json();
            setActivePlans(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            console.error('Error fetching active plans:', err);
            setPlansError(err.message);
            setActivePlans([]);
        } finally {
            setLoadingPlans(false);
        }
    };

    const handlePausePlan = async (planId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/plans/${planId}/pause`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to pause plan');
            }

            fetchActivePlans();
        } catch (err) {
            console.error('Error pausing plan:', err);
            setPlansError(err.message);
        }
    };

    const handleResumePlan = async (planId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/plans/${planId}/resume`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to resume plan');
            }

            fetchActivePlans();
        } catch (err) {
            console.error('Error resuming plan:', err);
            setPlansError(err.message);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return { color: '#16a34a', icon: faCheckCircle, label: 'Active' };
            case 'paused':
                return { color: '#f59e0b', icon: faPause, label: 'Paused' };
            case 'completed':
                return { color: '#6366f1', icon: faTrophy, label: 'Completed' };
            default:
                return { color: '#6b7280', icon: faCheckCircle, label: 'Active' };
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatAmount = (value) => {
        const num = Number(value);
        return Number.isFinite(num) ? num.toFixed(2) : '0.0';
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

    const canCollect = (plan) => {
        if (plan.status !== 'active') return false;
        
        // Check if there's a daily income available
        if (!plan.dailyProfit || plan.dailyProfit <= 0) return false;

        // Check last collection time
        const lastCollectTime = plan.lastCollectTime ? new Date(plan.lastCollectTime) : null;
        const now = new Date();

        if (!lastCollectTime) {
            // First time collecting - can collect anytime after investment
            return true;
        }

        // Check if 24 hours have passed since last collection
        const hoursPassed = (now - lastCollectTime) / (1000 * 60 * 60);
        return hoursPassed >= 24;
    };

    const getTimeUntilNextCollection = (plan) => {
        const lastCollectTime = plan.lastCollectTime ? new Date(plan.lastCollectTime) : null;
        
        if (!lastCollectTime) {
            return 'Ready to collect';
        }

        const now = new Date();
        const nextCollectTime = new Date(lastCollectTime.getTime() + 24 * 60 * 60 * 1000);
        
        if (now >= nextCollectTime) {
            return 'Ready to collect';
        }

        const hoursLeft = Math.ceil((nextCollectTime - now) / (1000 * 60 * 60));
        return `Available in ${hoursLeft}h`;
    };

    const filteredPlans = activePlans.filter(plan => {
        return plan.status === 'active' || plan.status === 'paused' || plan.status === 'completed';
    });

    const totalEarnings = filteredPlans.reduce((sum, plan) => {
        return sum + (Number(plan.currentEarnings || plan.totalEarned || 0));
    }, 0);

    return (
        <div className="main-wrapper">
            <div className="main-container">
                {/* Top Header Section */}
                <div className="deposit-header">Active Plans</div>
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

        <div className="withdrawal-balance-card">
          <div className="withdrawal-main-balance">
            <p className="withdrawal-main-balance-label">Total Earned <br /> <span style={{fontSize: '12px'}}>Total Earning from plans</span></p>
            <h2 className="withdrawal-main-balance-amount">${formatAmount(totalEarnings)}</h2>
          </div>
        </div>  
              
                {plansError && <div className="error-message" style={{ margin: '20px' }}>{plansError}</div>}

                {loadingPlans ? (
                    <div className="loading-spinner">
                        <p>Loading your plans...</p>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="empty-stte" style={{ padding: '5px 10px' }}>
                        <p className="empty-state-text">
                            You don't have any plans yet.
                        </p>
                    </div>
                ) : (
                    <div className="active-plans-grid" style={{ padding: '20px' }}>
                        {filteredPlans.map((plan) => {
                            const totalProfit = Number(plan.totalProfit || 0);
                            const earned = Number(plan.currentEarnings || 0);
                            const earnedPercent = totalProfit > 0 ? Math.min(100, (earned / totalProfit) * 100) : 0;
                            const remainingPercent = 100 - earnedPercent;
                            const imagePath = plan.image_path || plan.plan?.image_path;
                            const isReadyToCollect = canCollect(plan);
                            const timeUntilNext = getTimeUntilNextCollection(plan);

                            return (
                                <div className="active-plan-card-new" key={plan._id}>
                                    <div className="active-plan-header-new">
                                        <div className="active-plan-logo">
                                            {imagePath ? (
                                                <img
                                                    src={resolveImageUrl(imagePath)}
                                                    alt={plan.planName || plan.plan?.name || 'Investment Plan'}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.parentElement.querySelector('.active-plan-logo-fallback-inline');
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="active-plan-logo-fallback-inline" style={{ display: imagePath ? 'none' : 'flex', position: imagePath ? 'absolute' : 'relative' }}>Plan</div>
                                        </div>
                                        <div className="active-plan-title-wrap" style={{textAlign: 'left', display: 'block'}}>
                                            <h2 className="active-plan-title-new" style={{ fontSize: '24px', fontWeight: '700', textTransform: 'uppercase' }}>{plan.planName || plan.plan?.name || 'Investment Plan'}</h2>
                                            <h3 className="active-plan-title-new" style={{ fontSize: '14px', fontWeight: '500' }}>{formatDate(plan.investmentDate)} - {formatTime(plan.investmentDate)}</h3>
                                            <div className="active-plan-status" style={{ backgroundColor: getStatusBadge(plan.status).color, borderRadius: '6px', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
                                                <FontAwesomeIcon icon={getStatusBadge(plan.status).icon} className="status-icon" />
                                                <span className="status-label">{getStatusBadge(plan.status).label}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="plan-investment">
                                        <div className="date-item1">
                                            <span className="date-label">Invested</span>
                                            <span className="date-value">${formatAmount(plan.investmentAmount || 0)}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Daily Income</span>
                                            <span className="date-value">${formatAmount(plan.dailyProfit)}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Return</span>
                                            <span className="date-value">${formatAmount(plan.totalProfit || 0)}</span>
                                        </div>
                                    </div>

                                    <div className="plan-dates">
                                        <div className="date-item1">
                                            <span className="date-label">Total Earned</span>
                                            <span className="date-value">${formatAmount(plan.currentEarnings || 0)}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Remaining</span>
                                            <span className="date-value">${formatAmount((plan.totalProfit || 0) - (plan.currentEarnings || 0))}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Ends ON</span>
                                            <span className="date-value">{formatDate(plan.endDate)}</span>
                                              
                                        </div>
                                    </div>
                                

                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom Navigation */}
                <BottomNav />
            </div>
        </div>
    );
};

export default ActivePlans;
