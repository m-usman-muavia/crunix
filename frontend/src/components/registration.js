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

      if (response.status === 200) {
        // Redirect to OTP page and pass the email so the OTP page knows who to verify
        navigate('/EmailOTP', { state: { email: formData.email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="login-container">
        <div className="login-card">
          <Logo />
          <h1 className="title">Create your account</h1>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email<span style={{ color: 'red' }}>*</span></label>
              <div className="input-wrapper">
                <span className="icon">✉</span>
                <input 
                  type="email" 
                  name="email" // Match the state key
                  placeholder="you@example.com" 
                  required 
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Name<span style={{ color: 'red' }}>*</span></label>
              <div className="input-wrapper">
                <span className="icon">👤</span>
                <input 
                  type="text" 
                  name="name"
                  placeholder="John Doe" 
                  required 
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Referral Code (Optional)</label>
              <div className="input-wrapper">
                <span className="icon">👥 </span>
                <input 
                  type="text" 
                  name="referralCode"
                  placeholder="123456" 
                  onChange={handleChange}
                  value={formData.referralCode}
                  readOnly={referralLocked}
                  disabled={referralLocked}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password<span style={{ color: 'red' }}>*</span></label>
              <div className="input-wrapper">
                <span className="icon">🔒</span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  onChange={handleChange}
                />
                <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "👁️" : "🙈"}
                </span>
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password<span style={{ color: 'red' }}>*</span></label>
              <div className="input-wrapper">
                <span className="icon">🔒</span>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  onChange={handleChange}
                />
                <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? "👁️" : "🙈"}
                </span>
              </div>
            </div>

            <button type="submit" className="sign-in-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Register"}
            </button>
          </form>

          <div className="footer-links">
            <p>Already have an account? <Link to="/" className='link-bold'>Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;