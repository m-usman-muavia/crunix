import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './css/login.css';
import './css/style.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './logo';
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
    <div className="login-page">
      <div className="login-gradient-wrapper">

        <div className="login-brand">
          <Logo />
        </div>

        <div className="login-card">
          <Link to="/" className="back-link">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to sign in
          </Link>

          <h1 className="login-title">Verify your email</h1>
          <p className="login-subtitle">We've sent a 6-digit code to</p>
          <p className="email-display">{email}</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-field">
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
                autoFocus
              />
            </div>

            <p className="otp-instruction">Enter the 6-digit verification code sent to your email</p>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="auth-links-row">
            <span className="resend-text">Didn't receive code?</span>
            <span className="links-separator">•</span>
            <Link to="/" className="forgot-link">Resend OTP</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmail;