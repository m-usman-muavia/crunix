import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import './css/toast.css';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationCircle;
      case 'info':
        return faInfoCircle;
      default:
        return faCheckCircle;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'error':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'info':
        return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      default:
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    }
  };

  return (
    <div
      className="toast-notification"
      style={{
        background: getBackgroundColor(),
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div className="toast-content">
        <FontAwesomeIcon icon={getIcon()} className="toast-icon" />
        <span className="toast-message">{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        aria-label="Close notification"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

export default Toast;
