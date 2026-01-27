const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Referral = require('../models/referral');
const verifyToken = require('../middleware/auth');

// GET user's referral code
router.get('/code', verifyToken, async (req, res) => {
  try {
    // Get userId from auth token
    const userId = req.user.id || req.user.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      referralCode: user.referralCode || user._id.toString().slice(-8).toUpperCase()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET referral stats for current user
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const totalReferrals = await Referral.countDocuments({ referrer_id: userId });
    const activeReferrals = await Referral.countDocuments({
      referrer_id: userId,
      status: { $in: ['completed', 'activated'] }
    });

    res.json({ totalReferrals, activeReferrals });
  } catch (error) {
    console.error('Referral stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
