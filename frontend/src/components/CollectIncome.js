import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './css/dashboard.css';
import './css/style.css';
import './css/profile.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const CollectIncome = () => {
    const [activePlans, setActivePlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [collectingId, setCollectingId] = useState(null);
    const [collectMessage, setCollectMessage] = useState('');
    const [countdowns, setCountdowns] = useState({});
    const [expandedPlanId, setExpandedPlanId] = useState(null);

    useEffect(() => {
        fetchActivePlans();
        const interval = setInterval(updateCountdowns, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        updateCountdowns();
    }, [activePlans]);

    const fetchActivePlans = async () => {
        setLoading(true);
        setError('');
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
            const plans = Array.isArray(data) ? data : data.data || [];
            
            // Filter only active plans
            const activePlansOnly = plans.filter(plan => plan.status === 'active');
            setActivePlans(activePlansOnly);
        } catch (err) {
            console.error('Error fetching active plans:', err);
            setError(err.message);
            setActivePlans([]);
        } finally {
            setLoading(false);
        }
    };

    const updateCountdowns = () => {
        const newCountdowns = {};
        activePlans.forEach(plan => {
            const lastCollectTime = plan.lastCollectTime ? new Date(plan.lastCollectTime) : null;
            const baseCollectTime = lastCollectTime || (plan.investmentDate ? new Date(plan.investmentDate) : null);

            if (baseCollectTime) {
                const now = new Date();
                const nextCollectTime = new Date(baseCollectTime.getTime() + 24 * 60 * 60 * 1000);
                const timeLeft = nextCollectTime - now;

                if (timeLeft > 0) {
                    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    newCountdowns[plan._id] = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                } else {
                    newCountdowns[plan._id] = 'Ready';
                }
            } else {
                newCountdowns[plan._id] = 'Ready';
            }
        });
        setCountdowns(newCountdowns);
    };

    const canCollect = (plan) => {
        if (plan.status !== 'active') return false;

        // Check if there's a daily income available
        if (!plan.dailyProfit || plan.dailyProfit <= 0) return false;

        const lastCollectTime = plan.lastCollectTime ? new Date(plan.lastCollectTime) : null;
        const baseCollectTime = lastCollectTime || (plan.investmentDate ? new Date(plan.investmentDate) : null);
        const now = new Date();

        if (!baseCollectTime) {
            return false;
        }

        const hoursPassed = (now - baseCollectTime) / (1000 * 60 * 60);
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

    const handleCollectIncome = async (planId) => {
        setCollectingId(planId);
        setCollectMessage('');

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/plans/${planId}/collect-income`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                setCollectMessage({ type: 'error', text: data.message || 'Failed to collect income' });
                setCollectingId(null);
                return;
            }

            const collectedAmount = data.collectedAmount || data.amount || 0;
            setCollectMessage({ type: 'success', text: `Collected $${collectedAmount} successfully!` });
            
            // Refresh plans after collection
            setTimeout(() => {
                fetchActivePlans();
                setCollectingId(null);
            }, 1500);
        } catch (err) {
            console.error('Error collecting income:', err);
            setCollectMessage({ type: 'error', text: 'Error collecting income. Please try again.' });
            setCollectingId(null);
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return { color: '#16a34a', icon: faCheckCircle, label: 'Active' };
            default:
                return { color: '#6b7280', icon: faCheckCircle, label: 'Active' };
        }
    };

    const getAccrualStatus = (accrualItem) => {
        if (!accrualItem) return { label: 'N/A', color: '#64748b' };
        
        // Assuming status is stored in accrualItem
        if (accrualItem.status === 'collected') {
            return { label: 'Collected', color: '#16a34a' };
        } else if (accrualItem.status === 'expired') {
            return { label: 'Expired', color: '#ef4444' };
        } else if (accrualItem.status === 'pending') {
            return { label: 'Pending', color: '#f59e0b' };
        }
        
        return { label: 'Available', color: '#3b82f6' };
    };

    return (
        <div className="main-wrapper">
            <div className="main-container">
                {/* Top Header Section */}
                <div className="deposit-header">Collect Daily Income</div>

                {collectMessage && (
                    <div style={{
                        margin: '20px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: collectMessage.type === 'error' ? '#fee' : '#efe',
                        color: collectMessage.type === 'error' ? '#c00' : '#060',
                        border: `1px solid ${collectMessage.type === 'error' ? '#fcc' : '#0f0'}`,
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        {collectMessage.text}
                    </div>
                )}

                {loading ? (
                    <div className="loading-spinner" style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <p>Loading your plans...</p>
                    </div>
                ) : error ? (
                    <div className="error-message" style={{ margin: '20px' }}>{error}</div>
                ) : activePlans.length === 0 ? (
                    <div className="empty-" style={{ padding: '20px 20px', textAlign: 'center' }}>
                        <p className="empty-state-text">No active plans available.</p>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>
                            Invest in a plan to start earning daily income.
                        </p>
                        
                    </div>
                ) : (
                    <div className="active-plans-grid" style={{ padding: '20px' }}>
                        {activePlans.map((plan) => {
                            const imagePath = plan.image_path || plan.plan?.image_path;
                            const isReadyToCollect = canCollect(plan);
                            const countdownRaw = countdowns[plan._id] || 'Ready';
                            const isCountdownReady = countdownRaw === 'Ready';
                            const countdownDisplay = isCountdownReady ? 'Collect' : countdownRaw;
                            const lastCollectTime = plan.lastCollectTime ? new Date(plan.lastCollectTime) : null;
                            const baseCollectTime = lastCollectTime || (plan.investmentDate ? new Date(plan.investmentDate) : null);
                            const nextCollectTime = baseCollectTime
                                ? new Date(baseCollectTime.getTime() + 24 * 60 * 60 * 1000)
                                : null;

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
                                        <div className="active-plan-title-wrap" style={{textAlign: 'left'}}>
                                            <h2 className="active-plan-title-new" style={{ fontSize: '24px', fontWeight: '700', textTransform: 'uppercase' }}>{plan.planName || plan.plan?.name || 'Investment Plan'}</h2>
                                            <h3 className="active-plan-title-new" style={{ fontSize: '14px', fontWeight: '500' }}>
                                                Next: {nextCollectTime ? `${formatDate(nextCollectTime)} - ${formatTime(nextCollectTime)}` : 'Not available'}
                                            </h3>
                                            <h3 className="active-plan-title-new" style={{ fontSize: '14px', fontWeight: '500' }}>
                                                Last: {lastCollectTime ? `${formatDate(lastCollectTime)} - ${formatTime(lastCollectTime)}` : 'Not collected'}
                                            </h3>
                                        </div>
                                    </div>
                                    <div style={{  display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => handleCollectIncome(plan._id)}
                                            className='primary-btn'
                                            disabled={!isReadyToCollect || collectingId === plan._id}
                                            >
                                            {collectingId === plan._id ? '⏳ Collecting...' : isReadyToCollect ? 'Collect Now' : `${countdownDisplay}`}
                                        </button>
                                    </div>

                                    {/* <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '15px' }}>
                                        <button
                                            onClick={() => setExpandedPlanId(expandedPlanId === plan._id ? null : plan._id)}
                                            style={{
                                                width: '100%',
                                                padding: '12px 20px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#334155'
                                            }}>
                                            <span>Collection History</span>
                                            <span style={{ transform: expandedPlanId === plan._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
                                        </button>

                                        {expandedPlanId === plan._id && (
                                            <div style={{ padding: '0 20px 15px 20px', maxHeight: '300px', overflowY: 'auto' }}>
                                                {plan.accrualHistory && plan.accrualHistory.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        {plan.accrualHistory.map((accrual, idx) => {
                                                            const accrualStatus = getAccrualStatus(accrual);
                                                            return (
                                                                <div key={idx} style={{
                                                                    padding: '12px',
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: '6px',
                                                                    backgroundColor: '#f8fafc'
                                                                }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                                            {formatDate(accrual.timestamp || accrual.date)}
                                                                        </span>
                                                                        <span style={{
                                                                            fontSize: '11px',
                                                                            fontWeight: '600',
                                                                            padding: '3px 8px',
                                                                            borderRadius: '4px',
                                                                            backgroundColor: accrualStatus.color + '20',
                                                                            color: accrualStatus.color
                                                                        }}>
                                                                            {accrualStatus.label}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                                                        <div>
                                                                            <span style={{ color: '#64748b', display: 'block' }}>Days Accrued</span>
                                                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{accrual.daysAccrued || 1} days</span>
                                                                        </div>
                                                                        <div>
                                                                            <span style={{ color: '#64748b', display: 'block' }}>Amount</span>
                                                                            <span style={{ fontWeight: '600', color: '#16a34a' }}>${formatAmount(accrual.amountAdded || 0)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                                        No accrual history yet
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div> */}
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

export default CollectIncome;
