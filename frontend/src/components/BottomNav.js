import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faPaperPlane, faInbox } from '@fortawesome/free-solid-svg-icons';
import './css/BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="modern-bottom-nav">
      <Link 
        to="/dashboard" 
        className={`nav-item-modern nav-icon-only ${isActive('/dashboard') ? 'active' : ''}`}
        aria-label="Home"
      >
        <FontAwesomeIcon icon={faHouse} />
      </Link>

      <Link 
        to="/plans" 
        className={`nav-item-modern nav-icon-only ${isActive('/plans') ? 'active' : ''}`}
        aria-label="Plan"
      >
        <FontAwesomeIcon icon={faBox} />
      </Link>

      <Link 
        to="/deposit" 
        className={`nav-item-modern nav-icon-only ${isActive('/deposit') ? 'active' : ''}`}
        aria-label="Send"
      >
        <FontAwesomeIcon icon={faPaperPlane} />
      </Link>

      <Link 
        to="/withdrawalhistory" 
        className={`nav-item-modern nav-icon-only ${isActive('/withdrawalhistory') ? 'active' : ''}`}
        aria-label="Received"
      >
        <FontAwesomeIcon icon={faInbox} />
      </Link>
    </nav>
  );
};

export default BottomNav;
