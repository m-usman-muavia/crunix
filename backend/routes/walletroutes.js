const express = require('express');
const router = express.Router();
const Wallet = require('../models/wallet');
const verifyToken = require('../middleware/auth');

// GET user's wallet balance
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    
    console.log('Wallet fetch - Token user:', req.user);
    console.log('Wallet fetch - Extracted userId:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    
    let wallet = await Wallet.findOne({ userId });
    
    // If wallet doesn't exist, create one with default values
    if (!wallet) {
      console.log('Creating new wallet for user:', userId);
      wallet = new Wallet({
        userId,
        main_balance: 0,
        bonus_balance: 0,
        referral_balance: 0
      });
      await wallet.save();
    }
    
    res.json({
      _id: wallet._id,
      main_balance: wallet.main_balance || 0,
      bonus_balance: wallet.bonus_balance || 0,
      referral_balance: wallet.referral_balance || 0,
      total_balance: (wallet.main_balance || 0) + (wallet.bonus_balance || 0) + (wallet.referral_balance || 0)
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
