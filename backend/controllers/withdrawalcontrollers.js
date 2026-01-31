const Withdrawal = require('../models/withdrawal');
const Wallet = require('../models/wallet');
const User = require('../models/user');
const { createNotification } = require('./notificationcontrollers');

// Create withdrawal request
exports.createWithdrawal = async (req, res) => {
  try {
    const { amount, method, account_number, mobile_number } = req.body;
    const userId = req.user.userId || req.user.id || req.user._id;

    console.log('Withdrawal create - Token user:', req.user);
    console.log('Withdrawal create - Extracted userId:', userId);

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    // Validate minimum withdrawal
    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum withdrawal is Rs 100' });
    }

    if (!method || !account_number || !mobile_number) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user has sufficient balance (total balance)
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(400).json({ message: 'Wallet not found' });
    }
    
    const totalBalance = (wallet.main_balance || 0) + (wallet.referral_balance || 0) + (wallet.bonus_balance || 0);
    if (totalBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const withdrawal = new Withdrawal({
      userId,
      amount: parseFloat(amount),
      method,
      account_number,
      mobile_number
    });

    await withdrawal.save();
    
    // Create notification for withdrawal request
    await createNotification(
      userId,
      'withdrawal_request_sent',
      `Your withdrawal request of Rs ${amount} via ${method} has been submitted for processing.`,
      amount,
      { withdrawalId: withdrawal._id }
    );

    res.status(201).json({ 
      message: 'Withdrawal request submitted successfully',
      withdrawal 
    });
  } catch (err) {
    console.error('Withdrawal create error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all withdrawals (Admin)
exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'name email')
      .sort({ created_at: -1 });
    
    res.status(200).json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's withdrawals
exports.getUserWithdrawals = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const withdrawals = await Withdrawal.find({ userId }).sort({ created_at: -1 });
    
    res.status(200).json(withdrawals);
  } catch (err) {
    console.error('Get user withdrawals error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Approve withdrawal
exports.approveWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    // Get withdrawal details
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }

    const { userId, amount } = withdrawal;

    // Deduct from wallet (total balance)
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const totalBalance = (wallet.main_balance || 0) + (wallet.referral_balance || 0) + (wallet.bonus_balance || 0);
    if (totalBalance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from balances in order: referral -> bonus -> main
    let remaining = amount;
    
    if (wallet.referral_balance > 0) {
      const deductFromReferral = Math.min(wallet.referral_balance, remaining);
      wallet.referral_balance -= deductFromReferral;
      remaining -= deductFromReferral;
    }
    
    if (remaining > 0 && wallet.bonus_balance > 0) {
      const deductFromBonus = Math.min(wallet.bonus_balance, remaining);
      wallet.bonus_balance -= deductFromBonus;
      remaining -= deductFromBonus;
    }
    
    if (remaining > 0) {
      wallet.main_balance -= remaining;
    }
    
    await wallet.save();

    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.approved_at = new Date();
    await withdrawal.save();

    // Create notification
    await createNotification(
      userId,
      'withdrawal_approved',
      `Your withdrawal of Rs ${amount} has been approved and processed.`,
      amount,
      { withdrawalId: withdrawal._id }
    );

    res.status(200).json({ 
      message: 'Withdrawal approved successfully',
      withdrawal,
      wallet
    });
  } catch (err) {
    console.error('Approve withdrawal error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Reject withdrawal
exports.rejectWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }

    withdrawal.status = 'rejected';
    await withdrawal.save();

    // Create notification
    await createNotification(
      withdrawal.userId,
      'withdrawal_rejected',
      `Your withdrawal request of Rs ${withdrawal.amount} has been rejected.`,
      withdrawal.amount,
      { withdrawalId: withdrawal._id }
    );

    res.status(200).json({ 
      message: 'Withdrawal rejected',
      withdrawal
    });
  } catch (err) {
    console.error('Reject withdrawal error:', err);
    res.status(500).json({ message: err.message });
  }
};
