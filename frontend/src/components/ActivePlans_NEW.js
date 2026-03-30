import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faPause, faChevronDown, faCoins, faClock } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import './css/plans.css';
import './css/style.css';
import './css/profile.css';
import './css/hybrid-cards.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';
import ErrorModal from './ErrorModal';

const ActivePlans = () => {
    const [activePlans, setActivePlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [plansError, setPlansError] = useState('');
    const [expandedPlan, setExpandedPlan] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [nowTick, setNowTick] = useState(Date.now());
    const navigate = useNavigate();

    useEffect(() => {
        fetchActivePlans();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setNowTick(Date.now());
        }, 1000);
        return () => clearInterval(interval);
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

    const getNextCollectDate = (plan) => {
        if (plan.nextCollectAt) {
            const serverNext = new Date(plan.nextCollectAt);
            if (!Number.isNaN(serverNext.getTime())) {
                return serverNext;
            }
        }

        const anchor =
            plan.lastCollectTime ||
            plan.activated_at ||
            plan.activatedAt ||
            plan.investmentDate ||
            null;

        if (!anchor) {
            return null;
        }

        const anchorDate = new Date(anchor);
        if (Number.isNaN(anchorDate.getTime())) {
            return null;
        }

        return new Date(anchorDate.getTime() + 24 * 60 * 60 * 1000);
    };

    const getCanCollect = (plan) => {
        if (plan.status !== 'active') return false;
        return getTimeUntilNextCollection(plan) <= 0;
    };

    const getTimeUntilNextCollection = (plan) => {
        const nextCollectDate = getNextCollectDate(plan);
        if (!nextCollectDate) return 0;
        const secondsLeft = Math.max(0, Math.ceil((nextCollectDate.getTime() - nowTick) / 1000));
        return secondsLeft;
    };

    const formatTimeRemaining = (seconds) => {
        if (seconds === 0) return 'Ready';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const handleCollectEarnings = async (planId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/plans/${planId}/collect-income`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                let errorMessage = 'Failed to collect earnings';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    const rawText = await response.text();
                    if (rawText) {
                        errorMessage = rawText.slice(0, 180);
                    }
                }
                throw new Error(errorMessage);
            }

            await response.json();
            setErrorMessage('Daily earnings collected successfully!');
            setShowErrorModal(true);

            fetchActivePlans();
        } catch (err) {
            console.error('Error collecting earnings:', err);
            setErrorMessage(err.message);
            setShowErrorModal(true);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return { color: '#10b981', icon: faCheckCircle, label: 'Active' };
            case 'paused':
                return { color: '#f59e0b', icon: faPause, label: 'Paused' };
            case 'completed':
                return { color: '#6366f1', icon: faCheckCircle, label: 'Completed' };
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

    const formatDateTime = (date) => {
        if (!date) {
            return 'N/A';
        }

        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) {
            return 'N/A';
        }

        return parsed.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    const filteredPlans = activePlans.filter(plan => {
        return plan.status === 'active' || plan.status === 'paused';
    });

    const totalEarnings = filteredPlans.reduce((sum, plan) => {
        return sum + (Number(plan.currentEarnings || plan.totalEarned || 0));
    }, 0);

    const activePlanCount = filteredPlans.filter(p => p.status === 'active').length;
    const pausedPlanCount = filteredPlans.filter(p => p.status === 'paused').length;

    return (
        <div className="main-wrapper">
            <div className="main-container">
                {/* Modern Hero Header */}
                <div className="dashboard-modern-hero dashboard-service-hero">
                    <div className="dashboard-modern-hero-top">
                        <div>
                            <p className="dashboard-service-label">Your investments</p>
                            <h1 className="dashboard-modern-title">Active Plans</h1>
                        </div>
                        <div className="dashboard-header-actions">

                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="plans-status-overview">
                        <div className="plans-status-card">
                            <p className="plans-status-label">Total Earned</p>
                            <h3 className="plans-status-value">AED{formatAmount(totalEarnings)}</h3>
                        </div>
                        <div className="plans-status-card">
                            <p className="plans-status-label">Active Plans</p>
                            <h3 className="plans-status-value">{activePlanCount}</h3>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {plansError && <div className="error-message" style={{ margin: '20px' }}>{plansError}</div>}

                {loadingPlans ? (
                    <div className="loading-spinner">
                        <p>Loading your plans...</p>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="empty-state-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <p className="empty-state-text">You don't have any plans yet.</p>
                        <Link to="/plans" className="dashboard-modern-edit-link" style={{ marginTop: '16px', display: 'inline-block' }}>
                            Browse Plans
                        </Link>
                    </div>
                ) : (
                    <div style={{ padding: '20px' }}>
                        {filteredPlans.map((plan) => {
                            const totalProfit = Number(plan.totalProfit || 0);
                            const earned = Number(plan.currentEarnings || 0);
                            const earnedPercent = totalProfit > 0 ? Math.min(100, (earned / totalProfit) * 100) : 0;
                            const imagePath = plan.image_path || plan.plan?.image_path;
                            const isExpanded = expandedPlan === plan._id;
                            const canCollect = getCanCollect(plan);
                            const remainingSeconds = getTimeUntilNextCollection(plan);
                            const nextCollectDate = getNextCollectDate(plan);
                            const nextCollectionText = nextCollectDate
                                ? formatDateTime(nextCollectDate)
                                : 'N/A';
                            const nextCollectionLabel = canCollect
                                ? `Next collection: ${nextCollectionText} (Ready now)`
                                : `Next collection: ${nextCollectionText}`;

                            return (
                                <div className="active-plans-hybrid-card" key={plan._id} style={{ marginBottom: '16px' }}>
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
                                                    <div className="hybrid-card-image-fallback">📊</div>
                                                )}
                                            </div>

                                            <div className="hybrid-card-info">
                                                <div style={{ textAlign: 'left', gap: '12px', marginBottom: '6px' }}>
                                                    <h3 className="hybrid-card-title" style={{textAlign:'left'}}>{plan.planName || plan.plan?.name || 'Investment Plan'}</h3>
                                                    <p className="hybrid-card-meta">{formatDate(plan.investmentDate)}</p>
                                                    {plan.status === 'active' && (
                                                        <button
                                                            onClick={() => handleCollectEarnings(plan._id)}
                                                            className="action-btn collect-btn"
                                                            style={{ textAlign: 'left', padding: '4px 8px', fontSize: '12px', borderRadius: '4px' }}
                                                            disabled={!canCollect}
                                                            title={!canCollect ? formatTimeRemaining(remainingSeconds) : 'Collect now'}
                                                        >
                                                            {canCollect ? 'Collect' : formatTimeRemaining(remainingSeconds)}
                                                        </button>
                                                    )}
                                                </div>


                                            </div>
                                        </div>

                                        <div className="hybrid-card-amount">
                                            <p style={{ fontSize: '12px', color: '#999' }}>Total Earned</p>
                                            <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#f97316' }}>
                                                AED{formatAmount(earned)}
                                            </h4>
                                            <FontAwesomeIcon
                                                icon={faChevronDown}
                                                style={{
                                                    marginTop: '10px',
                                                    transition: 'transform 0.3s ease',
                                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    color: '#f97316'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Expanded Details Section */}
                                    {isExpanded && (
                                        <div className="hybrid-card-details">
                                            <div className="details-grid">
                                                <div className="detail-item">
                                                    <span className="detail-label">Investment Amount</span>
                                                    <span className="detail-value">AED {formatAmount(plan.investmentAmount || 0)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Daily Income</span>
                                                    <span className="detail-value">AED {formatAmount(plan.dailyProfit)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Total Return</span>
                                                    <span className="detail-value">AED {formatAmount(totalProfit)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Remaining</span>
                                                    <span className="detail-value">AED {formatAmount(Math.max(0, totalProfit - earned))}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Ends On</span>
                                                    <span className="detail-value">{formatDate(plan.endDate)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Next Collection</span>
                                                    <span className="detail-value">{nextCollectionText}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="hybrid-card-actions">
                                                {/* <p className="hybrid-card-meta" style={{ margin: '0 0 8px', textAlign: 'left' }}>
                                                    {nextCollectionLabel}
                                                </p> */}
                                                {plan.status === 'active' && (
                                                    <>
                                                        {canCollect ? (
                                                            <button
                                                                onClick={() => handleCollectEarnings(plan._id)}
                                                                className="action-btn collect-btn"
                                                            >
                                                                <FontAwesomeIcon icon={faCoins} /> Collect Daily Earning
                                                            </button>
                                                        ) : (
                                                            <div className="collection-timer">
                                                                <FontAwesomeIcon icon={faClock} />
                                                                <span>{formatTimeRemaining(remainingSeconds)}</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <BottomNav />

                {showErrorModal && (
                    <ErrorModal
                        message={errorMessage}
                        onClose={() => setShowErrorModal(false)}
                        closeDuration={3000}
                    />
                )}
            </div>
        </div>
    );
};

export default ActivePlans;
