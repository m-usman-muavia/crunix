import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/adminlogin.css';

const AdminLogin = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Static admin credentials
    const ADMIN_PIN = '1234@';
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'Admin@123';

    const handlePinSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate delay
        setTimeout(() => {
            if (pin === ADMIN_PIN) {
                localStorage.setItem('adminAuthenticated', 'true');
                navigate('/admin/');
            } else {
                setError('Invalid PIN. Please try again.');
                setPin('');
            }
            setLoading(false);
        }, 500);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAuthenticated');
        navigate('/');
    };

    return (
        <div className="admin-login-wrapper">
            <div className="admin-login-container">
                <div className="admin-login-card">
                    <div className="admin-login-header">
                        <h1 className="admin-login-title">🔐 Admin Access</h1>
                        <p className="admin-login-subtitle">Enter PIN to access admin panel</p>
                    </div>

                    <form onSubmit={handlePinSubmit} className="admin-login-form">
                        <div className="admin-form-group">
                            <label htmlFor="pin" className="admin-form-label">PIN</label>
                            <input
                                id="pin"
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Enter 4-digit PIN"
                                maxLength="6"
                                className="admin-form-input"
                                required
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        {error && <div className="admin-error-message">{error}</div>}

                        <button
                            type="submit"
                            className="admin-login-btn"
                            disabled={loading || pin.length === 0}
                        >
                            {loading ? 'Verifying...' : 'Login'}
                        </button>
                    </form>

                    {/* <div className="admin-login-info">
                        <p className="admin-info-title">📌 Credentials:</p>
                        <ul className="admin-credentials-list">
                            <li><strong>PIN:</strong> {ADMIN_PIN}</li>
                            <li><strong>Username:</strong> {ADMIN_USERNAME}</li>
                            <li><strong>Password:</strong> {ADMIN_PASSWORD}</li>
                        </ul>
                    </div> */}

                    <button
                        type="button"
                        className="admin-back-btn"
                        onClick={() => navigate('/')}
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
