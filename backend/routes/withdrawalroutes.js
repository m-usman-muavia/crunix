const express = require('express');
const router = express.Router();
const withdrawalControllers = require('../controllers/withdrawalcontrollers');
const verifyToken = require('../middleware/auth');

// Routes
router.post('/create', verifyToken, withdrawalControllers.createWithdrawal);
router.get('/all', verifyToken, withdrawalControllers.getAllWithdrawals);
router.get('/my-withdrawals', verifyToken, withdrawalControllers.getUserWithdrawals);
router.get('/total', verifyToken, withdrawalControllers.getTotalWithdrawn);
router.put('/approve/:withdrawalId', verifyToken, withdrawalControllers.approveWithdrawal);
router.put('/reject/:withdrawalId', verifyToken, withdrawalControllers.rejectWithdrawal);

module.exports = router;
