import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
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
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="modal-header">
          <h2>Invest in {plan?.name}</h2>
        </div>

        <div className="modal-body">

          <div className="modal-detail">
            <span className="modal-label"> Investment</span>
            <span className="modal-value text-bold">Rs {plan?.investment_amount}</span>
          </div>

          <div className="modal-detail">
            <span className="modal-label">Daily Income</span>
            <span className="modal-value text-green">Rs {plan?.daily_profit}</span>
          </div>

          <div className="modal-detail">
            <span className="modal-label">Total Return</span>
            <span className="modal-value text-success">Rs {plan?.total_profit}</span>
          </div>
          <div className="modal-detail">
            <span className="modal-label">Your Balance</span>
            <span className="modal-value text-success">Rs {balance}</span>
          </div>
        </div>

        {isInsufficientBalance && (
          <div className="error-message red-text">
            ⚠️ Insufficient balance. You need Rs {(plan?.investment_amount - balance).toFixed(2)} more to invest in this plan.
          </div>
        )}

        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          {!isInsufficientBalance && (
            <button className="modal-btn modal-btn-invest" onClick={handleInvest}>
              Confirm Investment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestModal;
