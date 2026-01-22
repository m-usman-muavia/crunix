const express = require('express');
const router = express.Router();
const Plan = require('../models/plan');
const { adminPlans } = require('../controllers/plancontrollers');

// GET active plans for users
router.get('/active', async (req, res) => {
  try {
    const plans = await Plan.find({ status: 'active' }).sort({ createdAt: -1 });
    
    // Transform data to match frontend expectations
    const transformedPlans = plans.map(plan => ({
      _id: plan._id,
      title: plan.name,
      percentage: `${plan.roi_percentage}%`,
      duration: `${plan.duration_days} Days`,
      investment: plan.investment_amount,
      dailyIncome: plan.daily_profit,
      totalReturn: plan.total_profit,
      status: plan.status
    }));
    
    res.json(transformedPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes (existing functionality)
router.route('/admin')
  .get(adminPlans)
  .post(adminPlans);

module.exports = router;
