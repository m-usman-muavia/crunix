import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faArrowDown, faArrowUp, faUser,faClock,faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/refferrals.css';
import API_BASE_URL from '../../config/api';

const CheckUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/users`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return `Rs ${amount.toLocaleString()}`;
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        <header className="plan-header">
          <div className="plan-avatar"><FontAwesomeIcon icon={faUser} /></div>
          <div className="plan-user-info">
            <h4 className="plan-username">Users & Referrals</h4>
            <p className="plan-email">Overview of users, plans, and referrals</p>
          </div>
          <div className="plan-balance">Users: <span>{users.length}</span></div>
        </header>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Loading users...</h3>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>No users found</p>
          </div>
        ) : (
          <div className="user-cards-wrapper">
            {users.map((user) => (
              <div key={user.id} className="user-stats-card">
                <div className="user-card-head">
                  <div>
                    <h3 className="user-card-name">{user.name}</h3>
                    <p className="user-card-email">{user.email}</p>
                  </div>
                  <div className="user-chip">Total referrals: {user.totalReferrals || 0}</div>
                </div>

                <div className="user-card-grid">
                  <div className="user-card-row">
                    <div className="user-stat">
                      <span className="user-stat-label">Username</span>
                      <span className="user-stat-value">{user.name}</span>
                    </div>
                    <div className="user-stat">
                      <span className="user-stat-label">Email</span>
                      <span className="user-stat-value">{user.email}</span>
                    </div>
                    <div className="user-stat">
                      <span className="user-stat-label">Ref code</span>
                      <span className="user-stat-value text-purple">{user.referralCode || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="user-card-row">
                    <div className="user-stat">
                      <span className="user-stat-label">Ref by</span>
                      <span className="user-stat-value">{user.referredByName || user.referredByCode || '—'}</span>
                    </div>
                    <div className="user-stat">
                      <span className="user-stat-label">Ref names</span>
                      <div className="user-referral-names">
                        {user.referralNames && user.referralNames.length > 0 ? (
                          user.referralNames.map((name, idx) => (
                            <span key={`${user.id}-ref-${idx}`} className="user-referral-chip">{name}</span>
                          ))
                        ) : (
                          <span className="user-referral-empty">No referrals yet</span>
                        )}
                      </div>
                    </div>
                    <div className="user-stat">
                      <span className="user-stat-label">Active refs</span>
                      <span className="user-stat-value text-green">{user.activeReferrals || 0}</span>
                    </div>
                  </div>

                  <div className="user-card-row">
                    <div className="user-stat">
                      <span className="user-stat-label">Active plans</span>
                      <span className="user-stat-value">{user.activePlans || 0}</span>
                    </div>
                    <div className="user-stat">
                      <span className="user-stat-label">Balance</span>
                      <span className="user-stat-value">{formatCurrency(user.balance)}</span>
                    </div>
                    <div className="user-stat">
                      <span className="user-stat-label">Ref balance</span>
                      <span className="user-stat-value text-purple">{formatCurrency(user.referralBalance)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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

export default CheckUser;