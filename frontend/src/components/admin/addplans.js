import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faArrowDown,faArrowUp, faUser, faClock } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/refferrals.css';

const AddPlans = () => {
    const [error, setError] = useState('');
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionBusyId, setActionBusyId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [showInactive, setShowInactive] = useState(false);
    const [form, setForm] = useState({
        planTitle: '',
        investmentAmount: '',
        dailyProfit: '',
        duration: ''
    });

    const parseJsonSafe = async (res) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return { message: text }; }
    };

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/auth/adminplans');
            const data = await parseJsonSafe(res);
            if (res.ok) {
                setPlans(data.data || []);
            } else {
                setError(data.message || 'Failed to load plans');
            }
        } catch (err) {
            setError('Error loading plans: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    const resetForm = () => {
        setForm({ planTitle: '', investmentAmount: '', dailyProfit: '', duration: '' });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const payload = {
            name: form.planTitle,
            investment_amount: Number(form.investmentAmount),
            daily_profit: Number(form.dailyProfit),
            duration_days: Number(form.duration)
        };

        const isEdit = !!editingId;
        const url = isEdit
            ? `/api/auth/adminplans/${editingId}`
            : '/api/auth/adminplans';
        const method = isEdit ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEdit ? payload : { ...payload, status: 'active' })
            });
            const data = await parseJsonSafe(res);
            if (res.ok) {
                await fetchPlans();
                resetForm();
            } else {
                setError(data.message || 'Failed to save plan');
            }
        } catch (err) {
            setError('Error saving plan: ' + err.message);
        }
    };

    const handleToggleStatus = async (plan) => {
        setError('');
        setActionBusyId(plan._id);
        const nextStatus = plan.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch(`/api/auth/adminplans/${plan._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            const data = await parseJsonSafe(res);
            if (res.ok) {
                setPlans((prev) =>
                    prev.map((p) => (p._id === plan._id ? { ...p, status: nextStatus } : p))
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

    const handleDelete = async (plan) => {
        if (!window.confirm('Delete this plan?')) return;
        setError('');
        setActionBusyId(plan._id);
        try {
            const res = await fetch(`http://localhost:5000/api/auth/adminplans/${plan._id}`, {
                method: 'DELETE'
            });
            const data = await parseJsonSafe(res);
            if (res.ok) {
                setPlans((prev) => prev.filter((p) => p._id !== plan._id));
            } else {
                setError(data.message || 'Failed to delete plan');
            }
        } catch (err) {
            setError('Error deleting plan: ' + err.message);
        } finally {
            setActionBusyId(null);
        }
    };

    const handleEdit = (plan) => {
        setError('');
        setEditingId(plan._id);
        setForm({
            planTitle: plan.name || '',
            investmentAmount: plan.investment_amount || '',
            dailyProfit: plan.daily_profit || '',
            duration: plan.duration_days || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const filteredPlans = showInactive 
        ? plans 
        : plans.filter((p) => p.status === 'active');

    return (
        <div className="main-wrapper">
            <div className="main-container">
                <header className="plan-header">
                    <div className="plan-avatar"><FontAwesomeIcon icon={faBox} /></div>
                    <div className="plan-user-info">
                        <h4 className="plan-username">Investment Plans</h4>
                        <p className="plan-email">Manage investment plans</p>
                    </div>
                    <div className="plan-balance">Plans: <span>{filteredPlans.length}</span></div>
                </header>

                {/* Add Plans Section */}
                <div className="addplans-section">
                    <div className="addplans-card">
                        <h3 className="addplans-header">{editingId ? 'Edit Investment Plan' : 'Add New Investment Plan'}</h3>
                        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                        <form className="addplans-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>
                                    Plan Name <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="planTitle"
                                    value={form.planTitle}
                                    onChange={onChange}
                                    placeholder="Enter Plan Title"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0px', margin: '1px' }}>
                                <div className="input-group" style={{ flex: 1, margin: '0px' }}>
                                    <label>
                                        Investment Amount (Rs) <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="investmentAmount"
                                        value={form.investmentAmount}
                                        onChange={onChange}
                                        placeholder="Enter Investment Amount"
                                        required
                                    />
                                </div>

                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>
                                        Daily Profit (Rs) <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="dailyProfit"
                                        value={form.dailyProfit}
                                        onChange={onChange}
                                        placeholder="Enter Daily Profit"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>
                                    Duration (Days) <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={form.duration}
                                    onChange={onChange}
                                    placeholder="Enter Duration in Days"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" className="addplan-btn">
                                    {editingId ? 'Update Plan' : 'Add Plan'}
                                </button>
                                {editingId && (
                                    <button type="button" className="addplan-btn" onClick={resetForm}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* View Plans Section */}
                <div className="plan-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3>Investment Plans</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                            />
                            <span>Show Inactive</span>
                        </label>
                    </div>
                    {loading && <p>Loading plans...</p>}
                    {!loading && filteredPlans.length === 0 && <p>No plans found.</p>}
                    {!loading && filteredPlans.map((plan) => (
                        <div className="plan-card" key={plan._id} style={{ opacity: plan.status === 'inactive' ? 0.6 : 1 }}>
                            <div className="plan-card-header">
                                <h3 className="plan-title">{plan.name}</h3>
                                <span className="percentage-badge" style={{ color: plan.status === 'active' ? 'green' : 'red' }}>
                                    {plan.status}
                                </span>
                            </div>

                            <div className="plan-duration">
                                <FontAwesomeIcon icon={faClock} className="clock-icon" /> {plan.duration_days} Days
                            </div>

                            <div className="plan-details-grid">
                                <div className="detail-row">
                                    <span className="detail-label">Investment</span>
                                    <span className="detail-value text-bold">Rs {plan.investment_amount}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Daily Income</span>
                                    <span className="detail-value text-purple">Rs {plan.daily_profit}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Total Return</span>
                                    <span className="detail-value text-green">Rs {plan.total_profit}</span>
                                </div>
                            </div>
                            <div className="invest-now-container">
                                <button
                                    className="small-now-btn"
                                    onClick={() => handleToggleStatus(plan)}
                                    disabled={actionBusyId === plan._id}
                                >
                                    {plan.status === 'active' ? 'Inactivate' : 'Activate'}
                                </button>
                                <button
                                    className="small-now-btn"
                                    onClick={() => handleEdit(plan)}
                                    disabled={actionBusyId === plan._id}
                                >
                                    Edit
                                </button>
                                <button
                                    className="small-now-btn"
                                    onClick={() => handleDelete(plan)}
                                    disabled={actionBusyId === plan._id}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

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

export default AddPlans;