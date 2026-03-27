const Plan = require('../models/plan.js');
const fs = require('fs');
const { uploadBuffer, deleteByPublicId } = require('../config/cloudinary');

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
};

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
      status,
      purchase_limit,
      countdown_hours,
      category
    } = req.body;

    const investmentAmountNum = toNumber(investment_amount);
    const dailyProfitNum = toNumber(daily_profit);
    const durationDaysNum = toNumber(duration_days);
    const purchaseLimitNum = purchase_limit === undefined || purchase_limit === '' ? 0 : toNumber(purchase_limit);
    const countdownHoursNum = countdown_hours === undefined || countdown_hours === '' ? null : toNumber(countdown_hours);

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    if (!Number.isFinite(investmentAmountNum) || investmentAmountNum <= 0) {
      return res.status(400).json({ success: false, message: 'Valid investment amount is required' });
    }

    if (!Number.isFinite(dailyProfitNum) || dailyProfitNum <= 0) {
      return res.status(400).json({ success: false, message: 'Valid daily profit is required' });
    }

    if (!Number.isFinite(durationDaysNum) || durationDaysNum <= 0) {
      return res.status(400).json({ success: false, message: 'Valid duration days is required' });
    }

    if (!Number.isFinite(purchaseLimitNum) || purchaseLimitNum < 0) {
      return res.status(400).json({ success: false, message: 'Purchase limit must be 0 or greater' });
    }

    if (countdownHoursNum !== null && (!Number.isFinite(countdownHoursNum) || countdownHoursNum < 0)) {
      return res.status(400).json({ success: false, message: 'Countdown hours must be 0 or greater' });
    }

    const total_profit = dailyProfitNum * durationDaysNum;
    const roi_percentage = Math.floor((total_profit / investmentAmountNum) * 100 - 100);

    let imagePath = '';
    let imagePublicId = '';

    if (req.file) {
      const uploadResult = await uploadBuffer(req.file.buffer, {
        folder: 'plans'
      });
      imagePath = uploadResult.secure_url || '';
      imagePublicId = uploadResult.public_id || '';
    }

    const planData = {
      name,
      investment_amount: investmentAmountNum,
      daily_profit: dailyProfitNum,
      duration_days: durationDaysNum,
      total_profit,
      roi_percentage,
      status,
      category: category || 'Premium Plan',
      image_path: imagePath,
      image_public_id: imagePublicId,
      purchase_limit: purchaseLimitNum
    };

    // Handle countdown timer
    if (countdownHoursNum && countdownHoursNum > 0) {
      const now = new Date();
      planData.countdown_hours = countdownHoursNum;
      planData.countdown_start_time = now;
      planData.countdown_end_time = new Date(now.getTime() + countdownHoursNum * 60 * 60 * 1000);
    }

    const newPlan = new Plan(planData);
    await newPlan.save();

    return res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: newPlan
    });
  } catch (error) {
    const statusCode = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Server error',
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
      status,
      purchase_limit,
      countdown_hours,
      category
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
    if (investment_amount !== undefined) {
      const investmentAmountNum = toNumber(investment_amount);
      if (!Number.isFinite(investmentAmountNum) || investmentAmountNum <= 0) {
        return res.status(400).json({ success: false, message: 'Valid investment amount is required' });
      }
      plan.investment_amount = investmentAmountNum;
    }

    if (daily_profit !== undefined) {
      const dailyProfitNum = toNumber(daily_profit);
      if (!Number.isFinite(dailyProfitNum) || dailyProfitNum <= 0) {
        return res.status(400).json({ success: false, message: 'Valid daily profit is required' });
      }
      plan.daily_profit = dailyProfitNum;
    }

    if (duration_days !== undefined) {
      const durationDaysNum = toNumber(duration_days);
      if (!Number.isFinite(durationDaysNum) || durationDaysNum <= 0) {
        return res.status(400).json({ success: false, message: 'Valid duration days is required' });
      }
      plan.duration_days = durationDaysNum;
    }
    if (status) plan.status = status;
    if (category) plan.category = category;
    if (purchase_limit !== undefined) {
      const purchaseLimitNum = toNumber(purchase_limit);
      if (!Number.isFinite(purchaseLimitNum) || purchaseLimitNum < 0) {
        return res.status(400).json({ success: false, message: 'Purchase limit must be 0 or greater' });
      }
      plan.purchase_limit = purchaseLimitNum;
    }
    
    // Handle countdown timer
    if (countdown_hours !== undefined) {
      const countdownHoursNum = toNumber(countdown_hours);
      if (!Number.isFinite(countdownHoursNum) || countdownHoursNum < 0) {
        return res.status(400).json({ success: false, message: 'Countdown hours must be 0 or greater' });
      }

      if (countdownHoursNum > 0) {
        const now = new Date();
        plan.countdown_hours = countdownHoursNum;
        plan.countdown_start_time = now;
        plan.countdown_end_time = new Date(now.getTime() + countdownHoursNum * 60 * 60 * 1000);
      } else {
        // Clear countdown if 0 or empty
        plan.countdown_hours = null;
        plan.countdown_start_time = null;
        plan.countdown_end_time = null;
      }
    }
    
    // Handle image update
    if (req.file) {
      if (plan.image_public_id) {
        await deleteByPublicId(plan.image_public_id);
      } else if (plan.image_path && fs.existsSync(plan.image_path)) {
        fs.unlinkSync(plan.image_path);
      }

      const uploadResult = await uploadBuffer(req.file.buffer, {
        folder: 'plans'
      });

      plan.image_path = uploadResult.secure_url || '';
      plan.image_public_id = uploadResult.public_id || '';
    }

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
    const statusCode = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Server error',
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
    
    // Delete image file if exists
    if (plan.image_public_id) {
      await deleteByPublicId(plan.image_public_id);
    } else if (plan.image_path && fs.existsSync(plan.image_path)) {
      fs.unlinkSync(plan.image_path);
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

// 👉 ADMIN PLAN UPDATE (PATCH) - Alias for updatePlan
exports.updateAdminPlan = exports.updatePlan;

// 👉 ADMIN PLAN DELETE - Alias for deletePlan
exports.deleteAdminPlan = exports.deletePlan;
