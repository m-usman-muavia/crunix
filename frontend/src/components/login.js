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
    <div className="main-wrapper">
      <div className="login-container">
        <div className="login-card">
          <Logo />
          
          <h1 className="title">Welcome to PayzoPk Investments</h1>
          <p className="subtitle">Sign in to continue</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
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

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="icon">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}

            <button type="submit" className="sign-in-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="footer-links">
            <Link to="/forgotpassword" className="link-bold">Forgot password?</Link>
            <p>Need an account? <Link to="/registration" className="link-bold">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;