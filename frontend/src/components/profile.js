import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser, faClock, faCheckCircle, faPause, faPlay, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/profile.css';
import './css/transactions.css';
import API_BASE_URL from '../config/api';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changeMessage, setChangeMessage] = useState('');
    const [changeError, setChangeError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activePlans, setActivePlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [plansError, setPlansError] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [txLoading, setTxLoading] = useState(false);
    const [txError, setTxError] = useState('');
    const [txTab, setTxTab] = useState('deposits');
    const [referralCode, setReferralCode] = useState('');
    const navigate = useNavigate();

    // Get user info on component mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Fetch referral code
        fetchReferralCode();
    }, []);

    const fetchReferralCode = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/referral/code`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReferralCode(data.referralCode || 'N/A');
                // Also update user state with referral code
                setUser(prevUser => ({
                    ...prevUser,
                    referralCode: data.referralCode || 'N/A'
                }));
            }
        } catch (err) {
            console.error('Error fetching referral code:', err);
            setReferralCode('N/A');
        }
    };

    // Fetch active plans when activeplans tab is selected
    useEffect(() => {
        if (activeTab === 'activeplans') {
            fetchActivePlans();
        }
    }, [activeTab]);

    // Fetch transactions when transactions tab is selected
    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [activeTab]);

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

    const fetchTransactions = async () => {
        try {
            setTxLoading(true);
            setTxError('');
            const authToken = localStorage.getItem('authToken');

            const depositsRes = await fetch(`${API_BASE_URL}/api/deposits/my-deposits`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const withdrawalsRes = await fetch(`${API_BASE_URL}/api/withdrawals/my-withdrawals`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            let allTransactions = [];

            if (depositsRes.ok) {
                const depositsData = await depositsRes.json();
                const deposits = Array.isArray(depositsData) ? depositsData : (depositsData.data || []);
                const formattedDeposits = deposits.map(dep => ({
                    _id: dep._id,
                    type: 'deposit',
                    amount: Number(dep.deposit_amount ?? dep.amount ?? 0),
                    status: dep.status,
                    date: dep.createdAt,
                    sender_mobile: dep.sender_mobile,
                    transaction_id: dep.transaction_id
                }));
                allTransactions = [...allTransactions, ...formattedDeposits];
            }

            if (withdrawalsRes.ok) {
                const withdrawalsData = await withdrawalsRes.json();
                const withdrawals = Array.isArray(withdrawalsData) ? withdrawalsData : (withdrawalsData.data || []);
                const formattedWithdrawals = withdrawals.map(wit => ({
                    _id: wit._id,
                    type: 'withdrawal',
                    amount: Number(wit.withdrawal_amount ?? wit.amount ?? 0),
                    status: wit.status,
                    date: wit.createdAt,
                    wallet_address: wit.wallet_address
                }));
                allTransactions = [...allTransactions, ...formattedWithdrawals];
            }

            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(allTransactions);
        } catch (err) {
            setTxError(err.message);
            setTransactions([]);
        } finally {
            setTxLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setChangeMessage('');
        setChangeError('');

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setChangeError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setChangeError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setChangeError('Password must be at least 6 characters long');
            return;
        }

        if (oldPassword === newPassword) {
            setChangeError('New password must be different from the old password');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific errors
                if (response.status === 401) {
                    setChangeError('Old password is incorrect. Please try again.');
                } else if (response.status === 404) {
                    setChangeError('User not found. Please login again.');
                } else {
                    setChangeError(data.message || 'Failed to change password');
                }
                return;
            }

            setChangeMessage('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Clear message after 3 seconds
            setTimeout(() => setChangeMessage(''), 3000);
        } catch (error) {
            setChangeError('Error: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        // Clear all stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        // Redirect to login
        navigate('/');
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

            // Refresh the plans list
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

            // Refresh the plans list
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

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'accept':
                return '#27ae60';
            case 'rejected':
            case 'reject':
                return '#e74c3c';
            case 'pending':
                return '#f39c12';
            default:
                return '#7f8c8d';
        }
    };

    const getStatusText = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
    };

    const calculateProgress = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        const total = end - start;
        const elapsed = now - start;
        const progress = Math.min((elapsed / total) * 100, 100);
        return Math.max(0, progress);
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

    const filteredTransactions = transactions.filter(tx => tx.type === txTab.slice(0, -1));

    return (
        <div className="main-wrapper">
            <div className="main-container">
                {/* Top Header Section */}
                <header className="profile-header">
                    <div className="profile-avatar" style={{ textTransform: 'uppercase' }}>{user?.name?.[0] || 'U'}</div>
                    <div className="profile-user-info">
                        <h4 className="profile-username">{user?.name || 'User'}</h4>
                        <p className="profile-email">{user?.email || 'email@example.com'}</p>
                    </div>
                </header>

                <div className="profile-buttons">
                    <button
                        type="button"
                        className={`profile-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    {/* <button
                        type="button"
                        className={`profile-btn ${activeTab === 'notification' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notification')}
                    >
                        Notifications
                    </button> */}
                    <button
                        type="button"
                        className={`profile-btn ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        Transactions History
                    </button>
                    <button
                        type="button"
                        className={`profile-btn ${activeTab === 'activeplans' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activeplans')}
                    >
                        Activate Plans
                    </button>
                </div>




                {/* Profile Section */}
                {activeTab === 'profile' && (
                    <div className="profile-content">
                        <h2 className="profile-title">Profile</h2>

                        <div className="card-container">
                            <div className="content-card password-card">
                                <form onSubmit={handleChangePassword} className="password-form">
                                    <div className="form-group">
                                        <label className="form-label">Name</label>
                                        <input
                                            className="form-input"
                                            placeholder={user?.name || 'N/A'}
                                            value={user?.name || 'N/A'}
                                            disabled
                                        />
                                        <label className="form-label">Email</label>
                                        <input
                                            className="form-input"
                                            value={user?.email || 'N/A'}
                                            disabled
                                        />
                                        <label className="form-label">Referral Code</label>
                                        <input
                                            className="form-input"
                                            value={referralCode || user?.referralCode || 'N/A'}
                                            disabled
                                        />
                                        <label className="form-label">Old Password:</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="Enter your current password"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">New Password:</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter your new password"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password:</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your new password"
                                            required
                                        />
                                    </div>
                                    {changeMessage && <div className="success-message">{changeMessage}</div>}
                                    {changeError && <div className="error-message">{changeError}</div>}

                                    <button
                                        type="submit"
                                        className="sign-in-btn submit-btn"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Changing Password...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Section */}
                {/* {activeTab === 'notification' && (
                    <div className="profile-content">
                        <h2 className="profile-title">Notifications</h2>
                        <div className="card-container">
                            <div className="content-card">
                                <div className="empty-state-card">
                                    <FontAwesomeIcon icon={faBox} className="empty-icon" />
                                    <p className="empty-state-text">No Notifications to display.</p>
                                    <p className="empty-state-subtext">Your Notifications will appear here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}

                    {activeTab === 'transactions' && (
                    <div className="profile-content">
                        <h2 className="profile-title">Transactions History</h2>
                                                <div className="addplans-section">
                                                    <div className="addplans-card">
                                                        <div className="profile-buttons">
                                                            <button
                                                                type="button"
                                                                className={`profile-btn ${txTab === 'deposits' ? 'active' : ''}`}
                                                                onClick={() => setTxTab('deposits')}
                                                            >
                                                                Deposits
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`profile-btn ${txTab === 'withdrawals' ? 'active' : ''}`}
                                                                onClick={() => setTxTab('withdrawals')}
                                                            >
                                                                Withdrawals
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="plan-content">
                                                    {txLoading ? (
                                                        <p className="tx-message">Loading transactions...</p>
                                                    ) : txError ? (
                                                        <p className="tx-message tx-error">Error: {txError}</p>
                                                    ) : filteredTransactions.length === 0 ? (
                                                        <p className="tx-message">No transactions found</p>
                                                    ) : (
                                                        <div className="transactions-list">
                                                            {filteredTransactions.map((tx) => (
                                                                <div
                                                                    key={tx._id}
                                                                    className={`tx-card ${tx.type === 'deposit' ? 'tx-deposit' : 'tx-withdrawal'}`}
                                                                    style={{ borderLeftColor: getStatusColor(tx.status) }}
                                                                >
                                                                    <div className="tx-main">
                                                                        <div className="tx-header">
                                                                            
                                                                            <span className="tx-type" style={{ fontSize: '12px' }}>
                                                                                {tx.type}</span>
                                                                            <span className="tx-status" style={{ backgroundColor: getStatusColor(tx.status) }}>
                                                                                {getStatusText(tx.status)}
                                                                            </span>
                                                                        </div>

                                                                        
                                                                    </div>

                                                                    <div className="tx-amount">
                                                                        <div className={tx.type === 'deposit' ? 'tx-amount-deposit' : 'tx-amount-withdrawal'}>
                                                                            {tx.type === 'deposit' ? '+' : '-'}Rs {formatAmount(tx.amount)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                    </div>
                )}

                {/* Settings Section */}
                {activeTab === 'activeplans' && (
                    <div className="profile-content">
                        <h2 className="profile-title">Your Active Plans</h2>

                        {plansError && <div className="error-message">{plansError}</div>}

                        {loadingPlans ? (
                            <div className="loading-spinner">
                                <p>Loading your active plans...</p>
                            </div>
                        ) : activePlans.length === 0 ? (
                            <div className="empty-state">
                                <p className="empty-state-text">You don't have any active plans yet.</p>
                                <Link to="/plans" className="noactivate-btn">
                                    Browse Plans
                                </Link>
                            </div>
                        ) : (
                            <div className="active-plans-grid">
                                {activePlans.map((plan) => {
                                    const statusInfo = getStatusBadge(plan.status);
                                    const progress = calculateProgress(plan.investmentDate, plan.endDate);

                                    return (
                                        <div className="active-plan-card" key={plan._id}>
                                            <div className="active-plan-header">
                                                <div className="plan-name-section">
                                                    <h3 className="active-plan-title">{plan.planName || plan.plan?.name || 'Investment Plan'}</h3>

                                                </div>

                                                <div className="status-badge">
                                                    <FontAwesomeIcon icon={statusInfo.icon} />
                                                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}

                                                </div>
                                            </div>


                                            <div className="plan-investment">
                                                <div className="date-item1">
                                                    <span className="date-label">Invested</span>
                                                    <span className="date-value">Rs {plan.investmentAmount || '01'}</span>
                                                </div>
                                                <div className="date-item">
                                                    <span className="date-label">Daily Income</span>
                                                    <span className="date-value">Rs {plan.dailyProfit || '01'}</span>
                                                </div>
                                                <div className="date-item">
                                                    <span className="date-label">Total Return</span>
                                                    <span className="date-value">Rs {plan.totalProfit || '01'}</span>
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
                                                    <span className="date-label">Earned</span>
                                                    <span className="date-value">Rs {formatAmount(plan.currentEarnings || 0)}</span>
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <div className="logout-section">

                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>

                {/* Bottom Navigation */}
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
        </div>
    );
};

export default Profile;