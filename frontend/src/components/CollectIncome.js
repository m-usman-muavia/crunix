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

    useEffect(() => {
        fetchActivePlans();
    }, []);

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

        // Check if 24 hou$have passed since last collection
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

            setCollectMessage({ type: 'success', text: `Collected $${data.collectedAmount} successfully!` });
            
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

    const formatAmount = (value) => {
        const num = Number(value);
        return Number.isFinite(num) ? num.toFixed(2) : '0.00';
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
                    <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <p className="empty-state-text">No active plans available.</p>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>
                            Invest in a plan to start earning daily income.
                        </p>
                        <Link to="/plans" className="noactivate-btn" style={{ marginTop: '20px', display: 'inline-block' }}>
                            View Plans
                        </Link>
                    </div>
                ) : (
                    <div style={{ padding: '20px' }}>
                        {activePlans.map((plan) => {
                            const isReadyToCollect = canCollect(plan);
                            const timeUntilNext = getTimeUntilNextCollection(plan);

                            return (
                                <div 
                                    className="active-plan-card" 
                                    key={plan._id}
                                    style={{ marginBottom: '20px' }}
                                >
                                    <div className="active-plan-header">
                                        <div className="plan-name-section">
                                            <h3 className="active-plan-title">{plan.planName || plan.plan?.name || 'Investment Plan'}</h3>
                                        </div>
                                        <div className="status-badge" style={{ color: '#16a34a' }}>
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                            Active
                                        </div>
                                    </div>

                                    <div className="plan-investment">
                                        <div className="date-item1">
                                            <span className="date-label">Daily Income</span>
                                            <span className="date-value">${formatAmount(plan.dailyProfit)}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Total Collected</span>
                                            <span className="date-value">${formatAmount(plan.totalCollected || 0)}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Remaining</span>
                                            <span className="date-value">${formatAmount((plan.totalProfit || 0) - (plan.totalCollected || 0))}</span>
                                        </div>
                                    </div>

                                    <div className="plan-dates">
                                        <div className="date-item1">
                                            <span className="date-label">Start Date</span>
                                            <span className="date-value">{formatDate(plan.investmentDate)}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">End Date</span>
                                            <span className="date-value">{formatDate(plan.endDate)}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Status</span>
                                            <span className="date-value" style={{ color: isReadyToCollect ? '#16a34a' : '#f59e0b' }}>
                                                {timeUntilNext}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Collection Button */}
                                    <div style={{ marginTop: '16px' }}>
                                        <button
                                            onClick={() => handleCollectIncome(plan._id)}
                                            disabled={!isReadyToCollect || collectingId === plan._id}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                backgroundColor: isReadyToCollect ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#cbd5e1',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                cursor: isReadyToCollect && collectingId !== plan._id ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faArrowDown} />
                                            {collectingId === plan._id ? 'Collecting...' : 'Collect Income'}
                                        </button>
                                        {!isReadyToCollect && (
                                            <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '8px' }}>
                                                <FontAwesomeIcon icon={faClock} /> {timeUntilNext}
                                            </p>
                                        )}
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

export default CollectIncome;
