const express = require('express');
const router = express.Router();
const Plan = require('../models/plan');
const Wallet = require('../models/wallet');
const UserPlan = require('../models/userplan');
const { adminPlans } = require('../controllers/plancontrollers');
const verifyToken = require('../middleware/auth');

// GET active plans for users
router.get('/active', async (req, res) => {
  try {
    const plans = await Plan.find({ status: 'active' }).sort({ createdAt: -1 });
    
    // Return data to match frontend expectations
    const transformedPlans = plans.map(plan => ({
      _id: plan._id,
      name: plan.name,
      roi_percentage: plan.roi_percentage,
      duration_days: plan.duration_days,
      investment_amount: plan.investment_amount,
      daily_profit: plan.daily_profit,
      total_profit: plan.total_profit,
      status: plan.status
    }));
    
    res.json(transformedPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST invest-now endpoint
router.post('/invest-now', verifyToken, async (req, res) => {
  try {
    const { planId, confirm } = req.body;
    const userId = req.user.userId || req.user.id;

    // Find the plan
    const plan = await Plan.findById(planId);
    if (!plan || plan.status !== 'active') {
      return res.status(404).json({ message: 'Plan not found or not active' });
    }

    // Find user's wallet
    const wallet = await Wallet.findOne({ userId: userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if user has sufficient balance
    if (wallet.main_balance < plan.investment_amount) {
      return res.status(400).json({ 
        message: 'Insufficient balance',
        required: plan.investment_amount,
        available: wallet.main_balance
      });
    }

    // If confirm is true, create the investment
    if (confirm) {
      // Deduct from wallet
      wallet.main_balance -= plan.investment_amount;
      await wallet.save();

      // Calculate end date
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);

      // Create UserPlan entry
      const userPlan = new UserPlan({
        userId: userId,
        planId: plan._id,
        planName: plan.name,
        investment_amount: plan.investment_amount,
        daily_profit: plan.daily_profit,
        total_profit: plan.total_profit,
        duration_days: plan.duration_days,
        endDate: endDate,
        status: 'active'
      });

      await userPlan.save();

      return res.status(201).json({
        message: 'Investment successful',
        investment: userPlan,
        newBalance: wallet.main_balance
      });
    }

    // Return success with plan details for validation
    res.status(200).json({ 
      message: 'Investment validated successfully',
      plan: {
        _id: plan._id,
        name: plan.name,
        investment_amount: plan.investment_amount,
        daily_profit: plan.daily_profit,
        total_profit: plan.total_profit,
        duration_days: plan.duration_days
      },
      balance: wallet.main_balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET user's active investments
router.get('/user/active', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const userPlans = await UserPlan.find({ 
      userId: userId,
      status: { $in: ['active', 'paused'] }
    })
    .populate('planId')
    .sort({ createdAt: -1 });

    const formattedPlans = userPlans.map(userPlan => ({
      _id: userPlan._id,
      planName: userPlan.planName,
      investmentAmount: userPlan.investment_amount,
      dailyProfit: userPlan.daily_profit,
      totalProfit: userPlan.total_profit,
      duration_days: userPlan.duration_days,
      investmentDate: userPlan.investmentDate,
      endDate: userPlan.endDate,
      currentEarnings: userPlan.totalEarned,
      status: userPlan.status,
      plan: {
        name: userPlan.planName,
        duration_days: userPlan.duration_days
      }
    }));

    res.json(formattedPlans);
  } catch (error) {
    console.error('Error fetching user plans:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT pause investment
router.put('/:planId/pause', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { planId } = req.params;

    const userPlan = await UserPlan.findOne({ _id: planId, userId: userId });
    if (!userPlan) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (userPlan.status !== 'active') {
      return res.status(400).json({ message: 'Can only pause active investments' });
    }

    userPlan.status = 'paused';
    await userPlan.save();

    res.json({ message: 'Investment paused successfully', plan: userPlan });
  } catch (error) {
    console.error('Error pausing investment:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT resume investment
router.put('/:planId/resume', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { planId } = req.params;

    const userPlan = await UserPlan.findOne({ _id: planId, userId: userId });
    if (!userPlan) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (userPlan.status !== 'paused') {
      return res.status(400).json({ message: 'Can only resume paused investments' });
    }

    userPlan.status = 'active';
    await userPlan.save();

    res.json({ message: 'Investment resumed successfully', plan: userPlan });
  } catch (error) {
    console.error('Error resuming investment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin routes (existing functionality)
router.route('/admin')
  .get(adminPlans)
  .post(adminPlans);

module.exports = router;
