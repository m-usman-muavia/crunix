const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, getAdminAccounts, addAdminAccount, updateAdminAccount, deleteAdminAccount, changePassword, forgotPassword, verifyForgotOTP, resetPassword, getAdminUsersWithReferrals } = require('../controllers/authcontrollers');
const { adminPlans, updateAdminPlan, deleteAdminPlan } = require('../controllers/plancontrollers');
const verifyToken = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/change-password', verifyToken, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-otp', verifyForgotOTP);
router.post('/reset-password', resetPassword);
router.get('/admin/users', verifyToken, getAdminUsersWithReferrals);

router.route('/adminplans')
  .get(adminPlans)
  .post(adminPlans);

router.route('/adminplans/:id')
  .patch(updateAdminPlan)
  .delete(deleteAdminPlan);

router.route('/adminaccounts')
  .get(getAdminAccounts)
  .post(addAdminAccount);

router.route('/adminaccounts/:id')
  .patch(updateAdminAccount)
  .delete(deleteAdminAccount);
  

module.exports = router;