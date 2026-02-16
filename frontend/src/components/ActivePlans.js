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
    const [plansTab, setPlansTab] = useState('active');
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

    const filteredPlans = activePlans.filter(plan => {
        if (plansTab === 'active') {
            return plan.status === 'active' || plan.status === 'paused';
        } else if (plansTab === 'completed') {
            return plan.status === 'completed';
        }
        return true;
    });

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
              
                {plansError && <div className="error-message" style={{ margin: '20px' }}>{plansError}</div>}

                {loadingPlans ? (
                    <div className="loading-spinner">
                        <p>Loading your plans...</p>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px 20px' }}>
                        <p className="empty-state-text">
                            {plansTab === 'active' 
                                ? "You don't have any active plans yet." 
                                : "You don't have any completed plans yet."}
                        </p>
                        {plansTab === 'active' && (
                            <Link to="/plans" className="noactivate-btn">
                                Browse Plans
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="active-plans-grid" style={{ padding: '20px' }}>
                        {filteredPlans.map((plan) => {
                            const totalProfit = Number(plan.totalProfit || 0);
                            const earned = Number(plan.currentEarnings || 0);
                            const earnedPercent = totalProfit > 0 ? Math.min(100, (earned / totalProfit) * 100) : 0;
                            const remainingPercent = 100 - earnedPercent;
                            const imagePath = plan.plan?.image_path || plan.image_path;

                            return (
                                <div className="active-plan-card-new" key={plan._id}>
                                    <div className="active-plan-header-new">
                                        <div className="active-plan-logo">
                                            {imagePath ? (
                                                <>
                                                    <img
                                                        src={resolveImageUrl(imagePath)}
                                                        alt={plan.planName || plan.plan?.name || 'Investment Plan'}
                                                        onLoad={(e) => {
                                                            if (e.target.nextSibling) {
                                                                e.target.nextSibling.style.display = 'none';
                                                            }
                                                        }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            if (e.target.nextSibling) {
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }
                                                        }}
                                                    />
                                                    <div className="active-plan-logo-fallback" style={{ display: 'none' }}>Plan</div>
                                                </>
                                            ) : (
                                                <div className="active-plan-logo-fallback">Plan</div>
                                            )}
                                        </div>
                                        <div className="active-plan-title-wrap" style={{textAlign: 'left'}}>
                                            <h2 className="active-plan-title-new" style={{ fontSize: '24px', fontWeight: '700', textTransform: 'uppercase' }}>{plan.planName || plan.plan?.name || 'Investment Plan'}</h2>
                                            <h3 className="active-plan-title-new" style={{ fontSize: '16px', fontWeight: '500' }}>{formatDate(plan.investmentDate)}</h3>
                                            <div className="active-plan-status" style={{ backgroundColor: getStatusBadge(plan.status).color, borderRadius: '6px', padding: '3px 4px',marginRight: '28px' }}>
                                                <FontAwesomeIcon icon={getStatusBadge(plan.status).icon} className="status-icon" />
                                                <span className="status-label">{getStatusBadge(plan.status).label}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="active-plan-body">
                                        <div className="active-plan-col">
                                            <div className="active-plan-row">
                                                <span>Active Invested:</span>
                                                <strong>${formatAmount(plan.investmentAmount || 0)}</strong>
                                            </div>
                                            <div className="active-plan-row">
                                                <span>Daily Income:</span>
                                                <strong>${formatAmount(plan.dailyProfit || 0)}</strong>
                                            </div>
                                            <div className="active-plan-row">
                                                <span>Total Return:</span>
                                                <strong>${formatAmount(plan.totalProfit || 0)}</strong>
                                            </div>
                                            <div className="active-plan-row">
                                                <span>Earned</span>
                                                <strong>${formatAmount(plan.currentEarnings || 0)}</strong>
                                            </div>
                                            <div className="active-plan-row">
                                                <span>Remaining:</span>
                                                <strong>${formatAmount((plan.totalProfit || 0) - (plan.currentEarnings || 0))}</strong>
                                            </div>
                                        </div>

                                        <div className="active-plan-divider"></div>

                                        <div className="active-plan-col">
                                            <div className="active-plan-row">
                                                <span>Start Date:</span>
                                                <strong>{formatDate(plan.investmentDate)}</strong>
                                            </div>
                                            <div className="active-plan-row">
                                                <span>End Date:</span>
                                                <strong>{formatDate(plan.endDate)}</strong>
                                            </div>
                                            <div className="active-plan-row">
                                                <span>Investment Time:</span>
                                                <strong>{formatTime(plan.investmentDate)}</strong>
                                            </div>
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
