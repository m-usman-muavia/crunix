import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser,faClock } from '@fortawesome/free-solid-svg-icons';
import '../css/dashboard.css';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/profile.css';
import API_BASE_URL from '../../config/api';

const CheckDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processing, setProcessing] = useState(null);
  const [filters, setFilters] = useState({
    all: false,
    pending: true,
    accepted: false,
    rejected: false
  });

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/deposits/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deposits');
      }

      const data = await response.json();
      setDeposits(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleApprove = async (depositId) => {
    if (!window.confirm('Approve this deposit?')) return;

    setProcessing(depositId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/deposits/approve/${depositId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve deposit');
      }

      setSuccessMessage('Deposit approved successfully!');
      fetchDeposits();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (depositId) => {
    if (!window.confirm('Reject this deposit?')) return;

    setProcessing(depositId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/deposits/reject/${depositId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject deposit');
      }

      setSuccessMessage('Deposit rejected');
      fetchDeposits();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#FFA500';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#666';
    }
  };

  const handleFilterChange = (filterName) => {
    if (filterName === 'all') {
      setFilters({
        all: !filters.all,
        pending: !filters.all,
        accepted: !filters.all,
        rejected: !filters.all
      });
    } else {
      const newFilters = { ...filters, [filterName]: !filters[filterName] };
      newFilters.all = newFilters.pending && newFilters.accepted && newFilters.rejected;
      setFilters(newFilters);
    }
  };

  const getFilteredDeposits = () => {
    return deposits.filter(deposit => {
      if (filters.all) return true;
      if (filters.pending && deposit.status === 'pending') return true;
      if (filters.accepted && deposit.status === 'approved') return true;
      if (filters.rejected && deposit.status === 'rejected') return true;
      return false;
    });
  };

  if (loading) {
    return (
      <div className="main-wrapper">
        <div className="main-container">
          <header className="dashboard-header">
            <div className="dashboard-user-info">
              <h4 className="dashboard-greeting">Loading</h4>
              <p className="dashboard-name">Deposit Requests</p>
            </div>
          </header>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Loading deposits...</h2>
          </div>
          <nav className="bottom-nav">
                    <div className="nav-item">
                      <Link to="/admin/" className="link-bold nav-link-col">
                        <FontAwesomeIcon icon={faHouse} />
                        <span>Dashboard</span>
                      </Link>
                    </div>
                    <div className="nav-item">
                      <Link to="/admin/addplans" className="link-bold nav-link-col">
                        <FontAwesomeIcon icon={faBox} />
                        <span>Add Plans</span>
                      </Link>
                    </div>
                    <div className="nav-item">
                      <Link to="/admin/users" className="link-bold nav-link-col">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>Users</span>
                      </Link>
                    </div>
                    <div className="nav-item">
                      <Link to="/admin/accounts" className="link-bold nav-link-col">
                        <FontAwesomeIcon icon={faUser} />
                        <span>Accounts</span>
                      </Link>
                    </div>
                    <div className="nav-item">
                      <Link to="/check-deposits" className="link-bold nav-link-col">
                        <FontAwesomeIcon icon={faArrowDown} />
                        <span>Deposits</span>
                      </Link>
                    </div>
                  </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="dashboard-header">
          <div className="dashboard-user-info">
            <h4 className="dashboard-greeting">Pending</h4>
            <p className="dashboard-name">Deposit Requests</p>
          </div>
        </header>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{successMessage}</p>}

        {/* Filter Checkboxes */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Filter by Status:</p>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filters.all}
                onChange={() => handleFilterChange('all')}
                style={{ cursor: 'pointer' }}
              />
              <span>All</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filters.pending}
                onChange={() => handleFilterChange('pending')}
                style={{ cursor: 'pointer' }}
              />
              <span>Pending</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filters.accepted}
                onChange={() => handleFilterChange('accepted')}
                style={{ cursor: 'pointer' }}
              />
              <span>Accepted</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filters.rejected}
                onChange={() => handleFilterChange('rejected')}
                style={{ cursor: 'pointer' }}
              />
              <span>Rejected</span>
            </label>
          </div>
        </div>

        {deposits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>No deposits to review</p>
          </div>
        ) : (
          <div style={{ marginBottom: '80px' }}>
            {getFilteredDeposits().map((deposit) => (
              <div key={deposit._id} style={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>User: {deposit.userId?.name || 'Unknown'}</h3>
                  <span style={{
                    backgroundColor: getStatusColor(deposit.status),
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textTransform: 'capitalize'
                  }}>
                    {deposit.status}
                  </span>
                </div>

                <div style={{ fontSize: '14px', marginBottom: '10px' }}>
                  <p><strong>Email:</strong> {deposit.userId?.email || 'N/A'}</p>
                  <p><strong>Amount:</strong> $ {deposit.deposit_amount}</p>
                  <p><strong>Mobile:</strong> {deposit.sender_mobile}</p>
                  <p><strong>Transaction ID:</strong> {deposit.transaction_id}</p>
                  <p><strong>Date:</strong> {new Date(deposit.created_at).toLocaleString()}</p>
                </div>

                {deposit.screenshot_path && (
                  <div style={{ marginBottom: '10px' }}>
                    <p><strong>Screenshot:</strong></p>
                    <img 
                      src={`${API_BASE_URL}/${deposit.screenshot_path}`} 
                      alt="deposit screenshot" 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                    />
                  </div>
                )}

                {deposit.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleApprove(deposit._id)}
                      disabled={processing === deposit._id}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: processing === deposit._id ? 'not-allowed' : 'pointer',
                        opacity: processing === deposit._id ? 0.6 : 1
                      }}
                    >
                      <FontAwesomeIcon icon={faCheck} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(deposit._id)}
                      disabled={processing === deposit._id}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: processing === deposit._id ? 'not-allowed' : 'pointer',
                        opacity: processing === deposit._id ? 0.6 : 1
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
                          <div className="nav-item">
                            <Link to="/admin/" className="link-bold nav-link-col">
                              <FontAwesomeIcon icon={faHouse} />
                              <span>Dashboard</span>
                            </Link>
                          </div>
                          <div className="nav-item">
                            <Link to="/admin/addplans" className="link-bold nav-link-col">
                              <FontAwesomeIcon icon={faBox} />
                              <span>Add Plans</span>
                            </Link>
                          </div>
                          
                          <div className="nav-item">
                            <Link to="/admin/users" className="link-bold nav-link-col">
                              <FontAwesomeIcon icon={faUsers} />
                              <span>Users</span>
                            </Link>
                          </div>
                          <div className="nav-item">
                            <Link to="/admin/accrual-history" className="link-bold nav-link-col">
                              <FontAwesomeIcon icon={faClock} />
                              <span>Accruals</span>
                            </Link>
                          </div>
                          
                          <div className="nav-item">
                            
                          </div>
                        </nav>
      </div>
    </div>
  );
};

export default CheckDeposits;
