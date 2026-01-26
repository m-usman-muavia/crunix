const express = require('express');
const router = express.Router();
const User = require('../models/user');
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

module.exports = router;
