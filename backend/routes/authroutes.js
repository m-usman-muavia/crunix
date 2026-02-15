const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { register, login, verifyOTP, getAdminAccounts, addAdminAccount, updateAdminAccount, deleteAdminAccount, changePassword, forgotPassword, verifyForgotOTP, resetPassword, getAdminUsersWithReferrals } = require('../controllers/authcontrollers');
const { adminPlans, updateAdminPlan, deleteAdminPlan } = require('../controllers/plancontrollers');
const verifyToken = require('../middleware/auth');

// Setup multer for plan image uploads (memory storage for Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });

// Setup multer for account QR uploads
const accountStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/accounts/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const accountUpload = multer({ storage: accountStorage });

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
  .post(upload.single('image'), adminPlans);

router.route('/adminplans/:id')
  .patch(upload.single('image'), updateAdminPlan)
  .delete(deleteAdminPlan);

router.route('/adminaccounts')
  .get(getAdminAccounts)
  .post(accountUpload.single('qr_image'), addAdminAccount);

router.route('/adminaccounts/:id')
  .patch(accountUpload.single('qr_image'), updateAdminAccount)
  .delete(deleteAdminAccount);
  

module.exports = router;