const express = require('express');
const router = express.Router();
const depositControllers = require('../controllers/depositcontrollers');
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/deposits/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Routes
router.post('/create', verifyToken, upload.single('screenshot'), depositControllers.createDeposit);
router.get('/all', verifyToken, depositControllers.getAllDeposits);
router.get('/my-deposits', verifyToken, depositControllers.getUserDeposits);
router.put('/approve/:depositId', verifyToken, depositControllers.approveDeposit);
router.put('/reject/:depositId', verifyToken, depositControllers.rejectDeposit);

module.exports = router;
