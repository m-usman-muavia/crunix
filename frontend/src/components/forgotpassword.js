import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './logo';
import './css/login.css';
import './css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

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
      const response = await fetch('/api/auth/forgot-password', {
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
      const response = await fetch('/api/auth/verify-forgot-otp', {
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
      const response = await fetch('/api/auth/reset-password', {
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
    <div className="main-wrapper">
      <div className="login-container">
        <div className="login-card">
          <Link to="/" className="back-link">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to sign in
          </Link>
          <Logo />  
          <h1 className="title">Forgot Password</h1>
                      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}


          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="login-form">
              <p className="subtitle">Enter your email to receive an OTP</p>
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <span className="icon">✉</span>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="sign-in-btn" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="login-form">
              <p className="subtitle" style={{ textAlign: 'center' }}>Enter the 6-digit OTP sent to {email}</p>
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
                  />
                </div>
              </div>
              <button type="submit" className="sign-in-btn" disabled={isLoading}>
                {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
              </button>
              <button 
                type="button" 
                className="back-btn"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                }}
              >
                Back
              </button>
            </form>
          )}

          {/* Step 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="login-form">
              <p className="subtitle">Enter your new password</p>
              <div className="input-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <span className="icon">🔒</span>
                  <input 
                    type="password" 
                    placeholder="At least 6 characters" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <span className="icon">🔒</span>
                  <input 
                    type="password" 
                    placeholder="Confirm your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="sign-in-btn" disabled={isLoading}>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
              <button 
                type="button" 
                className="back-btn"
                onClick={() => {
                  setStep(2);
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;