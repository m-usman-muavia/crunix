const Plan = require('../models/plan.js');

exports.adminPlans = async (req, res) => {
  try {
    // 👉 CREATE PLAN (POST)
    if (req.method === 'POST') {
      const {
        name,
        investment_amount,
        daily_profit,
        duration_days,
        status
      } = req.body;

      const total_profit = daily_profit * duration_days;
      const roi_percentage =
        Math.floor((total_profit / investment_amount) * 100 - 100);

      const planData = {
        name,
        investment_amount,
        daily_profit,
        duration_days,
        total_profit,
        roi_percentage,
        status
      };

      const newPlan = new Plan(planData);
      await newPlan.save();

      return res.status(201).json({
        success: true,
        message: 'Plan created successfully',
        data: newPlan
      });
    }

    // 👉 GET PLANS (GET)
    if (req.method === 'GET') {
      const plans = await Plan.find().sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: plans
      });
    }

    // 👉 Method not allowed
    res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
