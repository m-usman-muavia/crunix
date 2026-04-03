import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';
import './css/style.css';
import './css/dashboard.css';

const OilTrading = () => {
  const [wallet, setWallet] = useState({
    main_balance: 0,
    barrel_balance: 0
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

    try {
      const [walletResponse, marketResponse, transactionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/wallet`, { headers: getAuthHeader() }),
        fetch(`${API_BASE_URL}/api/barrel/market`, { headers: getAuthHeader() }),
        fetch(`${API_BASE_URL}/api/barrel/transactions`, { headers: getAuthHeader() })
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
        throw new Error(marketData.message || 'Failed to fetch oil market');
      }

      if (!transactionsResponse.ok) {
        throw new Error(transactionsData.message || 'Failed to fetch trades');
      }

      setWallet(walletData);
      setMarket(marketData);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const timer = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const currentPrice = Number(market?.current_price || 0);
  const barrelBalance = Number(wallet?.barrel_balance || 0);
  const barrelValue = currentPrice > 0 ? barrelBalance * currentPrice : 0;

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

  const handleTrade = async (event) => {
    event.preventDefault();
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
        : { barrel_amount: amount };

      const response = await fetch(`${API_BASE_URL}/api/barrel/${endpoint}`, {
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

  const formatTxTime = (value) => {
    const date = new Date(value);

    if (!value || Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">
        <div className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Market</p>
              <h1 className="dashboard-modern-title">Oil Trading</h1>
            </div>
          </div>

          <div className="dashboard-market-summary-grid">
           
            <div className="dashboard-market-summary-card" style={{backgroundcolor:'#ffffff'}}>
              <p className="dashboard-market-summary-label">You Stored</p>
              <h3 className="dashboard-market-summary-value">{barrelBalance.toFixed(4)} BARREL</h3>
            </div>
             <div className="dashboard-market-summary-card">
              <p className="dashboard-market-summary-label">Barrel Price Today</p>
              <h3 className="dashboard-market-summary-value">
                {loading ? 'Loading...' : `AED ${currentPrice.toFixed(2)}`}
              </h3>
            </div>
          </div>
        </div>

        <section className="dashboard-showcase dashboard-barrel-showcase">
          <div className="dashboard-section-head dashboard-transaction-header">
            <div>
              <h3>Buy and Sell</h3>
              <p className="dashboard-section-sub">Purchase barrels and sell any time at live price.</p>
            </div>
          </div>

          <div className="dashboard-barrel-grid">
            <div className="dashboard-barrel-card dashboard-barrel-trade-card">
              <div className="dashboard-barrel-switch-row">
                <button
                  type="button"
                  className={tradeMode === 'buy' ? 'dashboard-barrel-switch dashboard-barrel-switch-active' : 'dashboard-barrel-switch'}
                  onClick={() => setTradeMode('buy')}
                >
                  Buy Barrel
                </button>
                <button
                  type="button"
                  className={tradeMode === 'sell' ? 'dashboard-barrel-switch dashboard-barrel-switch-active' : 'dashboard-barrel-switch'}
                  onClick={() => setTradeMode('sell')}
                >
                  Sell Barrel
                </button>
              </div>

              <form onSubmit={handleTrade}>
                <label className="dashboard-barrel-label" htmlFor="oil-trade-input">
                  {tradeMode === 'buy' ? 'Amount to Spend (AED)' : 'Amount to Sell (Barrel)'}
                </label>
                <input
                  id="oil-trade-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={tradeAmount}
                  onChange={(event) => setTradeAmount(event.target.value)}
                  placeholder="Enter amount"
                  className="dashboard-barrel-input"
                />

                <div className="dashboard-barrel-estimate-row">
                  <span className="dashboard-barrel-muted">
                    {tradeMode === 'buy' ? 'Estimated Barrel:' : 'Estimated AED:'}
                  </span>
                  <span className="dashboard-barrel-strong">
                    {tradeMode === 'buy' ? `${estimate.toFixed(6)} BARREL` : `AED ${estimate.toFixed(2)}`}
                  </span>
                </div>

                {error ? <p className="dashboard-barrel-message dashboard-barrel-message-error">{error}</p> : null}
                {success ? <p className="dashboard-barrel-message dashboard-barrel-message-success">{success}</p> : null}

                <button
                  type="submit"
                  className={tradeMode === 'buy' ? 'dashboard-barrel-submit dashboard-barrel-submit-buy' : 'dashboard-barrel-submit dashboard-barrel-submit-sell'}
                  disabled={busy}
                >
                  {busy ? 'Processing...' : tradeMode === 'buy' ? 'Confirm Buy' : 'Confirm Sell'}
                </button>
              </form>
            </div>

            {/* <div className="dashboard-barrel-card dashboard-barrel-graph-card">
              <p className="dashboard-barrel-label">Barrel Price Graph</p>
              {history.length > 0 ? (
                <div className="dashboard-barrel-graph-wrap">
                  <svg viewBox="0 0 320 120" className="dashboard-barrel-graph" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#8b5a2b"
                      strokeWidth="3"
                      points={graphPoints}
                    />
                  </svg>
                  <div className="dashboard-barrel-graph-footer">
                    <span>Min: AED {minPrice.toFixed(2)}</span>
                    <span>Max: AED {maxPrice.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="dashboard-barrel-note">No barrel price history yet.</p>
              )}
            </div> */}
          </div>

          <div className="dashboard-barrel-card dashboard-barrel-history-card">
            <p className="dashboard-barrel-label">Recent Buy and Sell History</p>
            <div className="dashboard-barrel-table-wrap">
              <table className="dashboard-barrel-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Barrel</th>
                    <th>AED</th>
                    <th>Price</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 8).map((item) => (
                    <tr key={item._id}>
                      <td>{item.type}</td>
                      <td>{Number(item.barrel_amount || 0).toFixed(6)}</td>
                      <td>AED {Number(item.usd_amount || 0).toFixed(2)}</td>
                      <td>AED {Number(item.price_per_barrel || 0).toFixed(2)}</td>
                      <td>{formatTxTime(item.createdAt)}</td>
                    </tr>
                  ))}
                  {!transactions.length && (
                    <tr>
                      <td colSpan="5">No barrel trades yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <BottomNav />
      </div>
    </div>
  );
};

export default OilTrading;