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

        <div className="ref-divider">Or</div>

        <div className="ref-socials">
          <button type="button" className="ref-social-btn" aria-label="Login with Google">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          <button type="button" className="ref-social-btn" aria-label="Login with Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
            </svg>
          </button>
          <button type="button" className="ref-social-btn" aria-label="Login with Twitter">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 9-0.75 11-4.5a4.5 4.5 0 00-8-1-4.5 4.5 0 014.3-7z" fill="#1DA1F2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;