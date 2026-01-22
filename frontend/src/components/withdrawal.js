import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser, faClock, faChartLine, faMoneyBillTransfer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './css/style.css';
import './css/refferrals.css';
const Withdrawal = () => {

  // Array to manage your plans easil
  const milestones = [
  { target: 30, salary: "2,000", current: 0, status: "Locked" },
  { target: 100, salary: "7,000", current: 0, status: "Locked" },
];
  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="plan-header">
          <div className="plan-avatar"><FontAwesomeIcon icon={faMoneyBillTransfer} /></div>
          <div className="plan-user-info">
            <h4 className="plan-username">Withdraw Funds</h4>
            <p className="plan-email">رقم نکالیں</p>
          </div>
          <div className="plan-balance">Balance: <span> 50 </span></div>
        </header>

        <div className="refferrals-section">
          <div className="refferrals-card">
            <h3 className="refferrals-header">Your Referral Link</h3>
            <div className="refferrals-links">
              <p className="refferrals-code">12121</p>
              <button className="refferrals-link-btn">Copy Link</button>
            </div>
            <div className="refferrals-info">
              <div className="refferrals-info-stats">
                <h4 >👨‍👦‍👦 Total Referrals</h4>
                <p >01</p>
              </div><div className="refferrals-info-stats">
                <h4 >🙋🏻‍♂️ Active Referrals</h4>
                <p >01</p>
              </div><div className="refferrals-info-stats">
                <h4 >🤑 Earnings</h4>
                <p >01</p>
              </div>
              <div className="refferrals-info-stats">
                <h4 >💸 Commission Rate</h4>
                <p >01</p>
              </div>
            </div>

          </div>

        </div>

<div className="how-it-works-section">
  <div className="how-it-works-card">
    <div className="how-it-works-header">
      <span className="how-icon">💳</span>
      <h3>Withdrawal Rules / قواعد</h3>
    </div>
    <ul className="how-it-works-list">
      <li>Minimum withdrawal: Rs 500</li>
      <li>
        10% tax will be deducted from all withdrawals
      </li>
      <li>
        Unlock weekly salary bonuses at milestones
      </li>
      <li>
        Weekly salary continues as long as active investors are maintained
      </li>
      {/* <li className="urdu-text">
        دوستوں کو مدعو کریں، 10% کمائیں اور ہفتہ وار تنخواہ حاصل کریں
      </li> */}
    </ul>
  </div>
</div>
          

        {/* Updated Plan Content Section */}

        {/* Bottom Navigation Section */}
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

export default Withdrawal;