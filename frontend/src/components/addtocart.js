import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import './css/dashboard.css';
import './css/style.css';
import './css/plans.css';
import BottomNav from './BottomNav';

const AddToCart = () => {
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
              <h3 className="plans-status-value">0 Items</h3>
              <Link to="/plans" className="dashboard-modern-edit-link">GO TO PLANS</Link>
            </div>
          </div>
        </div>

        <div className="plan-content" style={{ paddingTop: '14px' }}>
          <div className="plan-card-new" style={{ textAlign: 'center' }}>
            <h3 className="product-title" style={{ marginBottom: '8px' }}>Your cart is empty</h3>
            <p className="detail-label-new" style={{ marginBottom: '14px' }}>
              Add plans from the plans page and they will appear here.
            </p>
            <Link to="/plans" className="dashboard-modern-edit-link">BROWSE PLANS</Link>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default AddToCart;
