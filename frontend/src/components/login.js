import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './logo';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/login.css';
import './css/style.css';
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
    <div className="login-page">
      <div className="login-gradient-wrapper">
        
          <div className="login-brand">
            <Logo />
          </div>

          <div className="login-card">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Enter your details below</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-field">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-field password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="auth-links-row">
            <Link to="/forgotpassword" className="forgot-link">Forgot password?</Link>
            <span className="links-separator">•</span>
            <Link to="/registration" className="signup-link">Don't have an account? <span>Sign up</span></Link>
          </div>

          </div>
  
      </div>
    </div>
  );
};

export default Login;