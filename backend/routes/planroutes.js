const express = require('express');
const router = express.Router();
const Plan = require('../models/plan');
const Wallet = require('../models/wallet');
const UserPlan = require('../models/userplan');
const User = require('../models/user');
const Notification = require('../models/notification');
const { adminPlans } = require('../controllers/plancontrollers');
const { createNotification } = require('../controllers/notificationcontrollers');
const verifyToken = require('../middleware/auth');

// GET active plans for users
router.get('/active', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const plans = await Plan.find({ status: 'active' }).sort({ createdAt: -1 });
    
    // Return data to match frontend expectations with user purchase count
    const transformedPlans = await Promise.all(plans.map(async (plan) => {
      // Count how many times this user has purchased this plan
      const purchaseCount = await UserPlan.countDocuments({
        userId: userId,
        planId: plan._id
      });

      return {
        _id: plan._id,
        name: plan.name,
        roi_percentage: plan.roi_percentage,
        duration_days: plan.duration_days,
        investment_amount: plan.investment_amount,
        daily_profit: plan.daily_profit,
        total_profit: plan.total_profit,
        status: plan.status,
        image_path: plan.image_path,
        purchase_limit: plan.purchase_limit,
        user_purchase_count: purchaseCount,
        countdown_hours: plan.countdown_hours,
        countdown_start_time: plan.countdown_start_time,
        countdown_end_time: plan.countdown_end_time
      };
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
        lastAccruedAt: new Date(),
        status: 'active'
      });

      await userPlan.save();

      // Update referral status to 'activated' if user was referred
      try {
        const User = require('../models/user');
        const Referral = require('../models/referral');
        const currentUser = await User.findById(userId);
        
        if (currentUser && currentUser.referredBy) {
          // Find the referrer
          const referrer = await User.findOne({ referralCode: currentUser.referredBy });
          if (referrer) {
            // Update referral status to activated
            await Referral.updateOne(
              { 
                referrer_id: referrer._id, 
                referred_user_id: userId,
                status: 'registered'
              },
              { $set: { status: 'activated' } }
            );
          }
        }
      } catch (refError) {
        console.error('Error updating referral status:', refError);
        // Don't fail the investment if referral update fails
      }

      // Create notification
      await createNotification(
        userId,
        'plan_activated',
        `You have successfully activated the ${plan.name} plan with $${plan.investment_amount} investment.`,
        plan.investment_amount,
        { planId: plan._id, userPlanId: userPlan._id }
      );

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
      status: { $in: ['active', 'paused', 'completed'] }
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
      image_path: userPlan.planId?.image_path,
      lastCollectTime: userPlan.lastCollectTime,
      accrualHistory: userPlan.accrualHistory || [],
      plan: {
        name: userPlan.planName,
        duration_days: userPlan.duration_days,
        image_path: userPlan.planId?.image_path
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

    // Create notification
    await createNotification(
      userId,
      'plan_paused',
      `Your ${userPlan.planName} plan has been paused. Daily accruals will resume when you reactivate it.`,
      0,
      { planId: userPlan._id }
    );

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

    // Create notification
    await createNotification(
      userId,
      'plan_resumed',
      `Your ${userPlan.planName} plan has been resumed. Daily accruals will continue.`,
      0,
      { planId: userPlan._id }
    );

    res.json({ message: 'Investment resumed successfully', plan: userPlan });
  } catch (error) {
    console.error('Error resuming investment:', error);
    res.status(500).json({ message: error.message });
  }
});
// POST collect daily income
router.post('/:planId/collect-income', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { planId } = req.params;

    const userPlan = await UserPlan.findOne({ _id: planId, userId: userId });
    if (!userPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (userPlan.status !== 'active') {
      return res.status(400).json({ message: 'Plan is not active' });
    }

    // Check if 24 hours have passed since last collection
    const now = new Date();
    const lastCollectTime = userPlan.lastCollectTime ? new Date(userPlan.lastCollectTime) : null;
    
    if (lastCollectTime) {
      const hoursPassed = (now - lastCollectTime) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        return res.status(400).json({ 
          message: `Please wait ${Math.ceil(24 - hoursPassed)} hours before collecting again`,
          hoursRemaining: Math.ceil(24 - hoursPassed)
        });
      }
    }

    // Collect daily profit
    const collectedAmount = userPlan.daily_profit || 0;
    
    // Update totalEarned
    userPlan.totalEarned = (userPlan.totalEarned || 0) + collectedAmount;
    
    // Update lastCollectTime
    userPlan.lastCollectTime = now;
    
    // Add to accrual history (if not already tracked)
    if (userPlan.accrualHistory) {
      userPlan.accrualHistory.push({
        timestamp: now,
        daysAccrued: 1,
        amountAdded: collectedAmount
      });
    }

    // Check if plan is completed
    if (userPlan.totalEarned >= userPlan.total_profit) {
      userPlan.status = 'completed';
    }

    await userPlan.save();

    // Credit wallet
    const Wallet = require('../models/wallet');
    await Wallet.updateOne(
      { userId: userId },
      { $inc: { main_balance: collectedAmount } },
      { upsert: true }
    );

    // Multi-Level Referral Commission System
    // Level 1: 10%, Level 2: 3%, Level 3: 1%
    try {
      const User = require('../models/user');
      const currentUser = await User.findById(userId);
      let commissionsDistributed = [];

      if (currentUser && currentUser.referredBy) {
        // Level 1: Direct Referrer - 10%
        const level1User = await User.findOne({ referralCode: currentUser.referredBy });
        if (level1User) {
          const level1Commission = collectedAmount * 0.10;
          await Wallet.updateOne(
            { userId: level1User._id },
            { $inc: { referral_balance: level1Commission } },
            { upsert: true }
          );
          commissionsDistributed.push({ level: 1, userId: level1User._id, amount: level1Commission });

          // Level 2: Who referred Level 1 - 3%
          if (level1User.referredBy) {
            const level2User = await User.findOne({ referralCode: level1User.referredBy });
            if (level2User) {
              const level2Commission = collectedAmount * 0.03;
              await Wallet.updateOne(
                { userId: level2User._id },
                { $inc: { referral_balance: level2Commission } },
                { upsert: true }
              );
              commissionsDistributed.push({ level: 2, userId: level2User._id, amount: level2Commission });

              // Level 3: Who referred Level 2 - 1%
              if (level2User.referredBy) {
                const level3User = await User.findOne({ referralCode: level2User.referredBy });
                if (level3User) {
                  const level3Commission = collectedAmount * 0.01;
                  await Wallet.updateOne(
                    { userId: level3User._id },
                    { $inc: { referral_balance: level3Commission } },
                    { upsert: true }
                  );
                  commissionsDistributed.push({ level: 3, userId: level3User._id, amount: level3Commission });
                }
              }
            }
          }
        }
      }
    } catch (commissionError) {
      console.error('Error distributing referral commissions:', commissionError);
      // Don't fail the income collection if commission distribution fails
    }

    // Create notification
    await createNotification(
      userId,
      'income_collected',
      `You collected $${collectedAmount.toFixed(2)} from ${userPlan.planName} plan.`,
      collectedAmount,
      { planId: userPlan._id }
    );

    res.json({ 
      message: 'Income collected successfully',
      collectedAmount: collectedAmount,
      totalEarned: userPlan.totalEarned,
      plan: userPlan
    });
  } catch (error) {
    console.error('Error collecting income:', error);
    res.status(500).json({ message: error.message });
  }
});
// Manual force-accrue endpoint (for testing/development)
router.post('/force-accrue', verifyToken, async (req, res) => {
  try {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const now = new Date();
    const activePlans = await UserPlan.find({ status: 'active' });
    let accrued = 0;
    let commissionsGiven = 0;

    for (const plan of activePlans) {
      const cutoff = plan.endDate && plan.endDate < now ? plan.endDate : now;
      const last = plan.lastAccruedAt || plan.investmentDate || now;
      let daysToAccrue = Math.floor((cutoff - last) / MS_PER_DAY);
      if (daysToAccrue <= 0) {
        if ((plan.totalEarned || 0) >= (plan.total_profit || 0) || now >= plan.endDate) {
          plan.status = 'completed';
          await plan.save();
        }
        continue;
      }

      const remainingProfit = (plan.total_profit || 0) - (plan.totalEarned || 0);
      const maxDaysByProfit = Math.floor(remainingProfit / (plan.daily_profit || 0));
      const actualDays = Math.min(daysToAccrue, Math.max(0, maxDaysByProfit));
      if (actualDays <= 0) {
        plan.status = 'completed';
        await plan.save();
        continue;
      }

      const increment = actualDays * (plan.daily_profit || 0);
      await Wallet.updateOne({ userId: plan.userId }, { $inc: { main_balance: increment } });
      plan.totalEarned = (plan.totalEarned || 0) + increment;
      plan.lastAccruedAt = new Date(last.getTime() + actualDays * MS_PER_DAY);
      plan.accrualHistory = plan.accrualHistory || [];
      plan.accrualHistory.push({ timestamp: new Date(), daysAccrued: actualDays, amountAdded: increment });

      if (plan.totalEarned >= plan.total_profit || plan.lastAccruedAt >= plan.endDate) {
        plan.status = 'completed';
      }
      await plan.save();
      accrued++;

      // Credit 10% commission to parent user (referrer)
      try {
        const childUser = await User.findById(plan.userId);
        if (childUser && childUser.referredBy) {
          const parentUser = await User.findOne({ referralCode: childUser.referredBy });
          if (parentUser) {
            const commission = increment * 0.10; // 10% of daily income
            await Wallet.updateOne(
              { userId: parentUser._id },
              { $inc: { referral_balance: commission } },
              { upsert: true }
            );
            commissionsGiven++;

            // Create notification for parent user
            await Notification.create({
              userId: parentUser._id,
              type: 'referral_earning',
              message: `You earned $${commission.toFixed(2)} (10% commission) from your referral's daily income.`,
              amount: commission
            });
          }
        }
      } catch (commissionError) {
        console.error('Error crediting commission for plan:', plan._id, commissionError);
      }
    }
    res.json({ 
      message: `Accrued profits for ${accrued} plans. Credited ${commissionsGiven} referral commissions.`, 
      count: accrued,
      commissionsGiven 
    });
  } catch (error) {
    console.error('Force accrue error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get accrual history for all active plans (admin endpoint)
router.get('/accrual-history', verifyToken, async (req, res) => {
  try {
    const plans = await UserPlan.find({ status: { $in: ['active', 'completed'] } })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    const summary = plans.map((plan) => ({
      _id: plan._id,
      userName: plan.userId?.name,
      userEmail: plan.userId?.email,
      planName: plan.planName,
      investmentAmount: plan.investment_amount,
      dailyProfit: plan.daily_profit,
      totalProfit: plan.total_profit,
      totalEarned: plan.totalEarned,
      status: plan.status,
      investmentDate: plan.investmentDate,
      endDate: plan.endDate,
      lastAccruedAt: plan.lastAccruedAt,
      accrualCount: (plan.accrualHistory || []).length,
      accrualHistory: plan.accrualHistory || []
    }));
    res.json(summary);
  } catch (error) {
    console.error('Accrual history fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin routes (existing functionality)
router.route('/admin')
  .get(adminPlans)
  .post(adminPlans);

module.exports = router;
