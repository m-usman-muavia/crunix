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
    <div className="sp-page sp-page-register">
      <div className="sp-card">
        <div className="register logo" style={{textAlign:'center'}}>
      <img src="/Logo5120.png" alt="Crunix" style={{height:'150px', paddingBottom:'10px'}}/>
    </div>
        <form className="sp-form" onSubmit={handleSubmit}>
          <input
            className="sp-inp"
            type="text"
            name="username"
            placeholder="Username"
            required
            value={formData.username}
            onChange={handleChange}
          />
          <input
            className="sp-inp"
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <input
            className="sp-inp"
            type="tel"
            name="phone"
            placeholder="Phone Number"
            required
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            className="sp-inp"
            type="text"
            name="referralCode"
            placeholder="Referral Code (optional)"
            value={formData.referralCode}
            onChange={handleChange}
            readOnly={referralLocked}
            disabled={referralLocked}
          />
          <div className="sp-inp-wrap">
            <input
              className="sp-inp sp-inp-pw"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <button type="button" className="sp-eye-btn" onClick={() => setShowPassword((p) => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.05 0 9.27 3.12 11 7-1.73 3.88-5.95 7-11 7S2.73 15.88 1 12c1.73-3.88 5.95-7 11-7zm0 2c-3.76 0-7.12 2.05-8.68 5 1.56 2.95 4.92 5 8.68 5s7.12-2.05 8.68-5C19.12 9.05 15.76 7 12 7zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="currentColor" /></svg>
            </button>
          </div>
          <div className="sp-inp-wrap">
            <input
              className="sp-inp sp-inp-pw"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button type="button" className="sp-eye-btn" onClick={() => setShowConfirmPassword((p) => !p)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.05 0 9.27 3.12 11 7-1.73 3.88-5.95 7-11 7S2.73 15.88 1 12c1.73-3.88 5.95-7 11-7zm0 2c-3.76 0-7.12 2.05-8.68 5 1.56 2.95 4.92 5 8.68 5s7.12-2.05 8.68-5C19.12 9.05 15.76 7 12 7zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="currentColor" /></svg>
            </button>
          </div>

          {error && <p className="sp-error">{error}</p>}

          <button type="submit" className="sp-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="sp-card-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Registration;