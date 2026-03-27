import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCirclePlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
import './css/dashboard.css';
import './css/style.css';
import './css/plans.css';
import BottomNav from './BottomNav';
import ErrorModal from './ErrorModal';
import API_BASE_URL from '../config/api';

const AddToCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  useEffect(() => {
    const current = JSON.parse(localStorage.getItem('planCart') || '[]');
    setCartItems(Array.isArray(current) ? current : []);
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('planCart', JSON.stringify(items));
  };

  const handleIncrease = (planId) => {
    const next = cartItems.map((item) => {
      if (item.planId !== planId) return item;
      const limit = Number(item.purchase_limit || 0);
      const nextQty = limit > 0 ? Math.min(limit, item.quantity + 1) : item.quantity + 1;
      return { ...item, quantity: nextQty };
    });
    saveCart(next);
  };

  const handleDecrease = (planId) => {
    const next = cartItems.map((item) => (
      item.planId === planId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    ));
    saveCart(next);
  };

  const handleRemove = (planId) => {
    const next = cartItems.filter((item) => item.planId !== planId);
    saveCart(next);
  };

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0),
    [cartItems]
  );

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty');
      setIsErrorModalOpen(true);
      return;
    }

    setCheckoutSuccess(null);
    setIsLoading(true);

    const parseJsonSafe = async (response) => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { message: text || `Request failed (HTTP ${response.status})` };
      }
    };

    try {
      // First, validate all plans have sufficient balance
      for (const item of cartItems) {
        const validateResponse = await fetch(`${API_BASE_URL}/api/plans/invest-now`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            planId: item.planId,
            confirm: false
          })
        });

        const validateData = await parseJsonSafe(validateResponse);

        if (!validateResponse.ok) {
          setErrorMessage(validateData.message || 'Validation failed');
          setIsErrorModalOpen(true);
          setIsLoading(false);
          return;
        }
      }

      // All validations passed, now activate all plans
      let successCount = 0;
      let failureError = null;

      for (const item of cartItems) {
        // Activate plan for each quantity
        for (let i = 0; i < Number(item.quantity || 1); i++) {
          const investResponse = await fetch(`${API_BASE_URL}/api/plans/invest-now`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              planId: item.planId,
              confirm: true
            })
          });

          const investData = await parseJsonSafe(investResponse);

          if (!investResponse.ok) {
            failureError = investData.message || 'Failed to activate plan';
            break;
          }

          successCount += 1;
        }

        if (failureError) break;
      }

      if (failureError) {
        setErrorMessage(failureError);
        setIsErrorModalOpen(true);
      } else {
        // Success - clear cart and show success card
        localStorage.removeItem('planCart');
        setCartItems([]);
        setCheckoutSuccess({
          count: successCount,
          amount: totalAmount
        });
      }
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred during checkout');
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-wrapper dom-wrapper">
      <div className="main-container dom-container">
        <div className="dashboard-modern-hero dashboard-service-hero">
          <div className="dashboard-modern-hero-top">
            <div>
              <p className="dashboard-service-label">Your items</p>
              <h1 className="dashboard-modern-title">Add To Cart</h1>
            </div>
            <div className="dashboard-header-actions">
              <span className="dashboard-header-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faCartShopping} />
              </span>
            </div>
          </div>

          <div className="plans-status-overview" style={{ gridTemplateColumns: '1fr' }}>
            <div className="plans-status-card" style={{ textAlign: 'center' }}>
              <p className="plans-status-label">Cart Status</p>
              <h3 className="plans-status-value">{totalItems} Items</h3>
              <Link to="/plans" className="dashboard-modern-edit-link">GO TO PLANS</Link>
            </div>
          </div>
        </div>

        <div className="plan-content" style={{ paddingTop: '14px' }}>
          {checkoutSuccess && (
            <div className="checkout-success-card" role="status" aria-live="polite">
              <h3>Checkout Successful</h3>
              <p>
                Activated {checkoutSuccess.count} {checkoutSuccess.count === 1 ? 'plan' : 'plans'} for AED {Number(checkoutSuccess.amount || 0).toFixed(2)}.
              </p>
              <div className="checkout-success-actions">
                <button type="button" className="dashboard-modern-edit-link" onClick={() => navigate('/dashboard')}>
                  GO TO DASHBOARD
                </button>
                <button type="button" className="checkout-success-secondary" onClick={() => navigate('/plans')}>
                  BROWSE MORE PLANS
                </button>
              </div>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="plan-card-new" style={{ textAlign: 'center' }}>
              <h3 className="product-title" style={{ marginBottom: '8px' }}>Your cart is empty</h3>
              <p className="detail-label-new" style={{ marginBottom: '14px' }}>
                Add plans from the plans page and they will appear here.
              </p>
              <Link to="/plans" className="dashboard-modern-edit-link">BROWSE PLANS</Link>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div className="plan-card-new" key={item.planId}>
                  <div className="plan-card-top" style={{ alignItems: 'center' }}>
                    <div className="plan-product-image" style={{ width: '90px', minWidth: '90px', height: '90px' }}>
                      {item.image_path ? (
                        <img src={item.image_path} alt={item.name} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>

                    <div className="plan-product-info" style={{ width: '100%' }}>
                      <h3 className="product-title" style={{ fontSize: '16px' }}>{item.name}</h3>
                      <div className="detail-item">
                        <span className="detail-label-new">Price</span>
                        <span className="detail-value-new">AED {Number(item.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label-new">Subtotal</span>
                        <span className="detail-value-new">AED {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</span>
                      </div>

                      <div className="plan-slide-actions" style={{ marginTop: '10px' }}>
                        <div className="plan-slide-buy">
                          <button type="button" className="plan-slide-buy-btn" onClick={() => handleDecrease(item.planId)}>
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className="plan-slide-buy-count">{String(item.quantity || 1).padStart(2, '0')}</span>
                          <button type="button" className="plan-slide-buy-btn" onClick={() => handleIncrease(item.planId)}>
                            <FontAwesomeIcon icon={faCirclePlus} />
                          </button>
                        </div>

                        <button type="button" className="plan-slide-invest" onClick={() => handleRemove(item.planId)}>
                          <FontAwesomeIcon icon={faTrash} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="plan-card-new" style={{ marginTop: '10px' }}>
                <div className="detail-item">
                  <span className="detail-label-new">Total Amount</span>
                  <span className="detail-value-new">AED {totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="dashboard-modern-edit-link"
                    style={{ minWidth: '160px', textAlign: 'center', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
                  >
                    {isLoading ? 'PROCESSING...' : 'CHECKOUT'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <BottomNav />

        {isErrorModalOpen && (
          <ErrorModal
            message={errorMessage}
            onClose={() => setIsErrorModalOpen(false)}
            closeDuration={2500}
          />
        )}
      </div>
    </div>
  );
};

export default AddToCart;
