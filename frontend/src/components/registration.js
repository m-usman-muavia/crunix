import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './css/login.css';
import './css/registration.css';
import API_BASE_URL from '../config/api';

const Registration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1. Create state for form inputs
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    referralCode: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [referralLocked, setReferralLocked] = useState(false);
    // Prefill referral code from URL if present
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      if (code) {
        setFormData((prev) => ({ ...prev, referralCode: code }));
        setReferralLocked(true);
      }
    }, [location.search]);
  const [loading, setLoading] = useState(false);

  // 2. Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }

    setLoading(true);

    try {
      // Send request to your backend
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        referralCode: formData.referralCode,
        password: formData.password
      });

      if (response.status === 200 || response.status === 201) {
        // Redirect to OTP page and pass the email so the OTP page knows who to verify
        navigate('/EmailOTP', { state: { email: formData.email } });
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="ref-page ref-page-register">
      <div className="ref-header login-service-hero">
        <h1 className="ref-header-title">Welcome!</h1>
        <p className="ref-header-desc">Desert Oil Network is a Dubai-based platform generating daily profits based on oil price. </p>
      </div>

      <div className="ref-card">
        <div className="ref-tabs">
          <button className="ref-tab">
            <Link to="/">Login</Link>
          </button>
          <button className="ref-tab ref-tab-active">
            <span>Signup</span>
          </button>
        </div>

        {error && <p className="ref-error">{error}</p>}

        <form className="ref-form" onSubmit={handleSubmit}>
          <div className="ref-inp-group">
            <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" fill="currentColor" />
            </svg>
            <input
              className="ref-inp"
              type="text"
              name="username"
              placeholder="Username"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="ref-inp-group">
            <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor" />
            </svg>
            <input
              className="ref-inp"
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="ref-inp-group">
            <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.75 22 2 13.25 2 2a1 1 0 0 1 1-1h4.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2z" fill="currentColor" />
            </svg>
            <input
              className="ref-inp"
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="ref-inp-group">
            <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
            </svg>
            <input
              className="ref-inp"
              type="text"
              name="referralCode"
              placeholder="Referral Code (optional)"
              value={formData.referralCode}
              onChange={handleChange}
              readOnly={referralLocked}
              disabled={referralLocked}
            />
          </div>

          <div className="ref-inp-group">
            <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2l7 3.46v5.54c0 4.52-2.98 8.69-7 10-4.02-1.31-7-5.48-7-10V6.46L12 3zm0 5c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="currentColor" />
            </svg>
            <input
              className="ref-inp"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <button type="button" className="ref-eye-btn" onClick={() => setShowPassword((p) => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.05 0 9.27 3.12 11 7-1.73 3.88-5.95 7-11 7S2.73 15.88 1 12c1.73-3.88 5.95-7 11-7zm0 2c-3.76 0-7.12 2.05-8.68 5 1.56 2.95 4.92 5 8.68 5s7.12-2.05 8.68-5C19.12 9.05 15.76 7 12 7zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="currentColor" /></svg>
            </button>
          </div>

          <div className="ref-inp-group">
            <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2l7 3.46v5.54c0 4.52-2.98 8.69-7 10-4.02-1.31-7-5.48-7-10V6.46L12 3zm0 5c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="currentColor" />
            </svg>
            <input
              className="ref-inp"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button type="button" className="ref-eye-btn" onClick={() => setShowConfirmPassword((p) => !p)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.05 0 9.27 3.12 11 7-1.73 3.88-5.95 7-11 7S2.73 15.88 1 12c1.73-3.88 5.95-7 11-7zm0 2c-3.76 0-7.12 2.05-8.68 5 1.56 2.95 4.92 5 8.68 5s7.12-2.05 8.68-5C19.12 9.05 15.76 7 12 7zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="currentColor" /></svg>
            </button>
          </div>

          <button type="submit" className="ref-btn-submit" disabled={loading} aria-label={loading ? 'Creating account' : 'Sign up'}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;