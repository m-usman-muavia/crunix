const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Wallet = require('../models/wallet');
const BarrelPrice = require('../models/barrelprice');
const BarrelTransaction = require('../models/barreltransaction');

const roundUsd = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const roundBarrel = (value) => Math.round((Number(value) + Number.EPSILON) * 1000000) / 1000000;

const getUserIdFromReq = (req) => req.user.userId || req.user.id || req.user._id;

const ensureWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      main_balance: 0,
      bonus_balance: 0,
      referral_balance: 0,
      crx_balance: 0,
      barrel_balance: 0
    });
  }

  if (typeof wallet.barrel_balance !== 'number') {
    wallet.barrel_balance = 0;
    await wallet.save();
  }

  return wallet;
};

const getCurrentPrice = async () => {
  let current = await BarrelPrice.findOne().sort({ createdAt: -1 });

  if (!current) {
    current = await BarrelPrice.create({
      price: 1,
      expected_rise_percent: 0,
      note: 'Initial barrel price'
    });
  }

  return current;
};

const isAdminRequest = (req) => {
  const configured = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!configured.length) {
    return true;
  }

  const email = (req.user.email || '').toLowerCase();
  return configured.includes(email);
};

router.get('/market', verifyToken, async (req, res) => {
  try {
    const current = await getCurrentPrice();
    const history = await BarrelPrice.find().sort({ createdAt: -1 }).limit(60);
    const orderedHistory = [...history].reverse();
    const previous = orderedHistory.length > 1 ? orderedHistory[orderedHistory.length - 2] : null;

    const trend = previous
      ? current.price > previous.price
        ? 'up'
        : current.price < previous.price
          ? 'down'
          : 'flat'
      : 'flat';

    res.json({
      current_price: current.price,
      expected_rise_percent: current.expected_rise_percent || 0,
      note: current.note || '',
      trend,
      history: orderedHistory.map((item) => ({
        _id: item._id,
        price: item.price,
        expected_rise_percent: item.expected_rise_percent || 0,
        note: item.note || '',
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const transactions = await BarrelTransaction.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/buy', verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const usdAmount = roundUsd(req.body.usd_amount);

    if (!usdAmount || usdAmount <= 0) {
      return res.status(400).json({ message: 'Valid usd_amount is required' });
    }

    const wallet = await ensureWallet(userId);
    const current = await getCurrentPrice();

    const barrelAmount = roundBarrel(usdAmount / current.price);

    if (wallet.main_balance < usdAmount) {
      return res.status(400).json({
        message: 'Insufficient main wallet balance',
        required: usdAmount,
        available: roundUsd(wallet.main_balance)
      });
    }

    const updatedWallet = await Wallet.findOneAndUpdate(
      {
        userId,
        main_balance: { $gte: usdAmount }
      },
      {
        $inc: {
          main_balance: -usdAmount,
          barrel_balance: barrelAmount
        }
      },
      { new: true }
    );

    if (!updatedWallet) {
      return res.status(400).json({ message: 'Insufficient main wallet balance' });
    }

    const mainBefore = roundUsd(updatedWallet.main_balance + usdAmount);
    const barrelBefore = roundBarrel(updatedWallet.barrel_balance - barrelAmount);

    await BarrelTransaction.create({
      userId,
      type: 'BUY',
      price_per_barrel: current.price,
      barrel_amount: barrelAmount,
      usd_amount: usdAmount,
      main_balance_before: mainBefore,
      main_balance_after: roundUsd(updatedWallet.main_balance),
      barrel_balance_before: barrelBefore,
      barrel_balance_after: roundBarrel(updatedWallet.barrel_balance)
    });

    return res.status(201).json({
      message: 'Barrel purchased successfully',
      data: {
        usd_amount: usdAmount,
        barrel_amount: barrelAmount,
        price_per_barrel: current.price,
        wallet: {
          main_balance: roundUsd(updatedWallet.main_balance),
          barrel_balance: roundBarrel(updatedWallet.barrel_balance)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/sell', verifyToken, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const barrelAmount = roundBarrel(req.body.barrel_amount);

    if (!barrelAmount || barrelAmount <= 0) {
      return res.status(400).json({ message: 'Valid barrel_amount is required' });
    }

    const wallet = await ensureWallet(userId);
    const current = await getCurrentPrice();

    if (wallet.barrel_balance < barrelAmount) {
      return res.status(400).json({
        message: 'Insufficient barrel balance',
        required: barrelAmount,
        available: roundBarrel(wallet.barrel_balance)
      });
    }

    const usdAmount = roundUsd(barrelAmount * current.price);

    const updatedWallet = await Wallet.findOneAndUpdate(
      {
        userId,
        barrel_balance: { $gte: barrelAmount }
      },
      {
        $inc: {
          barrel_balance: -barrelAmount,
          main_balance: usdAmount
        }
      },
      { new: true }
    );

    if (!updatedWallet) {
      return res.status(400).json({ message: 'Insufficient barrel balance' });
    }

    const mainBefore = roundUsd(updatedWallet.main_balance - usdAmount);
    const barrelBefore = roundBarrel(updatedWallet.barrel_balance + barrelAmount);

    await BarrelTransaction.create({
      userId,
      type: 'SELL',
      price_per_barrel: current.price,
      barrel_amount: barrelAmount,
      usd_amount: usdAmount,
      main_balance_before: mainBefore,
      main_balance_after: roundUsd(updatedWallet.main_balance),
      barrel_balance_before: barrelBefore,
      barrel_balance_after: roundBarrel(updatedWallet.barrel_balance)
    });

    return res.status(201).json({
      message: 'Barrel sold successfully',
      data: {
        usd_amount: usdAmount,
        barrel_amount: barrelAmount,
        price_per_barrel: current.price,
        wallet: {
          main_balance: roundUsd(updatedWallet.main_balance),
          barrel_balance: roundBarrel(updatedWallet.barrel_balance)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/admin/price', verifyToken, async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ message: 'Only admin can update barrel price' });
    }

    const price = roundUsd(req.body.price);
    const expectedRisePercent = Number(req.body.expected_rise_percent || 0);
    const note = (req.body.note || '').toString().trim();

    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Valid barrel price is required' });
    }

    const created = await BarrelPrice.create({
      price,
      expected_rise_percent: Number.isFinite(expectedRisePercent) ? expectedRisePercent : 0,
      note,
      createdBy: getUserIdFromReq(req)
    });

    return res.status(201).json({
      message: 'Barrel price updated successfully',
      data: created
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/stats', verifyToken, async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ message: 'Only admin can view barrel stats' });
    }

    const totals = await BarrelTransaction.aggregate([
      { $match: { type: 'BUY' } },
      {
        $group: {
          _id: null,
          total_barrel_purchased: { $sum: '$barrel_amount' },
          total_usd_spent: { $sum: '$usd_amount' }
        }
      }
    ]);

    const stats = totals[0] || { total_barrel_purchased: 0, total_usd_spent: 0 };

    return res.json({
      total_barrel_purchased: roundBarrel(stats.total_barrel_purchased || 0),
      total_usd_spent: roundUsd(stats.total_usd_spent || 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;