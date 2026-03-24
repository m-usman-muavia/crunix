import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import './css/plans.css';
import './css/style.css';
import './css/notifications.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, read, unread
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = localStorage.getItem('authToken');

      if (!authToken) {
        setError('Authentication required');
        setLoading(false);
        navigate('/');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      const notifs = Array.isArray(data) ? data : (data.data || data.notifications || []);
      
      // Sort by date descending
      notifs.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setNotifications(notifs);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(notifs =>
          notifs.map(notif =>
            notif._id === notificationId ? { ...notif, read: true, is_read: true } : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(notifs => notifs.filter(n => n._id !== notificationId));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'read':
        return notifications.filter(n => n.is_read || n.read);
      case 'unread':
        return notifications.filter(n => !n.is_read && !n.read);
      default:
        return notifications;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
      case 'payment':
        return '#e3f2fd';
      case 'withdrawal':
        return '#fce4ec';
      case 'bonus':
      case 'reward':
        return '#f3e5f5';
      case 'alert':
      case 'warning':
        return '#fff3e0';
      case 'success':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
    }
  };

  const getNotificationBorderColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
      case 'payment':
        return '#1976d2';
      case 'withdrawal':
        return '#c2185b';
      case 'bonus':
      case 'reward':
        return '#7b1fa2';
      case 'alert':
      case 'warning':
        return '#f57c00';
      case 'success':
        return '#388e3c';
      default:
        return '#9e9e9e';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.is_read && !n.read).length;
  const readCount = notifications.filter(n => n.is_read || n.read).length;

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">
        <div className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Inbox</p>
              <h1 className="dashboard-modern-title">Notifications</h1>
            </div>
            <div className="dashboard-header-actions">
            
            </div>
          </div>
        </div>

        <div className="notifications-filter-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          >
            Read ({readCount})
          </button>
        </div>

        <div className="notification-content">
          {loading ? (
            <div className="notifications-state loading-state">
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="error-banner">
              <p>Error: {error}</p>
              <button onClick={fetchNotifications}>
                Retry
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faEnvelopeOpenText} className="empty-state-icon" />
              <p className="empty-state-title">No notifications</p>
              <p className="empty-state-subtitle">
                {filter === 'all' ? 'You are all caught up!' : `No ${filter} notifications`}
              </p>
            </div>
          ) : (
            <div className="notifications-list-wrap">
              {filteredNotifications.map((notif) => {
                const isUnread = !notif.is_read && !notif.read;
                const bgColor = getNotificationBgColor(notif.type || notif.notification_type);
                const borderColor = getNotificationBorderColor(notif.type || notif.notification_type);
                
                return (
                  <div
                    key={notif._id}
                    onClick={() => {
                      if (isUnread) {
                        markAsRead(notif._id);
                      }
                    }}
                    style={{ '--notif-border': borderColor, '--notif-bg': bgColor }}
                    className={`notification-card ${isUnread ? 'unread' : 'read'}`}
                  >
                    {isUnread && <span className="unread-dot" aria-hidden="true" />}

                    <div className="notification-type">
                      {notif.type || notif.notification_type || 'Notification'}
                    </div>

                    <div className="notification-message">
                      {notif.message || notif.title || 'No message provided'}
                    </div>

                    {(notif.amount || notif.reference_id) && (
                      <div className="notification-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {notif.amount && (
                          <div >
                            <strong>Amount: </strong> AED {Number(notif.amount).toFixed(2)}
                          </div>
                        )}
                        {notif.reference_id && (
                          <div>
                            <strong>Ref:</strong> {notif.reference_id}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="notification-timestamp">
                      {formatDate(notif.createdAt || notif.date)}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="notification-delete-btn"
                      title="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Notifications;
