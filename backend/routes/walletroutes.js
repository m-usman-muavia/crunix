const express = require('express');
const router = express.Router();
const Wallet = require('../models/wallet');

// GET user's wallet balance
router.get('/balance', async (req, res) => {
  try {
    // Get userId from auth token (you'll need to implement auth middleware)
    // For now, assuming userId is passed in the request
    const userId = req.userId; // Set by auth middleware
    
    const wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    res.json({
      main_balance: wallet.main_balance,
      bonus_balance: wallet.bonus_balance,
      referral_balance: wallet.referral_balance,
      total_balance: wallet.main_balance + wallet.bonus_balance + wallet.referral_balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
