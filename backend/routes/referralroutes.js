const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Referral = require('../models/referral');
const UserPlan = require('../models/userplan');
const verifyToken = require('../middleware/auth');

const REFERRAL_BONUS_AMOUNT = 3;

const getActiveUncollectedReferrals = async (referrerId) => {
  const referrals = await Referral.find({ referrer_id: referrerId, bonusCollected: false })
    .populate('referred_user_id', 'name email');

  const eligible = [];

  for (const referral of referrals) {
    const hasActivePlan = await UserPlan.exists({
      userId: referral.referred_user_id?._id || referral.referred_user_id,
      status: { $in: ['active', 'paused', 'completed'] }
    });

    if (hasActivePlan) {
      if (referral.status !== 'activated') {
        referral.status = 'activated';
        await referral.save();
      }
      eligible.push(referral);
    }
  }

  return eligible;
};

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

    // Get all referrals for this user
    const referrals = await Referral.find({ referrer_id: userId });
    const totalReferrals = referrals.length;

    // Check which referred users have activated plans
    let activeReferralsCount = 0;
    
    for (const referral of referrals) {
      // Check if the referred user has any active plans
      const hasActivePlan = await UserPlan.exists({
        userId: referral.referred_user_id,
        status: { $in: ['active', 'paused', 'completed'] }
      });

      if (hasActivePlan) {
        activeReferralsCount++;
        
        // Update referral status to 'activated' if not already
        if (referral.status !== 'activated') {
          referral.status = 'activated';
          await referral.save();
        }
      }
    }

    res.json({ 
      totalReferrals, 
      activeReferrals: activeReferralsCount 
    });
  } catch (error) {
    console.error('Referral stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET list of all referrals with their status
router.get('/list', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Get all referrals for this user and populate user details
    const referrals = await Referral.find({ referrer_id: userId })
      .populate('referred_user_id', 'name email')
      .sort({ created_at: -1 });

    // Check activation status for each referral
    const referralsList = await Promise.all(
      referrals.map(async (referral) => {
        // Check if the referred user has any plans
        const hasActivePlan = await UserPlan.exists({
          userId: referral.referred_user_id._id,
          status: { $in: ['active', 'paused', 'completed'] }
        });

        return {
          _id: referral._id,
          name: referral.referred_user_id.name,
          email: referral.referred_user_id.email,
          status: hasActivePlan ? 'activated' : 'registered',
          joinedDate: referral.created_at
        };
      })
    );

    res.json(referralsList);
  } catch (error) {
    console.error('Referral list error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET collectible referral bonuses (active referrals not yet collected)
router.get('/collectible', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const collectibleReferrals = await getActiveUncollectedReferrals(userId);

    res.json({
      count: collectibleReferrals.length,
      totalAmount: collectibleReferrals.length * REFERRAL_BONUS_AMOUNT,
      referrals: collectibleReferrals.map(ref => ({
        _id: ref._id,
        name: ref.referred_user_id.name,
        email: ref.referred_user_id.email,
        bonus: REFERRAL_BONUS_AMOUNT
      }))
    });
  } catch (error) {
    console.error('Collectible referrals error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST collect referral bonuses
router.post('/collect-bonus', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const collectibleReferrals = await getActiveUncollectedReferrals(userId);

    if (collectibleReferrals.length === 0) {
      return res.status(400).json({ message: 'No bonuses to collect' });
    }

    const eligibleIds = collectibleReferrals.map((ref) => ref._id);

    // Mark only currently uncollected eligible referrals as collected
    const updateResult = await Referral.updateMany(
      {
        _id: { $in: eligibleIds },
        bonusCollected: false
      },
      { $set: { bonusCollected: true } }
    );

    const collectedCount = updateResult.modifiedCount || 0;
    const totalBonus = collectedCount * REFERRAL_BONUS_AMOUNT;

    if (collectedCount === 0) {
      return res.status(400).json({ message: 'No bonuses to collect' });
    }

    // Add to wallet bonus balance
    const Wallet = require('../models/wallet');
    await Wallet.updateOne(
      { userId: userId },
      { $inc: { bonus_balance: totalBonus } },
      { upsert: true }
    );

    res.json({
      message: `Collected AED ${totalBonus.toFixed(2)} from ${collectedCount} active referrals`,
      collected: collectedCount,
      totalAmount: totalBonus
    });
  } catch (error) {
    console.error('Collect bonus error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
