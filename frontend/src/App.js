import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons';
import './App.css';
import Login from './components/login';
import Registration from './components/registration'; // Make sure this file exists
import Dashboard from './components/dashboard';
import Plan from './components/plans';
import Deposit  from './components/deposit_NEW';
import DepositConfirm from './components/depositconfirm';
import Withdrawal from './components/withdrawal';
import WithdrawConfirm from './components/withdrawconfirm';
import Transactions from './components/transactions';
import DepositHistory from './components/DepositHistory';
import WithdrawalHistory from './components/WithdrawalHistory';
import Refferrals from './components/refferrals';
import Profile from './components/profile';
import VerifyEmail from './components/EmailOTP';
import ForgotPassword from './components/forgotpassword';
import ProtectedRoute from './components/protectedroute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLogin from './components/AdminLogin';
import AddPlan from './components/admin/addplans';
import Accounts from './components/admin/accounts';
import AdminDashboard from './components/admin/admindashboard';
import CheckDeposits from './components/admin/checkdeposits';
import CheckWithdrawals from './components/admin/checkwithdrawals';
import CheckUser from './components/admin/checkusers';
import AccrualHistory from './components/admin/accrualhistory';
import BonusGenerator from './components/admin/bonus';
import DashboardImage from './components/admin/dashboardimage';
import CrxSettings from './components/admin/crxsettings';
import BarrelSettings from './components/admin/barrelsettings';
import BroadcastNotification from './components/admin/broadcastnotification';
import ActivePlans from './components/ActivePlans_NEW';
import CollectIncome from './components/CollectIncome';
import Notifications from './components/notifications';
import CRXDigital from './components/CRXDigital';
import OilTrading from './components/oiltrading';
import CompletePlans from './components/CompletePlans_NEW';
import AddToCart from './components/addtocart';
import Bonus from './components/bonus';

const SplashScreen = () => (
  <div className="app-splash-screen app-splash-service-hero" aria-label="Loading screen">
    <span className="app-splash-orb app-splash-orb-1" aria-hidden="true" />
    <span className="app-splash-orb app-splash-orb-2" aria-hidden="true" />
    <span className="app-splash-orb app-splash-orb-3" aria-hidden="true" />
    <span className="app-splash-orb app-splash-orb-4" aria-hidden="true" />
    <span className="app-splash-orb app-splash-orb-5" aria-hidden="true" />
    <div className="app-splash-content">
      <div className="app-splash-halo" />
      <img src="/logo51200.png" alt="DUBAIOILNETWORK" className="app-splash-logo" />
      <div className="app-splash-brand">
        <h2 className="app-splash-title">Desert Oil Network </h2>
        <p className="app-splash-tagline">Powered by Dubai Oil Market</p>
      </div>
    </div>
  </div>
);

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <div className="mobile-app-frame">
        {showSplash ? (
          <SplashScreen />
        ) : (
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/EmailOTP" element={<VerifyEmail />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/plans" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
            <Route path="/active-plans" element={<ProtectedRoute><ActivePlans /></ProtectedRoute>} />
            <Route path="/complete-plans" element={<ProtectedRoute><CompletePlans /></ProtectedRoute>} />
            <Route path="/add-to-cart" element={<ProtectedRoute><AddToCart /></ProtectedRoute>} />
            <Route path="/collect-income" element={<ProtectedRoute><CollectIncome /></ProtectedRoute>} />
            <Route path="/crx-digital" element={<ProtectedRoute><CRXDigital /></ProtectedRoute>} />
            <Route path="/oil-trading" element={<ProtectedRoute><OilTrading /></ProtectedRoute>} />
            <Route path="/bonus" element={<ProtectedRoute><Bonus /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/depositconfirm" element={<ProtectedRoute><DepositConfirm /></ProtectedRoute>} />
            <Route path="/withdrawal" element={<ProtectedRoute><Withdrawal /></ProtectedRoute>} />
            <Route path="/withdrawconfirm" element={<ProtectedRoute><WithdrawConfirm /></ProtectedRoute>} />
            <Route path="/withdrawalhistory" element={<ProtectedRoute><WithdrawalHistory /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/deposithistory" element={<ProtectedRoute><DepositHistory /></ProtectedRoute>} />
            <Route path="/refferrals" element={<ProtectedRoute><Refferrals /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            
            {/* Admin Login Route */}
            <Route path="/admin-login" element={<AdminLogin />} />
            
            {/* Admin Protected Routes */}
            <Route path="/admin/addplans" element={<AdminProtectedRoute><AddPlan /></AdminProtectedRoute>} />
            <Route path="/admin/accounts" element={<AdminProtectedRoute><Accounts /></AdminProtectedRoute>} />
            <Route path="/admin/users" element={<AdminProtectedRoute><CheckUser /></AdminProtectedRoute>} />
            <Route path="/admin/" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/dashboard-image" element={<AdminProtectedRoute><DashboardImage /></AdminProtectedRoute>} />
            <Route path="/admin/crx" element={<AdminProtectedRoute><CrxSettings /></AdminProtectedRoute>} />
            <Route path="/admin/barrel" element={<AdminProtectedRoute><BarrelSettings /></AdminProtectedRoute>} />
            <Route path="/admin/notifications" element={<AdminProtectedRoute><BroadcastNotification /></AdminProtectedRoute>} />
            <Route path="/admin/accrual-history" element={<AdminProtectedRoute><AccrualHistory /></AdminProtectedRoute>} />
            <Route path="/check-deposits" element={<AdminProtectedRoute><CheckDeposits /></AdminProtectedRoute>} />
            <Route path="/check-withdrawals" element={<AdminProtectedRoute><CheckWithdrawals /></AdminProtectedRoute>} />
            <Route path="/admin/bonus" element={<AdminProtectedRoute><BonusGenerator /></AdminProtectedRoute>} />
          </Routes>
        )}

        <div className="app-social-fab-group" aria-label="Social links">
          <a
            className="app-social-fab app-facebook-fab"
            href="https://www.facebook.com/sharrul.bara"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Facebook"
          >
            <FontAwesomeIcon icon={faFacebookF} />
          </a>

          <a
            className="app-social-fab app-whatsapp-fab"
            href="https://chat.whatsapp.com/Eo0yBDib882CNoQTykUevc?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join WhatsApp group"
          >
            <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path d="M16 2.2C8.4 2.2 2.2 8.3 2.2 16c0 2.7.8 5.4 2.2 7.7L2 30l6.5-2.3c2.2 1.2 4.8 1.9 7.5 1.9 7.6 0 13.8-6.2 13.8-13.8S23.6 2.2 16 2.2zm0 25.2c-2.3 0-4.6-.7-6.5-2l-.5-.3-3.9 1.4 1.4-3.8-.3-.5c-1.3-2-2-4.3-2-6.7 0-6.5 5.3-11.7 11.7-11.7S27.6 9.3 27.6 15.8 22.4 27.4 16 27.4zm6.5-8.7c-.4-.2-2.3-1.1-2.6-1.3-.3-.1-.6-.2-.8.2-.2.4-.9 1.3-1.1 1.5-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.3-2.1-2.7-.2-.4 0-.6.2-.8.2-.2.4-.4.6-.6.2-.2.2-.4.3-.6.1-.2 0-.4-.1-.6-.1-.2-.8-2-1.2-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.1 1-1.1 2.4s1.1 2.9 1.3 3.1c.2.2 2.2 3.4 5.3 4.8.7.3 1.3.5 1.8.7.8.2 1.5.2 2.1.1.6-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.4-.2-.8-.4z" />
            </svg>
          </a>
        </div>
        
      </div>
    </BrowserRouter>
  );
}

export default App;