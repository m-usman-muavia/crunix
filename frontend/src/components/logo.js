import React from 'react';
import './css/logo.css';
const Logo = () => {
  return (
    <div className="logo-wrapper">
      <div className="logo-container">
        <div className="icon-box">
          {/* Path starts from public folder */}
          <img src="/logo192.png" alt="Payzo Logo" className="logo-img" />
        </div>
        <div className="text-content">
          <div className="logo-text">Pay<span>zo</span></div>
          <div className="logo-tagline">SMART EARNING PLATFORM</div>
        </div>
      </div>
    </div>
  );
};

export default Logo;