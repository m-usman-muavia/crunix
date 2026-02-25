import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import '../css/style.css';
import '../css/refferrals.css';

const CrxSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [market, setMarket] = useState(null);
  const [stats, setStats] = useState({
    total_crx_purchased: 0,
    total_usd_spent: 0
  });
  const [form, setForm] = useState({
    price: '',
    expected_rise_percent: '',
    note: ''
  });

  const parseJsonSafe = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { message: text || 'Unexpected response' };
    }
  };

  const fetchMarket = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/crx/market`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch CRX market data');
      }

      setMarket(data);
      setForm({
        price: data.current_price || '',
        expected_rise_percent: data.expected_rise_percent || 0,
        note: data.note || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crx/admin/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch CRX stats');
      }

      setStats({
        total_crx_purchased: Number(data.total_crx_purchased || 0),
        total_usd_spent: Number(data.total_usd_spent || 0)
      });
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchMarket();
    fetchAdminStats();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/crx/admin/price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          price: Number(form.price),
          expected_rise_percent: Number(form.expected_rise_percent || 0),
          note: form.note
        })
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update CRX price');
      }

      setSuccess('CRX price updated successfully.');
      await fetchMarket();
      await fetchAdminStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const history = market?.history || [];

  return (
    <div className="main-wrapper">
      <div className="main-container" style={{ paddingBottom: 20 }}>
        <div className="deposit-header">CRX Admin</div>

        <div className="addplans-section" style={{ marginTop: 12 }}>
          <div className="addplans-card">
            <h3 className="addplans-header">CRX Purchase Summary</h3>
            <p style={{ margin: '8px 0' }}>
              Total CRX Purchased by Users: <strong>{Number(stats.total_crx_purchased || 0).toFixed(6)} CRX</strong>
            </p>
          </div>
        </div>

        <div className="addplans-section">
          <div className="addplans-card">
            <h3 className="addplans-header">Update CRX Price</h3>

            {loading && <p>Loading CRX market data...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form className="addplans-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Price of 1 CRX ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  required
                />
              </div>

              <div className="input-group">
                <label>Expected Rise (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.expected_rise_percent}
                  onChange={(event) => setForm((prev) => ({ ...prev, expected_rise_percent: event.target.value }))}
                />
              </div>

              <div className="input-group">
                <label>Admin Note</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="Optional message for users"
                />
              </div>

              <button type="submit" className="addplan-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Update Price'}
              </button>
            </form>
          </div>
        </div>

        <div className="addplans-section" style={{ marginTop: 12 }}>
          <div className="addplans-card">
            <h3 className="addplans-header">Recent CRX Price History</h3>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 4px' }}>Date</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 4px' }}>Price</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 4px' }}>Expected Rise</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice().reverse().map((item) => (
                    <tr key={item._id}>
                      <td style={{ padding: '8px 4px', borderBottom: '1px solid #f2f2f2' }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 4px', borderBottom: '1px solid #f2f2f2' }}>
                        ${Number(item.price || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 4px', borderBottom: '1px solid #f2f2f2' }}>
                        {Number(item.expected_rise_percent || 0).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  {!history.length && (
                    <tr>
                      <td colSpan="3" style={{ padding: '10px 4px' }}>
                        No CRX history yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

export default CrxSettings;
