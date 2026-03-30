import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser, faClock, faImage, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import '../css/dashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import '../css/style.css';
import '../css/profile.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin-login');
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="dashboard-header">
          <div className="dashboard-user-info">
            <h4 className="dashboard-greeting">HI</h4>
            <p className="dashboard-name">Admin</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/plans" className="link-bold dashboard-whatsapp">
              <FontAwesomeIcon icon={faWhatsapp} />
            </Link>
            <button
              onClick={handleLogout}
              className="link-bold dashboard-whatsapp"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: 'inherit'
              }}
              title="Logout from Admin"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </header>

        {/* Quick Action Buttons */}
        <div className="action-buttons">
          <Link to="/admin/addplans" className="action-btn deposit" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="btn-icon">⬇️</span>
            add plans
          </Link>
          <Link to="/check-deposits" className="action-btn deposit" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="btn-icon">⬇️</span>
            Check Deposits
          </Link>
          <Link to="/check-withdrawals" className="action-btn withdraw" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="btn-icon">⬆️</span>
            Check Withdrawals
          </Link>
          <Link to="/admin/accrual-history" className="action-btn buy-plan" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="btn-icon">⏱️</span>
            Accrual History
          </Link>
          <Link to="/admin/accounts" className="action-btn buy-plan" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="btn-icon">⏱️</span>
            Accounts
          </Link>
          <Link to="/admin/bonus" className="action-btn buy-plan" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="btn-icon">⏱️</span>
            bonus
          </Link>
          <Link to="/admin/dashboard-image" className="action-btn buy-plan" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="btn-icon"><FontAwesomeIcon icon={faImage} /></span>
            dashboard image
          </Link>
          <Link to="/admin/crx" className="action-btn buy-plan" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="btn-icon">📈</span>
            CRX Price
          </Link>
          <Link to="/admin/notifications" className="action-btn buy-plan" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="btn-icon">🔔</span>
            Notifications
          </Link>
        </div>

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
                    <Link to="/admin/users" className="link-bold nav-link-col">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>Users</span>
                    </Link>
                  </div>
                  <div className="nav-item">
                    <Link to="/admin/accrual-history" className="link-bold nav-link-col">
                      <FontAwesomeIcon icon={faClock} />
                      <span>Accruals</span>
                    </Link>
                  </div>
                  
                  <div className="nav-item">
                    
                  </div>
                </nav>
      </div>
    </div>
  );
};

export default Dashboard;