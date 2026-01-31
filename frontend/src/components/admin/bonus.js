import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faArrowDown, faArrowUp, faUsers, faUser, faCopy,faClock } from '@fortawesome/free-solid-svg-icons';
import '../css/dashboard.css';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/profile.css';
import API_BASE_URL from '../../config/api';

const BonusGenerator = () => {
  const [quantity, setQuantity] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleGenerateCodes = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!quantity || !bonusAmount) {
      setError('Please fill in all fields');
      return;
    }

    const qty = parseInt(quantity);
    const amount = parseFloat(bonusAmount);

    if (qty <= 0 || qty > 1000) {
      setError('Quantity must be between 1 and 1000');
      return;
    }

    if (amount <= 0) {
      setError('Total bonus amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      // Generate ONE code that can be used multiple times
      const perUserAmount = parseFloat((amount / qty).toFixed(2));
      const codeData = {
        code: generateCode(),
        totalAmount: parseFloat(amount),
        perUserAmount: perUserAmount,
        maxUses: parseInt(qty)
      };

      console.log('Sending bonus code data:', codeData);
      console.log('API URL:', `${API_BASE_URL}/api/bonus/generate`);

      // Send code to backend API to save in database
      const response = await fetch(`${API_BASE_URL}/api/bonus/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(codeData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to generate bonus code';
        try {
          const errorData = await response.json();
          console.log('Backend error response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.log('Could not parse error response:', e);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', result);
      setGeneratedCode(codeData);
      setQuantity('');
      setBonusAmount('');
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error generating code:', err);
      setError(err.message || 'Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      alert('Code copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        {/* Top Header Section */}
        <header className="dashboard-header">
          <div className="dashboard-user-info">
            <h4 className="dashboard-greeting">Bonus Code Generator</h4>
            <p className="dashboard-name">Admin Panel</p>
          </div>
        </header>

        {/* Form Section */}
        <div className="section">
          <div className="dashboard-plans-header">
            <h2>Generate Bonus Code</h2>
          </div>

          <form onSubmit={handleGenerateCodes} style={{ padding: '20px' }}>
            {error && (
              <div style={{
                padding: '10px',
                marginBottom: '15px',
                backgroundColor: '#fee',
                color: '#c00',
                borderRadius: '5px',
                border: '1px solid #fcc'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Quantity (Number of Users)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter number of users who can use this code"
                min="1"
                max="1000"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
                required
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                Code will expire after {quantity || '0'} uses
              </small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Total Bonus Amount (Rs)
              </label>
              <input
                type="number"
                step="0.01"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                placeholder="Enter total bonus amount to distribute"
                min="0.01"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
                required
              />
              {quantity && bonusAmount && (
                <small style={{ color: '#16a34a', fontSize: '12px', fontWeight: 'bold' }}>
                  Each user will receive: Rs {(parseFloat(bonusAmount) / parseInt(quantity)).toFixed(2)}
                </small>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #22d3ee, #16a34a)',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Generating...' : 'Generate Code'}
            </button>
          </form>
        </div>

        {/* Generated Codes Section */}
        {generatedCode && (
          <div className="section">
            <div className="dashboard-plans-header">
              <h2>Generated Bonus Code</h2>
            </div>

            <div style={{ padding: '20px' }}>
              <div
                style={{
                  padding: '25px',
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #16a34a',
                  borderRadius: '12px'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#16a34a',
                    fontFamily: 'monospace',
                    letterSpacing: '4px',
                    marginBottom: '10px'
                  }}>
                    {generatedCode.code}
                  </div>
                  <button
                    onClick={() => handleCopyCode(generatedCode.code)}
                    style={{
                      padding: '12px 30px',
                      backgroundColor: '#22d3ee',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                    Copy Code
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                      Total Amount
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                      Rs {generatedCode.totalAmount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                      Per User Amount
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                      Rs {generatedCode.perUserAmount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                      Max Uses
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                      {generatedCode.maxUses} users
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                      Status
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                      Active
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#92400e'
                }}>
                  ⚠️ This code will expire after being used {generatedCode.maxUses} times
                </div>
              </div>
            </div>
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

export default BonusGenerator;
