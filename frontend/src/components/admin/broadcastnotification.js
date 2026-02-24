import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import '../css/style.css';
import '../css/refferrals.css';

const BroadcastNotification = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recipients, setRecipients] = useState(0);

  const parseJsonSafe = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { message: text || 'Unexpected response' };
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = message.trim();
    if (!trimmed) {
      setError('Please write a notification message.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/admin/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          message: trimmed
        })
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send notification');
      }

      setRecipients(Number(data.recipients || 0));
      setSuccess(data.message || 'Notification sent.');
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="main-container" style={{ paddingBottom: 20 }}>
        <div className="deposit-header">Broadcast Notification</div>

        <div className="addplans-section">
          <div className="addplans-card">
            <h3 className="addplans-header">Send to All Users (A to Z)</h3>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && (
              <p style={{ color: 'green' }}>
                {success} {recipients > 0 ? `Recipients: ${recipients}` : ''}
              </p>
            )}

            <form className="addplans-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Notification Message</label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={6}
                  placeholder="Write custom notification for all users"
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    padding: 12,
                    fontSize: 15,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button type="submit" className="addplan-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </form>
          </div>
        </div>

        <div style={{ padding: '0 16px 16px 16px' }}>
          <Link to="/admin/" style={{ textDecoration: 'none', color: '#0055a4', fontWeight: 700 }}>
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BroadcastNotification;
