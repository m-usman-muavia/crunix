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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('activeusers');

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
    return `$ ${amount.toLocaleString()}`;
  };

  const getFilteredUsers = () => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.referralCode && user.referralCode.toLowerCase().includes(query)) ||
        (user.referredByName && user.referredByName.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (filterType === 'activeusers') {
        if (Array.isArray(user.activePlans)) {
          return user.activePlans.length > 0;
        }
        return Number(user.activePlansCount || user.activePlans || 0) > 0;
      }

      if (filterType === 'activerefferal') {
        if (Array.isArray(user.activeReferralNames)) {
          return user.activeReferralNames.length > 0;
        }
        return Number(user.activeReferrals || 0) > 0;
      }

      return true;
    });
  };

  const filteredUsers = getFilteredUsers();

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

        {/* Search Bar */}
        <div style={{
          marginBottom: '15px',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            placeholder="Search by name, email, or referral code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                padding: '10px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterType === 'all'}
              onChange={() => setFilterType('all')}
            />
            all
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterType === 'activeusers'}
              onChange={() => setFilterType('activeusers')}
            />
            activeusers
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterType === 'activerefferal'}
              onChange={() => setFilterType('activerefferal')}
            />
            activerefferal
          </label>
        </div>

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
            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', width: '100%' }}>
                <p>No users match your search</p>
              </div>
            ) : (
              <>
                <div style={{ width: '100%', fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
                  Showing {filteredUsers.length} of {users.length} users
                </div>
                {filteredUsers.map((user) => (
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
                      <span className="user-stat-label">Active referral names</span>
                      <div className="user-referral-names">
                        {user.activeReferralNames && user.activeReferralNames.length > 0 ? (
                          user.activeReferralNames.map((name, idx) => (
                            <span key={`${user.id}-active-ref-${idx}`} className="user-referral-chip">{name}</span>
                          ))
                        ) : (
                          <span className="user-referral-empty">No active referrals</span>
                        )}
                      </div>
                    </div>
                                       
                  </div>

                  <div className="user-card-row">
                    <div className="user-stat">
                      <span className="user-stat-label">Active plans</span>
                      <div className="user-referral-names">
                        {Array.isArray(user.activePlans) && user.activePlans.length > 0 ? (
                          user.activePlans.map((planName, idx) => (
                            <span key={`${user.id}-active-plan-${idx}`} className="user-referral-chip">{planName}</span>
                          ))
                        ) : (
                          <span className="user-referral-empty">No active plans</span>
                        )}
                      </div>
                    </div>
                    <div className="user-stat">
                      <span className="user-stat-label">Total Deposit</span>
                      <span className="user-stat-value">{formatCurrency(user['totalDeposit'])}</span>
                    </div>
                    <div className="user-stat">
                      <span className="user-stat-label">Total Withdrawal</span>
                      <span className="user-stat-value">{formatCurrency(user['totalWithdrawal'])}</span>
                    </div>
                    
                  </div>
                  <div className="user-card-row">
                    <div className="user-stat">
                      <span className="user-stat-label">Main Balance</span>
                      <span className="user-stat-value">{formatCurrency(user.mainbalance)}</span>
                    </div>
                    <div className="user-stat">
                      <span className="user-stat-label">Ref balance</span>
                      <span className="user-stat-value text-purple">{formatCurrency(user.referralBalance)}</span>
                    </div>
                    <div className="user-stat">
                      <span className="user-stat-label">Bonus balance</span>
                      <span className="user-stat-value text-purple">{formatCurrency(user.bonusBalance)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
              </>
            )}
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