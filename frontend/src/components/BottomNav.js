import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faDollarSign, faClock, faUser } from '@fortawesome/free-solid-svg-icons';
import './css/BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="modern-bottom-nav">
      <Link 
        to="/dashboard" 
        className={`nav-item-modern ${isActive('/dashboard') ? 'active' : ''}`}
      >
        <FontAwesomeIcon icon={faHouse} />
        <span>Home</span>
      </Link>

      <Link 
        to="/plans" 
        className={`nav-item-modern ${isActive('/plans') ? 'active' : ''}`}
      >
        <FontAwesomeIcon icon={faBox} />
        <span>Plan</span>
      </Link>

      <Link 
        to="/deposit" 
        className="nav-item-center"
      >
        <div className="center-icon-wrapper">
          <FontAwesomeIcon icon={faDollarSign} />
        </div>
        <span>Deposit</span>
      </Link>

      <Link 
        to="/withdrawal" 
        className={`nav-item-modern ${isActive('/withdrawal') ? 'active' : ''}`}
      >
        <FontAwesomeIcon icon={faClock} />
        <span>Withdraw</span>
      </Link>

      <Link 
        to="/profile" 
        className={`nav-item-modern ${isActive('/profile') ? 'active' : ''}`}
      >
        <FontAwesomeIcon icon={faUser} />
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
