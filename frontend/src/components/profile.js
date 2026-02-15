import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCheckCircle, faPause, faPlay, faTrophy, faBox } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link } from 'react-router-dom';
import './css/dashboard.css';
import './css/style.css';
import './css/profile.css';
import './css/transactions.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

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
    const [plansTab, setPlansTab] = useState('active');
    const [referralCode, setReferralCode] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifError, setNotifError] = useState('');
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

    // Fetch notifications when notifications tab is selected
    useEffect(() => {
        if (activeTab === 'notification') {
            fetchNotifications();
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

    const fetchNotifications = async () => {
        try {
            setNotifLoading(true);
            setNotifError('');
            const authToken = localStorage.getItem('authToken');

            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                const data = await response.json();
                const notifs = Array.isArray(data) ? data : (data.data || []);
                setNotifications(notifs);
            } else {
                throw new Error('Failed to fetch notifications');
            }
        } catch (err) {
            setNotifError(err.message);
            setNotifications([]);
        } finally {
            setNotifLoading(false);
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

    const filteredTransactions = transactions.filter(tx => tx.type === txTab.slice(0, -1));

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
                <div className="deposit-header">Profile</div>
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






                {/* Profile Section */}
                {activeTab === 'profile' && (
                    <div className="profile-content">
                        <h2 className="profile-title"></h2>

                        <div className="card-container">
                            <div className="content-card password-card">
                                <form onSubmit={handleChangePassword} className="password-form">
                                    <div className="form-group">
                                        {/* <label className="form-label">Name</label>
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
                                        /> */}
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
                                        className="primary-btn"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Changing Password...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <div className="logout-section">

                    <button className="primary-btn" style={{margin: '0 50px'}} onClick={handleLogout}>Logout</button>
                </div>

                {/* Bottom Navigation */}
                <BottomNav />

            </div>
        </div>
    );
};

export default Profile;