const Withdrawal = require('../models/withdrawal');
const Wallet = require('../models/wallet');
const User = require('../models/user');

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

    // Check if user has sufficient balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.main_balance < amount) {
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

    // Deduct from wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.main_balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    wallet.main_balance -= amount;
    await wallet.save();

    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.approved_at = new Date();
    await withdrawal.save();

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

    res.status(200).json({ 
      message: 'Withdrawal rejected',
      withdrawal
    });
  } catch (err) {
    console.error('Reject withdrawal error:', err);
    res.status(500).json({ message: err.message });
  }
};
