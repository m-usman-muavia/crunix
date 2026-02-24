import React, { useEffect, useMemo, useState } from 'react';
import BottomNav from './BottomNav';
import API_BASE_URL from '../config/api';
import './css/style.css';
import './css/dashboard.css';
import './css/crx.css';

const CRXDigital = () => {
  const [wallet, setWallet] = useState({
    main_balance: 0,
    bonus_balance: 0,
    referral_balance: 0,
    crx_balance: 0
  });
  const [market, setMarket] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tradeMode, setTradeMode] = useState('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parseJsonSafe = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { message: text || 'Unexpected response' };
    }
  };

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [walletResponse, marketResponse, transactionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/wallet`, { headers: getAuthHeader() }),
        fetch(`${API_BASE_URL}/api/crx/market`, { headers: getAuthHeader() }),
        fetch(`${API_BASE_URL}/api/crx/transactions`, { headers: getAuthHeader() })
      ]);

      const [walletData, marketData, transactionsData] = await Promise.all([
        parseJsonSafe(walletResponse),
        parseJsonSafe(marketResponse),
        parseJsonSafe(transactionsResponse)
      ]);

      if (!walletResponse.ok) {
        throw new Error(walletData.message || 'Failed to fetch wallet');
      }
      if (!marketResponse.ok) {
        throw new Error(marketData.message || 'Failed to fetch market');
      }
      if (!transactionsResponse.ok) {
        throw new Error(transactionsData.message || 'Failed to fetch transactions');
      }

      setWallet(walletData);
      setMarket(marketData);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentPrice = Number(market?.current_price || 0);
  const mainBalance = Number(wallet?.main_balance || 0);
  const crxBalance = Number(wallet?.crx_balance || 0);
  const crxValue = currentPrice > 0 ? crxBalance * currentPrice : 0;
  const totalBalance = mainBalance + crxValue;

  const estimate = useMemo(() => {
    const amount = Number(tradeAmount);

    if (!Number.isFinite(amount) || amount <= 0 || currentPrice <= 0) {
      return 0;
    }

    if (tradeMode === 'buy') {
      return amount / currentPrice;
    }

    return amount * currentPrice;
  }, [tradeAmount, currentPrice, tradeMode]);

  const handleTrade = async () => {
    setError('');
    setSuccess('');

    const amount = Number(tradeAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setBusy(true);

    try {
      const endpoint = tradeMode === 'buy' ? 'buy' : 'sell';
      const payload = tradeMode === 'buy'
        ? { usd_amount: amount }
        : { crx_amount: amount };

      const response = await fetch(`${API_BASE_URL}/api/crx/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data.message || 'Trade failed');
      }

      setSuccess(data.message || 'Trade successful');
      setTradeAmount('');
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const history = market?.history || [];
  const prices = history.map((item) => Number(item.price || 0));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1;
  const priceRange = maxPrice - minPrice || 1;
  const graphPoints = history.map((item, index) => {
    const x = history.length === 1 ? 160 : (index / (history.length - 1)) * 320;
    const y = 120 - ((Number(item.price || 0) - minPrice) / priceRange) * 100 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="main-wrapper">
      <div className="main-container">
         <div className="deposit-header">CRX Trade</div>
        <div className="plan-image">
          <img 
            src="/planimage.webp" 
            alt="Investment Plans" 
            style={{ 
              width: '100%', 
              height: '200px', 
              objectFit: 'cover',
              borderRadius: '0px 0px 15px 15px',
              borderBottom: '2px solid #000000',
            }} 
          />
        </div>

        <div className="crx-content">
          {loading && <p className="crx-note">Loading CRX market...</p>}
          {error && <p className="crx-error">{error}</p>}
          {success && <p className="crx-success">{success}</p>}

          {!loading && (
            <div className="crx-rate-pill">1 CRX = ${currentPrice.toFixed(2)} USD</div>
          )}

          <div className="crx-card">
            <p className="crx-label" style={{ textAlign: 'center' }}>Available CRX Balance </p>
            <h2 className="crx-balance" style={{ textAlign: 'center' }}>CRX {crxBalance.toFixed(2)}</h2>
            <div className="crx-divider" />
            <div className="crx-stats-row">
              <div>
                <p className="crx-muted">1 CRX Value</p>
                <p className="crx-strong-light">${currentPrice.toFixed(2)} USD</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="crx-muted">CRX Wallet</p>
                <p className="crx-profit">{crxBalance.toFixed(6)} CRX</p>
              </div>
            </div>
            <div className="crx-divider" />
            <div className="crx-stats-row">
              <div>
                <p className="crx-muted">CRX Value</p>
                <p className="crx-strong-light">${crxValue.toFixed(2)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="crx-muted">Expected Rise</p>
                <p className="crx-strong-light">{Number(market?.expected_rise_percent || 0).toFixed(2)}%</p>
              </div>
            </div>
          </div>

          <div className="crx-card">
            <div className="crx-action-row" style={{ marginTop: 0 }}>
              <button
                type="button"
                className={tradeMode === 'buy' ? 'crx-buy-btn' : 'crx-neutral-btn'}
                onClick={() => setTradeMode('buy')}
              >
                Buy CRX
              </button>
              <button
                type="button"
                className={tradeMode === 'sell' ? 'crx-sell-btn' : 'crx-neutral-btn'}
                onClick={() => setTradeMode('sell')}
              >
                Sell CRX
              </button>
            </div>

            <label className="crx-label" htmlFor="crx-trade-input">
              {tradeMode === 'buy' ? 'Amount to Spend (USD)' : 'Amount to Sell (CRX)'}
            </label>
            <input
              id="crx-trade-input"
              type="number"
              min="0"
              step="0.01"
              value={tradeAmount}
              onChange={(event) => setTradeAmount(event.target.value)}
              placeholder="Enter amount"
              className="crx-input"
            />

            <div className="crx-estimate-row">
              <span className="crx-muted">
                {tradeMode === 'buy' ? 'Estimated CRX:' : 'Estimated USD:'}
              </span>
              <span className="crx-strong-light">
                {tradeMode === 'buy' ? `${estimate.toFixed(6)} CRX` : `$${estimate.toFixed(2)}`}
              </span>
            </div>

            <div className="crx-action-row">
              <button
                type="button"
                className={tradeMode === 'buy' ? 'crx-buy-btn' : 'crx-sell-btn'}
                onClick={handleTrade}
                disabled={busy}
              >
                {busy
                  ? 'Processing...'
                  : tradeMode === 'buy'
                    ? 'Confirm Buy'
                    : 'Confirm Sell'}
              </button>
            </div>
          </div>

          <div className="crx-card">
            <p className="crx-label">CRX Price Graph</p>
            {history.length > 0 ? (
              <div className="crx-graph-wrap">
                <svg viewBox="0 0 320 120" className="crx-graph" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#0055A4"
                    strokeWidth="3"
                    points={graphPoints}
                  />
                </svg>
                <div className="crx-graph-footer">
                  <span>Min: ${minPrice.toFixed(2)}</span>
                  <span>Max: ${maxPrice.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="crx-note">No price history yet.</p>
            )}
          </div>

          <div className="crx-card">
            <p className="crx-label">Recent Trades</p>
            <div className="crx-table-wrap">
              <table className="crx-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>CRX</th>
                    <th>USD</th>
                    <th>Price</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item._id}>
                      <td>{item.type}</td>
                      <td>{Number(item.crx_amount || 0).toFixed(6)}</td>
                      <td>${Number(item.usd_amount || 0).toFixed(2)}</td>
                      <td>${Number(item.price_per_crx || 0).toFixed(2)}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!transactions.length && (
                    <tr>
                      <td colSpan="5">No trades yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default CRXDigital;