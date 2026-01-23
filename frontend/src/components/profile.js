import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changeMessage, setChangeMessage] = useState('');
    const [changeError, setChangeError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Get user info on component mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

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
            const response = await fetch('/api/auth/change-password', {
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
                setChangeError(data.message || 'Failed to change password');
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

    return (
        <div className="main-wrapper">
            <div className="main-container">
                {/* Top Header Section */}
                <header className="profile-header">
                    <div className="profile-avatar">{user?.name?.[0] || 'U'}</div>
                    <div className="profile-user-info">
                        <h4 className="profile-username">{user?.username || 'User'}</h4>
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
                    <button 
                        type="button" 
                        className={`profile-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                    <button 
                        type="button" 
                        className={`profile-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </button>
                    <button 
                        type="button" 
                        className={`profile-btn ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        Change Password
                    </button>
                </div>

                {/* Profile Section */}
                {activeTab === 'profile' && (
                    <div className="profile-content">
                        <h2 className="profile-title">Profile Overview</h2>
                        <div className="profile-info">
                            <div className="info-item">
                                <label>Name:</label>
                                <span>{user?.name || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <span>{user?.email || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Referral Code:</label>
                                <span>{user?.referralCode || 'N/A'}</span>
                            </div>
                        </div>
                        <button type="button" className="sign-in-btn logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                )}

                {/* History Section */}
                {activeTab === 'history' && (
                    <div className="profile-content">
                        <h2 className="profile-title">Transaction History</h2>
                        <div className="history-content">
                            <p>No transactions to display.</p>
                        </div>
                    </div>
                )}

                {/* Settings Section */}
                {activeTab === 'settings' && (
                    <div className="profile-content">
                        <h2 className="profile-title">Settings</h2>
                        <div className="settings-content">
                            <p>Settings options will be available soon.</p>
                        </div>
                    </div>
                )}

                {/* Change Password Section */}
                {activeTab === 'password' && (
                    <div className="profile-content">
                        <h2 className="profile-title">Change Password</h2>

                        {changeMessage && <div className="success-message">{changeMessage}</div>}
                        {changeError && <div className="error-message">{changeError}</div>}

                        <form onSubmit={handleChangePassword} className="password-form">
                            <div className="form-group">
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

                            <button
                                type="submit"
                                className="sign-in-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                )}

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