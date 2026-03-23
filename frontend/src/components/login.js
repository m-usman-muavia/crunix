import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/login.css';
import API_BASE_URL from '../config/api';


const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email,
        password: password
      });

      if (response.status === 200 && response.data.token) {
        // Save token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const message = err.response.data.message || 'Login failed. Please try again.';
        
        if (message.includes('not found') || message.includes('does not exist')) {
          setError('Email does not exist. Please sign up.');
        } else if (message.includes('password') || message.includes('incorrect')) {
          setError('Incorrect password. Please try again.');
        } else if (message.includes('not verified')) {
          setError('Email not verified. Please check your email for verification code.');
        } else {
          setError(message);
        }
      } else {
        setError('Network error. Please check your connection.');
      }
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
          <button className="ref-tab ref-tab-active">
            <span>Login</span>
          </button>
          <button className="ref-tab">
            <Link to="/registration" style={{ textDecoration: 'none', color: 'inherit' }}>Signup</Link>
          </button>
        </div>

        {error && <p className="ref-error">{error}</p>}

        <form className="ref-form" onSubmit={handleSubmit}>
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

          <div className="ref-inp-group">
            <svg className="ref-inp-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2l7 3.46v5.54c0 4.52-2.98 8.69-7 10-4.02-1.31-7-5.48-7-10V6.46L12 3zm0 5c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="currentColor" />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              className="ref-inp"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="ref-eye-btn"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5c5.05 0 9.27 3.12 11 7-1.73 3.88-5.95 7-11 7S2.73 15.88 1 12c1.73-3.88 5.95-7 11-7zm0 2c-3.76 0-7.12 2.05-8.68 5 1.56 2.95 4.92 5 8.68 5s7.12-2.05 8.68-5C19.12 9.05 15.76 7 12 7zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="currentColor" />
              </svg>
            </button>
          </div>

          <div className="ref-row-between">
            <label className="ref-checkbox">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgotpassword" className="ref-forgot-link">Forgot password?</Link>
          </div>

          <button type="submit" className="ref-btn-submit" disabled={loading}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>


        
      </div>
    </div>
  );
};

export default Login;