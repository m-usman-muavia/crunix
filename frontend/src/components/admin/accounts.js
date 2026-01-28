import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox,faArrowDown,faArrowUp, faUser,faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/refferrals.css';

const Accounts = () => {
    const [error, setError] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionBusyId, setActionBusyId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        accountTitle: '',
        accountNumber: '',
        bankName: '',
        accountType: ''
    });

    const parseJsonSafe = async (res) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return { message: text }; }
    };

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/auth/adminaccounts');
            const data = await parseJsonSafe(res);
            console.log('Fetched accounts data:', data);
            if (res.ok) {
                const accountsData = data.data || [];
                console.log('Total accounts:', accountsData.length);
                console.log('Active accounts:', accountsData.filter(a => a.status === 'active').length);
                console.log('Inactive accounts:', accountsData.filter(a => a.status === 'inactive').length);
                setAccounts(accountsData);
            } else {
                setError(data.message || 'Failed to load accounts');
            }
        } catch (err) {
            setError('Error loading accounts: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAccounts(); }, []);

    const resetForm = () => {
        setForm({ accountTitle: '', accountNumber: '', bankName: '', accountType: '' });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const payload = {
            account_name: form.accountTitle,
            account_number: form.accountNumber,
            bank_name: form.bankName,
            account_type: form.accountType
        };

        const isEdit = !!editingId;
        const url = isEdit
            ? `/api/auth/adminaccounts/${editingId}`
            : '/api/auth/adminaccounts';
        const method = isEdit ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEdit ? payload : { ...payload, status: 'active' })
            });
            const data = await parseJsonSafe(res);
            if (res.ok) {
                await fetchAccounts();
                resetForm();
            } else {
                setError(data.message || 'Failed to save account');
            }
        } catch (err) {
            setError('Error saving account: ' + err.message);
        }
    };

    const handleToggleStatus = async (account) => {
        setError('');
        setActionBusyId(account._id);
        const nextStatus = account.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch(`/api/auth/adminaccounts/${account._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            const data = await parseJsonSafe(res);
            if (res.ok) {
                setAccounts((prev) =>
                    prev.map((a) => (a._id === account._id ? { ...a, status: nextStatus } : a))
                );
            } else {
                setError(data.message || 'Failed to update status');
            }
        } catch (err) {
            setError('Error updating status: ' + err.message);
        } finally {
            setActionBusyId(null);
        }
    };

    const handleDelete = async (account) => {
        if (!window.confirm('Delete this account?')) return;
        setError('');
        setActionBusyId(account._id);
        try {
            const res = await fetch(`/api/auth/adminaccounts/${account._id}`, {
                method: 'DELETE'
            });
            const data = await parseJsonSafe(res);
            if (res.ok) {
                setAccounts((prev) => prev.filter((a) => a._id !== account._id));
            } else {
                setError(data.message || 'Failed to delete account');
            }
        } catch (err) {
            setError('Error deleting account: ' + err.message);
        } finally {
            setActionBusyId(null);
        }
    };

    const handleEdit = (account) => {
        setError('');
        setEditingId(account._id);
        setForm({
            accountTitle: account.account_name || '',
            accountNumber: account.account_number || '',
            bankName: account.bank_name || '',
            accountType: account.account_type || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    return (
        <div className="main-wrapper">
            <div className="main-container">
                <header className="plan-header">
                    <div className="plan-avatar"><FontAwesomeIcon icon={faBox} /></div>
                    <div className="plan-user-info">
                        <h4 className="plan-username">Bank Accounts</h4>
                        <p className="plan-email">Manage payout accounts</p>
                    </div>
                    <div className="plan-balance">Accounts: <span>{accounts.length}</span></div>
                </header>

                <div className="addaccounts-section">
                    <div className="addaccounts-card">
                        <h3 className="addaccounts-header">{editingId ? 'Edit Bank Account' : 'Add New Bank Account'}</h3>
                        <form className="addaccounts-form" onSubmit={handleSubmit}> 
                            <div className="input-group">
                                <label>Account Title<span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    name="accountTitle"
                                    value={form.accountTitle}
                                    onChange={onChange}
                                    placeholder="Enter Account Title"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Account Number<span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={form.accountNumber}
                                    onChange={onChange}
                                    placeholder="Enter Account Number"
                                    required
                                />
                            </div>  
                            <div className="input-group">
                                <label>Bank Name<span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={form.bankName}
                                    onChange={onChange}
                                    placeholder="Enter Bank Name"
                                    required
                                />
                            </div>  
                            <div className="input-group">
                                <label>Account Type<span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    name="accountType"
                                    value={form.accountType}
                                    onChange={onChange}
                                    placeholder="Enter Account Type"
                                    required
                                />
                            </div>  
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" className="add-account-btn">
                                    {editingId ? 'Update Account' : 'Add Account'}
                                </button>
                                {editingId && (
                                    <button type="button" className="add-account-btn" onClick={resetForm}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>  

                    <div className="accounts-list-card">
                        <h3 className="accounts-list-header">Bank Accounts</h3>
                        {loading ? (
                            <p>Loading accounts...</p>
                        ) : accounts.length === 0 ? (
                            <p>No accounts found</p>
                        ) : (
                            accounts.map((account) => (
                                <div className="plan-card" key={account._id} style={{ opacity: account.status === 'inactive' ? 0.6 : 1 }}>
                                    <div className="plan-details-grid">
                                        <div className="detail-row">
                                            <span className="detail-label">Account title</span>
                                            <span className="detail-value text-bold">{account.account_name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Account number</span>
                                            <span className="detail-value text-purple">{account.account_number}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Account type</span>
                                            <span className="detail-value text-green">{account.account_type}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Status</span>
                                            <span className="detail-value" style={{ color: account.status === 'active' ? 'green' : 'red' }}>
                                                {account.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="action-now-container">
                                        <button
                                            className="small-now-btn"
                                            onClick={() => handleToggleStatus(account)}
                                            disabled={actionBusyId === account._id}
                                        >
                                            {account.status === 'active' ? 'Inactivate' : 'Activate'}
                                        </button>
                                        <button
                                            className="small-now-btn"
                                            onClick={() => handleEdit(account)}
                                            disabled={actionBusyId === account._id}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="small-now-btn"
                                            onClick={() => handleDelete(account)}
                                            disabled={actionBusyId === account._id}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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
                        </nav>
            </div>
        </div>
    );
};

export default Accounts;