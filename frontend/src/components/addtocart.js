import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCirclePlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
import './css/dashboard.css';
import './css/style.css';
import './css/plans.css';
import BottomNav from './BottomNav';

const AddToCart = () => {
  const [cartItems, setCartItems] = useState([]);

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
                  <Link
                    to="/checkout"
                    state={{ amount: totalAmount }}
                    className="dashboard-modern-edit-link"
                    style={{ minWidth: '160px', textAlign: 'center' }}
                  >
                    CHECKOUT
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default AddToCart;
