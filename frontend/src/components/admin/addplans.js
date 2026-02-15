import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faArrowDown,faArrowUp, faUsers, faClock } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/refferrals.css';
import API_BASE_URL from '../../config/api';

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
        duration: '',
        purchaseLimit: '',
        image: null
    });

    const resolveImageUrl = (imagePath) => {
        if (!imagePath) {
            return '';
        }

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
            return imagePath;
        }

        const normalized = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        return `${API_BASE_URL}/${normalized}`;
    };

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
        setForm({ planTitle: '', investmentAmount: '', dailyProfit: '', duration: '', purchaseLimit: '', image: null });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const formData = new FormData();
        formData.append('name', form.planTitle);
        formData.append('investment_amount', form.investmentAmount);
        formData.append('daily_profit', form.dailyProfit);
        formData.append('duration_days', form.duration);
        formData.append('purchase_limit', form.purchaseLimit || 0);
        if (!editingId) {
            formData.append('status', 'active');
        }
        if (form.image) {
            formData.append('image', form.image);
        }

        const isEdit = !!editingId;
        const url = isEdit
            ? `/api/auth/adminplans/${editingId}`
            : '/api/auth/adminplans';
        const method = isEdit ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                body: formData
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
            const res = await fetch(`/api/auth/adminplans/${plan._id}`, {
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
            duration: plan.duration_days || '',
            purchaseLimit: plan.purchase_limit || '',
            image: null
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setForm((f) => ({ ...f, image: e.target.files[0] }));
        }
    };

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

                            <div className="input-group">
                                <label>
                                    Plan Image <span style={{ color: 'gray', fontSize: '12px' }}>(Optional)</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                />
                                {form.image && (
                                    <span style={{ fontSize: '12px', color: 'green', marginTop: '5px', display: 'block' }}>
                                        Selected: {form.image.name}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
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

                                <div className="input-group" style={{ flex: 1, margin: '0px' }}>
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

                            <div className="input-group">
                                <label>
                                    Purchase Limit <span style={{ color: 'gray', fontSize: '12px' }}>(0 = Unlimited)</span>
                                </label>
                                <input
                                    type="number"
                                    name="purchaseLimit"
                                    value={form.purchaseLimit}
                                    onChange={onChange}
                                    placeholder="Enter Purchase Limit (0 for unlimited)"
                                    min="0"
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
                            {(plan.image_base64 || plan.image_path) && (
                                <div style={{ 
                                    width: '100%', 
                                    height: '150px', 
                                    overflow: 'hidden',
                                    borderRadius: '12px 12px 0 0',
                                    marginBottom: '12px'
                                }}>
                                    <img 
                                        src={plan.image_base64 || resolveImageUrl(plan.image_path)} 
                                        alt={plan.name}
                                        style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover' 
                                        }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            )}
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
                                <div className="detail-row">
                                    <span className="detail-label">Purchase Limit</span>
                                    <span className="detail-value text-bold">
                                        {plan.purchase_limit === 0 || !plan.purchase_limit ? 'Unlimited' : `${plan.purchase_limit} times`}
                                    </span>
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

export default AddPlans;