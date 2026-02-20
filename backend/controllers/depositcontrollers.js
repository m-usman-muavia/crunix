const Deposit = require('../models/deposit');
const Wallet = require('../models/wallet');
const User = require('../models/user');
const { createNotification } = require('./notificationcontrollers');
const fs = require('fs');
const path = require('path');

// Create deposit request
exports.createDeposit = async (req, res) => {
  try {
    const { deposit_amount, sender_mobile, transaction_id } = req.body;
    const userId = req.user.userId || req.user.id || req.user._id;

    console.log('Deposit create - Token user:', req.user);
    console.log('Deposit create - Extracted userId:', userId);

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    if (!deposit_amount || !sender_mobile || !transaction_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Screenshot is required' });
    }

    const existingDeposit = await Deposit.findOne({ transaction_id });
    if (existingDeposit) {
      return res.status(400).json({
        message: 'Please have patience, Your deposit is already in process.'
      });
    }

    const screenshot_path = req.file.path;

    const deposit = new Deposit({
      userId,
      deposit_amount: parseFloat(deposit_amount),
      sender_mobile,
      transaction_id,
      screenshot_path
    });

    await deposit.save();
    
    // Create notification for deposit request
    await createNotification(
      userId,
      'deposit_request_sent',
      `Your deposit request of $${deposit_amount} has been sent for verification. Your transaction ID is ${transaction_id}.`,
      deposit_amount,
      { depositId: deposit._id }
    );

    res.status(201).json({ 
      message: 'Deposit request submitted successfully',
      deposit 
    });
  } catch (err) {
    console.error('Deposit create error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all deposits (Admin)
exports.getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate('userId', 'name email')
      .sort({ created_at: -1 });
    
    res.status(200).json(deposits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's deposits
exports.getUserDeposits = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const deposits = await Deposit.find({ userId }).sort({ created_at: -1 });
    
    res.status(200).json(deposits);
  } catch (err) {
    console.error('Get user deposits error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Approve deposit
exports.approveDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;

    // Get deposit details
    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }

    const { userId, deposit_amount } = deposit;

    // Update wallet balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    wallet.main_balance += deposit_amount;
    await wallet.save();

    // Update deposit status
    deposit.status = 'approved';
    deposit.approved_at = new Date();
    await deposit.save();

    // Create notification
    await createNotification(
      userId,
      'deposit_approved',
      `Your deposit of $${deposit_amount} has been approved and added to your wallet.`,
      deposit_amount,
      { depositId: deposit._id }
    );

    res.status(200).json({ 
      message: 'Deposit approved successfully',
      deposit,
      wallet
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject deposit
exports.rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { reason } = req.body;

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }

    deposit.status = 'rejected';
    await deposit.save();

    // Create notification
    await createNotification(
      deposit.userId,
      'deposit_rejected',
      `Your deposit request of $${deposit.deposit_amount} has been rejected. Reason: ${reason || 'Invalid details'}`,
      deposit.deposit_amount,
      { depositId: deposit._id }
    );

    res.status(200).json({ 
      message: 'Deposit rejected',
      deposit
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
