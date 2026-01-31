const express = require('express');
const router = express.Router();
const bonusController = require('../controllers/bonuscodecontrollers');
const authMiddleware = require('../middleware/auth');

// Admin routes - generate bonus code
router.post('/generate', authMiddleware, bonusController.generateBonusCode);

// User routes - redeem bonus code
router.post('/redeem', authMiddleware, bonusController.redeemBonusCode);

// Admin routes - get all bonus codes
router.get('/all', authMiddleware, bonusController.getAllBonusCodes);

// Admin routes - get specific bonus code details
router.get('/:code', authMiddleware, bonusController.getBonusCodeDetails);

module.exports = router;
