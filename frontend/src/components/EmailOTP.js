import React, { useState } from 'react';
import './css/login.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';


const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email: email,
        otpCode: otp
      });

      if (response.status === 200) {
        navigate('/', { state: { message: 'Email verified successfully! Please log in.' } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ref-page">
      <div className="ref-header">
        <h1 className="ref-header-title">Welcome!</h1>
        <p className="ref-header-desc">Unlocking prosperity with opportunity to secure your future.</p>
      </div>

      <div className="ref-card">
        <div className="ref-tabs">
          <button className="ref-tab">
            <Link to="/">Login</Link>
          </button>
          <button className="ref-tab ref-tab-active">
            <span>Email OTP</span>
          </button>
        </div>

        <Link to="/" className="ref-back-link">Back to sign in</Link>

        <p className="ref-flow-subtitle">We've sent a 6-digit code to</p>
        <p className="ref-email-display">{email || 'your email'}</p>

        <form className="ref-form" onSubmit={handleSubmit}>
          <div className="ref-inp-group">
            <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17 1H7c-1.1 0-2 .9-2 2v18l7-3 7 3V3c0-1.1-.9-2-2-2zm-1 14.14l-4-1.71-4 1.71V3h8v12.14z" fill="currentColor" />
            </svg>
            <input
              type="text"
              className="ref-inp"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              required
              autoFocus
            />
          </div>

          <p className="ref-help-text">Enter the 6-digit verification code sent to your email.</p>

          {error && <p className="ref-error">{error}</p>}

          <button type="submit" className="ref-btn-submit" disabled={loading} aria-label={loading ? 'Verifying email' : 'Verify email'}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

        <div className="ref-divider">Or</div>

        <div className="ref-row-center">
          <span className="ref-help-inline">Didn't receive code?</span>
          <Link to="/" className="ref-forgot-link">Resend OTP</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;