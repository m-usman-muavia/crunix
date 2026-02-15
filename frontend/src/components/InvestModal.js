import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChartLine, faDollarSign, faWallet, faCoins } from '@fortawesome/free-solid-svg-icons';
import './css/modal.css';

const InvestModal = ({ isOpen, onClose, plan, balance, onInvest }) => {
  if (!isOpen) return null;

  const isInsufficientBalance = balance < (plan?.investment_amount || 0);

  const handleInvest = async () => {
    if (isInsufficientBalance) {
      return;
    }
    if (onInvest) {
      await onInvest(plan._id);
    }
    // Close modal after investment completes and state updates
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="modal-header">
          <h2>{plan?.name}</h2>
          <p className="modal-subtitle">Investment Opportunity</p>
        </div>

        <div className="modal-body">
          <div className="investment-highlight">
            <div className="highlight-icon">
              <FontAwesomeIcon icon={faDollarSign} />
            </div>
            <div className="highlight-content">
              <span className="highlight-label">Investment Amount</span>
              <span className="highlight-value">${plan?.investment_amount}</span>
            </div>
          </div>

          <div className="modal-stats">
            <div className="stat-card stat-daily">
              <div className="stat-info">
                <span className="stat-label">Daily Profit</span>
                <span className="stat-value">${plan?.daily_profit}</span>
              </div>
            </div>

            <div className="stat-card stat-total">
              <div className="stat-info">
                <span className="stat-label">Total Return</span>
                <span className="stat-value">${plan?.total_profit}</span>
              </div>
            </div>
          </div>
        </div>

        {isInsufficientBalance && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-text">
              <strong>Insufficient Balance</strong>
              <p>You need ${((plan?.investment_amount || 0) - balance).toFixed(2)} more to invest in this plan.</p>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            <span>Cancel</span>
          </button>
          {!isInsufficientBalance && (
            <button className="modal-btn modal-btn-invest" onClick={handleInvest}>
              <span>Invest Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestModal;
