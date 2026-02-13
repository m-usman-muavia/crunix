import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Added useNavigate, useLocation
import axios from 'axios'; // Import axios
import Logo from './logo';
import './css/login.css';
import './css/style.css';
import API_BASE_URL from '../config/api';

const Registration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1. Create state for form inputs
  const [formData, setFormData] = useState({
    email: '',
    name: '',
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
        email: formData.email,
        name: formData.name,
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
    <div className="login-page">
      <div className="login-gradient-wrapper">

        <div className="login-page-content">

          <div className="login-brand">
            <Logo />
          </div>

          <div className="login-card">
          <h1 className="login-title">Create your account</h1>
          <p className="login-subtitle">Start building your CRUNIX wallet</p>

          {error && <p className="login-error">{error}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-field">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                onChange={handleChange}
              />
            </div>

            <div className="input-field">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                onChange={handleChange}
              />
            </div>

            <div className="input-field">
              <input
                type="text"
                name="referralCode"
                placeholder="Referral Code (Optional)"
                onChange={handleChange}
                value={formData.referralCode}
                readOnly={referralLocked}
                disabled={referralLocked}
              />
            </div>

            <div className="input-field password-field">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 5c5.05 0 9.27 3.12 11 7-1.73 3.88-5.95 7-11 7S2.73 15.88 1 12c1.73-3.88 5.95-7 11-7zm0 2c-3.76 0-7.12 2.05-8.68 5 1.56 2.95 4.92 5 8.68 5s7.12-2.05 8.68-5C19.12 9.05 15.76 7 12 7zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>

            <div className="input-field password-field">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                required
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 5c5.05 0 9.27 3.12 11 7-1.73 3.88-5.95 7-11 7S2.73 15.88 1 12c1.73-3.88 5.95-7 11-7zm0 2c-3.76 0-7.12 2.05-8.68 5 1.56 2.95 4.92 5 8.68 5s7.12-2.05 8.68-5C19.12 9.05 15.76 7 12 7zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Register'}
            </button>
          </form>

           <div className="auth-links-row">
                      <Link to="/" className="signup-link">Already have an account? <span>Sign in</span></Link>
                    </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;