const express = require('express');
const router = express.Router();
const User = require('../models/user');

// GET user's referral code
router.get('/code', async (req, res) => {
  try {
    // Get userId from auth token (you'll need to implement auth middleware)
    // For now, assuming userId is passed in the request
    const userId = req.userId; // Set by auth middleware
    
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
