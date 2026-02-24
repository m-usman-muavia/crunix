import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './css/dashboard.css';
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

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Header */}
        <div className="deposit-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '14px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', flex: 1 }}>Notifications</h1>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '15px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f9f9f9'
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              border: filter === 'all' ? '2px solid #0055A4' : '1px solid #ddd',
              borderRadius: '20px',
              background: filter === 'all' ? '#e3f2fd' : 'white',
              color: filter === 'all' ? '#0055A4' : '#666',
              cursor: 'pointer',
              fontWeight: filter === 'all' ? 'bold' : 'normal',
              transition: 'all 0.3s ease'
            }}
            className="filter-btn"
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={{
              padding: '8px 16px',
              border: filter === 'unread' ? '2px solid #0055A4' : '1px solid #ddd',
              borderRadius: '20px',
              background: filter === 'unread' ? '#e3f2fd' : 'white',
              color: filter === 'unread' ? '#0055A4' : '#666',
              cursor: 'pointer',
              fontWeight: filter === 'unread' ? 'bold' : 'normal',
              transition: 'all 0.3s ease'
            }}
            className="filter-btn"
          >
            Unread ({notifications.filter(n => !n.is_read && !n.read).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            style={{
              padding: '8px 16px',
              border: filter === 'read' ? '2px solid #0055A4' : '1px solid #ddd',
              borderRadius: '20px',
              background: filter === 'read' ? '#e3f2fd' : 'white',
              color: filter === 'read' ? '#0055A4' : '#666',
              cursor: 'pointer',
              fontWeight: filter === 'read' ? 'bold' : 'normal',
              transition: 'all 0.3s ease'
            }}
            className="filter-btn"
          >
            Read ({notifications.filter(n => n.is_read || n.read).length})
          </button>
        </div>

        {/* Content */}
        <div className="notification-content" style={{ padding: '15px', minHeight: '300px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#d32f2f',
              backgroundColor: '#ffebee',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <p>Error: {error}</p>
              <button
                onClick={fetchNotifications}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Retry
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <FontAwesomeIcon icon={faBell} style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.3 }} />
              <p style={{ fontSize: '16px', marginBottom: '5px' }}>No notifications</p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                {filter === 'all' ? 'You are all caught up!' : `No ${filter} notifications`}
              </p>
            </div>
          ) : (
            <div>
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
                    style={{
                      padding: '15px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: isUnread ? 1 : 0.9,
                      position: 'relative'
                    }}
                    className="notification-card"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(15, 23, 42, 0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 26px rgba(15, 23, 42, 0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Unread Indicator */}
                   
                    {/* Notification Title/Type */}
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#0055A4',
                      marginBottom: '8px',
                      textTransform: 'capitalize',
                      letterSpacing: '0.5px',
                      opacity: 0.85
                    }}>
                      {notif.type || notif.notification_type || 'Notification'}
                    </div>

                    {/* Notification Message */}
                    <div style={{
                      fontSize: '15px',
                      color: '#0f172a',
                      marginBottom: '10px',
                      lineHeight: '1.6',
                      paddingRight: '25px',
                      fontWeight: '500'
                    }}>
                      {notif.message || notif.title || 'No message provided'}
                    </div>

                    {/* Additional Details */}
                    {(notif.amount || notif.reference_id) && (
                      <div style={{
                        display: 'flex',
                        gap: '20px',
                        fontSize: '13px',
                        color: '#475569',
                        borderTop: '1px solid rgba(15, 23, 42, 0.06)',
                        paddingTop: '5px',
                        marginTop: '8px'
                      }}>
                       
                        {notif.reference_id && (
                          <div>
                            <strong>Ref:</strong> {notif.reference_id}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      marginTop: '10px',
                      opacity: 0.8
                    }}>
                      {formatDate(notif.createdAt || notif.date)}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: isUnread ? '10px' : '15px',
                        background: 'none',
                        border: 'none',
                        color: '#cbd5e1',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '0',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#e11d48'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
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

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default Notifications;
