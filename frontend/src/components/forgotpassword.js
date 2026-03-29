import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/login.css';
import API_BASE_URL from '../config/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send OTP');
        return;
      }

      setMessage('OTP sent to your email successfully!');
      setTimeout(() => {
        setStep(2);
        setMessage('');
      }, 1500);
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-forgot-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid OTP');
        return;
      }

      setMessage('OTP verified successfully!');
      setTimeout(() => {
        setStep(3);
        setMessage('');
      }, 1500);
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter both passwords');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password');
        return;
      }

      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ref-page">
      <div className="ref-header">
        <h1 className="ref-header-title">Welcome!</h1>
        <p className="ref-header-desc">Desert Oil Network is a Dubai-based platform generating daily profits based on oil price.</p>
      </div>

      <div className="ref-card">
        <div className="ref-tabs">
          <button className="ref-tab">
            <Link to="/">Login</Link>
          </button>
          <button className="ref-tab ref-tab-active">
            <span>Forgot Password</span>
          </button>
        </div>

        <Link to="/" className="ref-back-link">Back to sign in</Link>
        {error && <p className="ref-error">{error}</p>}
        {message && <p className="ref-success">{message}</p>}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="ref-form">
            <p className="ref-flow-subtitle">Enter your email to receive an OTP</p>
            <div className="ref-inp-group">
              <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor" />
              </svg>
              <input
                type="email"
                className="ref-inp"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="ref-btn-submit" disabled={isLoading} aria-label={isLoading ? 'Sending OTP' : 'Send OTP'}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="ref-form">
            <p className="ref-flow-subtitle">Enter the 6-digit OTP sent to {email}</p>
            <div className="ref-inp-group">
              <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 1H7c-1.1 0-2 .9-2 2v18l7-3 7 3V3c0-1.1-.9-2-2-2zm-1 14.14l-4-1.71-4 1.71V3h8v12.14z" fill="currentColor" />
              </svg>
              <input
                type="text"
                className="ref-inp"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
              />
            </div>
            <button type="submit" className="ref-btn-submit" disabled={isLoading} aria-label={isLoading ? 'Verifying OTP' : 'Verify OTP'}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="ref-btn-secondary"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
                setMessage('');
              }}
            >
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="ref-form">
            <p className="ref-flow-subtitle">Enter your new password</p>
            <div className="ref-inp-group">
              <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2l7 3.46v5.54c0 4.52-2.98 8.69-7 10-4.02-1.31-7-5.48-7-10V6.46L12 3zm0 5c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="currentColor" />
              </svg>
              <input
                type="password"
                className="ref-inp"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="ref-inp-group">
              <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2l7 3.46v5.54c0 4.52-2.98 8.69-7 10-4.02-1.31-7-5.48-7-10V6.46L12 3zm0 5c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="currentColor" />
              </svg>
              <input
                type="password"
                className="ref-inp"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="ref-btn-submit" disabled={isLoading} aria-label={isLoading ? 'Resetting password' : 'Reset Password'}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="ref-btn-secondary"
              onClick={() => {
                setStep(2);
                setNewPassword('');
                setConfirmPassword('');
                setError('');
                setMessage('');
              }}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;