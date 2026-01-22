const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, getAdminAccounts, addAdminAccount, updateAdminAccount, deleteAdminAccount, changePassword, forgotPassword, verifyForgotOTP, resetPassword } = require('../controllers/authcontrollers');
const { adminPlans } = require('../controllers/plancontrollers');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/change-password', verifyToken, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-otp', verifyForgotOTP);
router.post('/reset-password', resetPassword);

router.route('/adminplans')
  .get(adminPlans)
  .post(adminPlans);

router.route('/adminaccounts')
  .get(getAdminAccounts)
  .post(addAdminAccount);

router.route('/adminaccounts/:id')
  .patch(updateAdminAccount)
  .delete(deleteAdminAccount);
  

module.exports = router;