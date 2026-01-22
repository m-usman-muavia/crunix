import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import '../css/dashboard.css';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/profile.css';
const Dashboard = () => {


  return (
    <div className="main-wrapper">
          <div className="main-container">
            {/* Top Header Section */}
            <header className="dashboard-header">
              <div className="dashboard-user-info">
                <h4 className="dashboard-greeting">HI</h4>
                <p className="dashboard-name">Admin</p>
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
                <Link to="/admin/" className="link-bold nav-link-col">
                  <FontAwesomeIcon icon={faHouse} />
                  <span>Dashboard</span>
                </Link>
              </div>
              <div className="nav-item">
                <Link to="/admin/addplans" className="link-bold nav-link-col">
                  <FontAwesomeIcon icon={faBox} />
                  <span>Add Plans</span>
                </Link>
              </div>
              <div className="nav-item">
                <Link to="/admin/accounts" className="link-bold nav-link-col">
                  <FontAwesomeIcon icon={faUser} />
                  <span>account</span>
                </Link>
              </div>
            </nav>
    
          </div>
        </div>
  );
};

export default Dashboard;