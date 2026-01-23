import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import './css/dashboard.css';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/profile.css';
import API_BASE_URL from '../config/api';

const Dashboard = () => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      setBalance(data.main_balance || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(0);
    }
  };

  return (
    <div className="main-wrapper">
          <div className="main-container">
            {/* Top Header Section */}
            <header className="dashboard-header">
              <div className="dashboard-user-info">
                <h4 className="dashboard-greeting">HI</h4>
                <p className="dashboard-name">MUHAMMAD USMAN</p>
              </div>
              <div className="dashboard-balance">
                Balance: Rs {balance.toFixed(2)}
              </div>
              <div className=''>
              <Link to="/plans" className="link-bold dashboard-whatsapp">
                                        
                                          <FontAwesomeIcon icon={faWhatsapp} />
                                        </Link>
              </div>
              
            </header>
    

            
    
            {/* Quick Action Buttons */}
            <div className="action-buttons">
              <button className="action-btn deposit">
                <span className="btn-icon">⬇️</span>
                Deposit
              </button>
              <button className="action-btn withdraw">
                <span className="btn-icon">⬆️</span>
                Withdraw
              </button>
              <button className="action-btn buy-plan">
                <span className="btn-icon">📦</span>
                Buy Plan
              </button>
            </div><div className="action-buttons">
              <button className="action-btn deposit">
                <span className="btn-icon">⬇️</span>
                Deposit
              </button>
              <button className="action-btn withdraw">
                <span className="btn-icon">⬆️</span>
                Withdraw
              </button>
              <button className="action-btn buy-plan">
                <span className="btn-icon">📦</span>
                Buy Plan
              </button>
            </div><div className="action-buttons">
              <button className="action-btn deposit">
                <span className="btn-icon">⬇️</span>
                Deposit
              </button>
              <button className="action-btn withdraw">
                <span className="btn-icon">⬆️</span>
                Withdraw
              </button>
              <button className="action-btn buy-plan">
                <span className="btn-icon">📦</span>
                Buy Plan
              </button>
            </div><div className="action-buttons">
              <button className="action-btn deposit">
                <span className="btn-icon">⬇️</span>
                Deposit
              </button>
              <button className="action-btn withdraw">
                <span className="btn-icon">⬆️</span>
                Withdraw
              </button>
              <button className="action-btn buy-plan">
                <span className="btn-icon">📦</span>
                Buy Plan
              </button>
            </div>
       <div className="action-buttons">
              <button className="action-btn deposit">
                <span className="btn-icon">⬇️</span>
                Deposit
              </button>
              <button className="action-btn withdraw">
                <span className="btn-icon">⬆️</span>
                Withdraw
              </button>
              <button className="action-btn buy-plan">
                <span className="btn-icon">📦</span>
                Buy Plan
              </button>
            </div>
    
            {/* Overview Section */}
           
            {/* Bottom Navigation */}
            <nav className="bottom-nav">
              <div className="nav-item">
                <Link to="/dashboard" className="link-bold nav-link-col">
                  <FontAwesomeIcon icon={faHouse} />
                  <span>Dashboard</span>
                </Link>
              </div>
              <div className="nav-item">
                <Link to="/plans" className="link-bold nav-link-col">
                  <FontAwesomeIcon icon={faBox} />
                  <span>Plans</span>
                </Link>
              </div>
              <div className="nav-item">
                <Link to="/deposit" className="link-bold nav-link-col">
                  <FontAwesomeIcon icon={faArrowDown} />
                  <span>Deposit</span>
                </Link>
              </div>
              <div className="nav-item">
                <Link to="/withdrawal" className="link-bold nav-link-col">
                  <FontAwesomeIcon icon={faArrowUp} />
                  <span>Withdraw</span>
                </Link>
              </div>
              <div className="nav-item">
                <Link to="/refferrals" className="link-bold nav-link-col">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>Referral</span>
                </Link>
              </div>
              <div className="nav-item">
                <Link to="/profile" className="link-bold nav-link-col">
                  <FontAwesomeIcon icon={faUser} />
                  <span>Profile</span>
                </Link>
              </div>
            </nav>
    
          </div>
        </div>
  );
};

export default Dashboard;