const Plan = require('../models/plan.js');

// 👉 GET ALL PLANS
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// 👉 CREATE PLAN
exports.createPlan = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// 👉 UPDATE PLAN (PATCH)
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      investment_amount,
      daily_profit,
      duration_days,
      status
    } = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Update fields if provided
    if (name) plan.name = name;
    if (investment_amount) plan.investment_amount = investment_amount;
    if (daily_profit) plan.daily_profit = daily_profit;
    if (duration_days) plan.duration_days = duration_days;
    if (status) plan.status = status;

    // Recalculate total profit and ROI if amounts or duration changed
    if (investment_amount || daily_profit || duration_days) {
      plan.total_profit = plan.daily_profit * plan.duration_days;
      plan.roi_percentage = Math.floor((plan.total_profit / plan.investment_amount) * 100 - 100);
    }

    await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// 👉 DELETE PLAN
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Legacy function for backward compatibility
exports.adminPlans = async (req, res) => {
  try {
    // 👉 CREATE PLAN (POST)
    if (req.method === 'POST') {
      return exports.createPlan(req, res);
    }

    // 👉 GET PLANS (GET)
    if (req.method === 'GET') {
      return exports.getPlans(req, res);
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
