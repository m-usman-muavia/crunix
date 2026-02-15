import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './css/errormodal.css';

const ErrorModal = ({ isOpen, message, onClose, autoClose = true, closeDuration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
    
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, closeDuration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, closeDuration, onClose]);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <div className="error-modal-overlay" onClick={handleClose}>
      <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="error-modal-close" onClick={handleClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="error-modal-header">
          <div className="error-modal-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
            <h2>Error</h2>
        </div>

        <div className="error-modal-body">
          <p className="error-modal-message">{message}</p>
        </div>

        <div className="error-modal-footer">
          <button className="error-modal-btn" onClick={handleClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
