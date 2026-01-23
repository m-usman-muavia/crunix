import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft,faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import './css/emailOTP.css';
import './css/dashboard.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './logo';
import './css/style.css';
import './css/profile.css';
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
    <div className="main-wrapper">
      <div className="main-container">
        <div className="login-card">
          <Link to="/login" className="back-link">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to sign in
          </Link>
          <Logo />  
          <h1 className="title">Verify your email</h1>
          <p className="subtitle">We've sent a 6-digit code to</p>
            <p className="email-address">
              {email}
            </p>
          <form className="otp-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Enter OTP</label>
              <div className="input-wrapper">
                <span className="icon">🔐</span>
                <input 
                  type="text" 
                  placeholder="000000" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  required
                  className="otp-input"
                  autoFocus
                />
              </div>
            </div>
            <p className="otp-instruction">Enter the 6-digit verification code sent to your email</p>
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
            <button type="submit" className="sign-in-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;