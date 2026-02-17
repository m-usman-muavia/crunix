const Plan = require('../models/plan.js');
const fs = require('fs');
const { uploadBuffer, deleteByPublicId } = require('../config/cloudinary');

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
      countdown_hours
    } = req.body;

    const total_profit = daily_profit * duration_days;
    const roi_percentage =
      Math.floor((total_profit / investment_amount) * 100 - 100);

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
      investment_amount,
      daily_profit,
      duration_days,
      total_profit,
      roi_percentage,
      status,
      image_path: imagePath,
      image_public_id: imagePublicId,
      purchase_limit: purchase_limit || 0
    };

    // Handle countdown timer
    if (countdown_hours && countdown_hours > 0) {
      const now = new Date();
      planData.countdown_hours = countdown_hours;
      planData.countdown_start_time = now;
      planData.countdown_end_time = new Date(now.getTime() + countdown_hours * 60 * 60 * 1000);
    }

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
      status,
      purchase_limit,
      countdown_hours
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
    if (purchase_limit !== undefined) plan.purchase_limit = purchase_limit;
    
    // Handle countdown timer
    if (countdown_hours !== undefined) {
      if (countdown_hours && countdown_hours > 0) {
        const now = new Date();
        plan.countdown_hours = countdown_hours;
        plan.countdown_start_time = now;
        plan.countdown_end_time = new Date(now.getTime() + countdown_hours * 60 * 60 * 1000);
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
