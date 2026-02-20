import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Registration from './components/registration'; // Make sure this file exists
import Dashboard from './components/dashboard';
import Plan from './components/plans';
import Deposit  from './components/deposit';
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
import AddPlan from './components/admin/addplans';
import Accounts from './components/admin/accounts';
import AdminDashboard from './components/admin/admindashboard';
import CheckDeposits from './components/admin/checkdeposits';
import CheckWithdrawals from './components/admin/checkwithdrawals';
import CheckUser from './components/admin/checkusers';
import AccrualHistory from './components/admin/accrualhistory';
import BonusGenerator from './components/admin/bonus';
import DashboardImage from './components/admin/dashboardimage';
import ActivePlans from './components/ActivePlans';
import CollectIncome from './components/CollectIncome';
import Notifications from './components/notifications';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/EmailOTP" element={<VerifyEmail />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
        <Route path="/active-plans" element={<ProtectedRoute><ActivePlans /></ProtectedRoute>} />
        <Route path="/collect-income" element={<ProtectedRoute><CollectIncome /></ProtectedRoute>} />
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
        <Route path="/admin/addplans" element={<ProtectedRoute><AddPlan /></ProtectedRoute>} />
        <Route path="/admin/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><CheckUser /></ProtectedRoute>} />
        <Route path="/admin/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard-image" element={<ProtectedRoute><DashboardImage /></ProtectedRoute>} />
        <Route path="/admin/accrual-history" element={<ProtectedRoute><AccrualHistory /></ProtectedRoute>} />
        <Route path="/check-deposits" element={<ProtectedRoute><CheckDeposits /></ProtectedRoute>} />
        <Route path="/check-withdrawals" element={<ProtectedRoute><CheckWithdrawals /></ProtectedRoute>} />
        <Route path="/admin/bonus" element={<ProtectedRoute><BonusGenerator /></ProtectedRoute>} />
      </Routes>
      
      
    </BrowserRouter>
  );
}

export default App;