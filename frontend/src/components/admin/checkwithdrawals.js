import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser ,faClock} from '@fortawesome/free-solid-svg-icons';
import '../css/dashboard.css';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/profile.css';
import API_BASE_URL from '../../config/api';

const CheckWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
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
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/withdrawals/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }

      const data = await response.json();
      setWithdrawals(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    if (!window.confirm('Approve this withdrawal?')) return;

    setProcessing(withdrawalId);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/withdrawals/approve/${withdrawalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to approve withdrawal';
        try {
          const errorData = await response.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
        }
        throw new Error(errorMessage);
      }

      setSuccessMessage('Withdrawal approved successfully!');
      fetchWithdrawals();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (withdrawalId) => {
    if (!window.confirm('Reject this withdrawal?')) return;

    setProcessing(withdrawalId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/withdrawals/reject/${withdrawalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject withdrawal');
      }

      setSuccessMessage('Withdrawal rejected');
      fetchWithdrawals();
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
      case 'paid': return '#007bff';
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

  const getFilteredWithdrawals = () => {
    return withdrawals.filter(withdrawal => {
      if (filters.all) return true;
      if (filters.pending && withdrawal.status === 'pending') return true;
      if (filters.accepted && withdrawal.status === 'approved') return true;
      if (filters.rejected && withdrawal.status === 'rejected') return true;
      return false;
    });
  };

  const getMethodDisplay = (method) => {
    const methodMap = {
      'jazzcash': 'JazzCash',
      'easypaisa': 'EasyPaisa',
      'hbl': 'HBL'
    };
    return methodMap[method] || method;
  };

  if (loading) {
    return (
      <div className="main-wrapper">
        <div className="main-container">
          <header className="dashboard-header">
            <div className="dashboard-user-info">
              <h4 className="dashboard-greeting">Loading</h4>
              <p className="dashboard-name">Withdrawal Requests</p>
            </div>
          </header>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Loading withdrawals...</h2>
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
              <Link to="/admin/accounts" className="link-bold nav-link-col">
                <FontAwesomeIcon icon={faUser} />
                <span>Accounts</span>
              </Link>
            </div>
            <div className="nav-item">
              <Link to="/admin/users" className="link-bold nav-link-col">
                <FontAwesomeIcon icon={faUsers} />
                <span>Users</span>
              </Link>
            </div>
            <div className="nav-item">
              <Link to="/check-withdrawals" className="link-bold nav-link-col">
                <FontAwesomeIcon icon={faArrowUp} />
                <span>Withdrawals</span>
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
            <p className="dashboard-name">Withdrawal Requests</p>
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

        {withdrawals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>No withdrawals to review</p>
          </div>
        ) : (
          <div style={{ marginBottom: '80px' }}>
            {getFilteredWithdrawals().map((withdrawal) => (
              <div key={withdrawal._id} style={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>User: {withdrawal.userId?.name || 'Unknown'}</h3>
                  <span style={{
                    backgroundColor: getStatusColor(withdrawal.status),
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textTransform: 'capitalize'
                  }}>
                    {withdrawal.status}
                  </span>
                </div>

                <div style={{ fontSize: '14px', marginBottom: '10px' }}>
                  <p><strong>Email:</strong> {withdrawal.userId?.email || 'N/A'}</p>
                  <p><strong>Amount:</strong> $ {withdrawal.amount}</p>
                  <p><strong>Withdrawal Method:</strong> {getMethodDisplay(withdrawal.method)}</p>
                  <p><strong>Account Number:</strong> {withdrawal.account_number}</p>
                  <p><strong>Mobile Number:</strong> {withdrawal.mobile_number}</p>
                  <p><strong>Date:</strong> {new Date(withdrawal.created_at).toLocaleString()}</p>
                  {withdrawal.approved_at && (
                    <p><strong>Approved At:</strong> {new Date(withdrawal.approved_at).toLocaleString()}</p>
                  )}
                </div>

                {withdrawal.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleApprove(withdrawal._id)}
                      disabled={processing === withdrawal._id}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: processing === withdrawal._id ? 'not-allowed' : 'pointer',
                        opacity: processing === withdrawal._id ? 0.6 : 1
                      }}
                    >
                      <FontAwesomeIcon icon={faCheck} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(withdrawal._id)}
                      disabled={processing === withdrawal._id}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: processing === withdrawal._id ? 'not-allowed' : 'pointer',
                        opacity: processing === withdrawal._id ? 0.6 : 1
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
            <Link to="/check-deposits" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faArrowDown} />
              <span>Deposits</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/check-withdrawals" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faArrowUp} />
              <span>Withdrawals</span>
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

export default CheckWithdrawals;
