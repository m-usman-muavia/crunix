import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Registration from './components/registration'; // Make sure this file exists
import Dashboard from './components/dashboard';
import Plan from './components/plans';
import Deposit  from './components/deposit';
import Withdrawal from './components/withdrawal';
import Refferrals from './components/refferrals';
import Profile from './components/profile';
import VerifyEmail from './components/EmailOTP';
import ForgotPassword from './components/forgotpassword';
import ProtectedRoute from './components/protectedroute';
import AddPlan from './components/admin/addplans';
import Accounts from './components/admin/accounts';
import AdminDashboard from './components/admin/admindashboard';

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
        <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
        <Route path="/withdrawal" element={<ProtectedRoute><Withdrawal /></ProtectedRoute>} />
        <Route path="/refferrals" element={<ProtectedRoute><Refferrals /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin/addplans" element={<ProtectedRoute><AddPlan /></ProtectedRoute>} />
        <Route path="/admin/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
        <Route path="/admin/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
      
      
    </BrowserRouter>
  );
}

export default App;