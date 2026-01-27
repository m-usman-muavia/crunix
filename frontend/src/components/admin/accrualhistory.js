import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faArrowDown, faArrowUp, faUser, faSync } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/refferrals.css';
import API_BASE_URL from '../../config/api';

const AccrualHistory = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  useEffect(() => {
    fetchAccrualHistory();
  }, []);

  const fetchAccrualHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans/accrual-history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accrual history');
      }

      const data = await response.json();
      setPlans(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load accrual history');
    } finally {
      setLoading(false);
    }
  };

  const handleForceAccrue = async () => {
    if (!window.confirm('Trigger accrual for all active plans now?')) return;
    setSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans/force-accrue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to force accrue');
      }

      const data = await response.json();
      alert(`Success: ${data.message}`);
      await fetchAccrualHistory();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const toggleExpand = (planId) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        <header className="plan-header">
          <div className="plan-avatar"><FontAwesomeIcon icon={faBox} /></div>
          <div className="plan-user-info">
            <h4 className="plan-username">Accrual History</h4>
            <p className="plan-email">Monitor daily profit accruals</p>
          </div>
          <div className="plan-balance">Plans: <span>{plans.length}</span></div>
        </header>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={handleForceAccrue}
            disabled={syncing || loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#22d3ee',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: syncing ? 'not-allowed' : 'pointer',
              opacity: syncing ? 0.6 : 1
            }}
          >
            <FontAwesomeIcon icon={faSync} /> {syncing ? 'Accruing...' : 'Force Accrue Now'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Loading accrual history...</h3>
          </div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>No plans to display</p>
          </div>
        ) : (
          <div style={{ marginBottom: '80px' }}>
            {plans.map((plan) => (
              <div
                key={plan._id}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '15px',
                  marginBottom: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: '10px'
                  }}
                  onClick={() => toggleExpand(plan._id)}
                >
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 700 }}>
                      {plan.planName}
                    </h3>
                    <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>
                      {plan.userName} ({plan.userEmail})
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: plan.status === 'completed' ? '#10b981' : '#f59e0b',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginBottom: '5px'
                      }}
                    >
                      {plan.status}
                    </span>
                    <p style={{ margin: '0', fontSize: '14px', fontWeight: 600 }}>
                      Earned: Rs {plan.totalEarned} / {plan.totalProfit}
                    </p>
                  </div>
                </div>

                {/* Plan Summary Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: expandedPlanId === plan._id ? '12px' : '0',
                    fontSize: '13px'
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Investment</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700 }}>Rs {plan.investmentAmount}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Daily Profit</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700 }}>Rs {plan.dailyProfit}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Accrual Count</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700 }}>{plan.accrualCount}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Last Accrued</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700 }}>
                      {plan.lastAccruedAt ? new Date(plan.lastAccruedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Expandable Accrual History */}
                {expandedPlanId === plan._id && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 600 }}>
                      Accrual Events ({plan.accrualHistory.length})
                    </h4>
                    {plan.accrualHistory.length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Timestamp</th>
                              <th style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>Days</th>
                              <th style={{ textAlign: 'right', padding: '8px', fontWeight: 600 }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plan.accrualHistory.map((accrual, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '8px' }}>
                                  {new Date(accrual.timestamp).toLocaleString()}
                                </td>
                                <td style={{ textAlign: 'center', padding: '8px', fontWeight: 600 }}>
                                  {accrual.daysAccrued}
                                </td>
                                <td style={{ textAlign: 'right', padding: '8px', fontWeight: 600, color: '#10b981' }}>
                                  Rs {accrual.amountAdded}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ margin: '0', color: '#94a3b8' }}>No accruals yet</p>
                    )}
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
              <FontAwesomeIcon icon={faUser} />
              <span>Users</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/admin/accounts" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faUser} />
              <span>Accounts</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AccrualHistory;
