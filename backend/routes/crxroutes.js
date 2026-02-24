const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Wallet = require('../models/wallet');
const CrxPrice = require('../models/crxprice');
const CrxTransaction = require('../models/crxtransaction');

const roundUsd = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const roundCrx = (value) => Math.round((Number(value) + Number.EPSILON) * 1000000) / 1000000;

const getUserIdFromReq = (req) => req.user.userId || req.user.id || req.user._id;

const ensureWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      main_balance: 0,
      bonus_balance: 0,
      referral_balance: 0,
      crx_balance: 0
    });
  }

  if (typeof wallet.crx_balance !== 'number') {
    wallet.crx_balance = 0;
    await wallet.save();
  }

  return wallet;
};

const getCurrentPrice = async () => {
  let current = await CrxPrice.findOne().sort({ createdAt: -1 });

  if (!current) {
    current = await CrxPrice.create({
      price: 0.4,
      expected_rise_percent: 0,
      note: 'Initial CRX price'
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
    const history = await CrxPrice.find().sort({ createdAt: -1 }).limit(60);
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
    const transactions = await CrxTransaction.find({ userId }).sort({ createdAt: -1 }).limit(50);
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

    const crxAmount = roundCrx(usdAmount / current.price);

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
          crx_balance: crxAmount
        }
      },
      { new: true }
    );

    if (!updatedWallet) {
      return res.status(400).json({ message: 'Insufficient main wallet balance' });
    }

    const mainBefore = roundUsd(updatedWallet.main_balance + usdAmount);
    const crxBefore = roundCrx(updatedWallet.crx_balance - crxAmount);

    await CrxTransaction.create({
      userId,
      type: 'BUY',
      price_per_crx: current.price,
      crx_amount: crxAmount,
      usd_amount: usdAmount,
      main_balance_before: mainBefore,
      main_balance_after: roundUsd(updatedWallet.main_balance),
      crx_balance_before: crxBefore,
      crx_balance_after: roundCrx(updatedWallet.crx_balance)
    });

    return res.status(201).json({
      message: 'CRX purchased successfully',
      data: {
        usd_amount: usdAmount,
        crx_amount: crxAmount,
        price_per_crx: current.price,
        wallet: {
          main_balance: roundUsd(updatedWallet.main_balance),
          crx_balance: roundCrx(updatedWallet.crx_balance)
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
    const crxAmount = roundCrx(req.body.crx_amount);

    if (!crxAmount || crxAmount <= 0) {
      return res.status(400).json({ message: 'Valid crx_amount is required' });
    }

    const wallet = await ensureWallet(userId);
    const current = await getCurrentPrice();

    if (wallet.crx_balance < crxAmount) {
      return res.status(400).json({
        message: 'Insufficient CRX balance',
        required: crxAmount,
        available: roundCrx(wallet.crx_balance)
      });
    }

    const usdAmount = roundUsd(crxAmount * current.price);

    const updatedWallet = await Wallet.findOneAndUpdate(
      {
        userId,
        crx_balance: { $gte: crxAmount }
      },
      {
        $inc: {
          crx_balance: -crxAmount,
          main_balance: usdAmount
        }
      },
      { new: true }
    );

    if (!updatedWallet) {
      return res.status(400).json({ message: 'Insufficient CRX balance' });
    }

    const mainBefore = roundUsd(updatedWallet.main_balance - usdAmount);
    const crxBefore = roundCrx(updatedWallet.crx_balance + crxAmount);

    await CrxTransaction.create({
      userId,
      type: 'SELL',
      price_per_crx: current.price,
      crx_amount: crxAmount,
      usd_amount: usdAmount,
      main_balance_before: mainBefore,
      main_balance_after: roundUsd(updatedWallet.main_balance),
      crx_balance_before: crxBefore,
      crx_balance_after: roundCrx(updatedWallet.crx_balance)
    });

    return res.status(201).json({
      message: 'CRX sold successfully',
      data: {
        usd_amount: usdAmount,
        crx_amount: crxAmount,
        price_per_crx: current.price,
        wallet: {
          main_balance: roundUsd(updatedWallet.main_balance),
          crx_balance: roundCrx(updatedWallet.crx_balance)
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
      return res.status(403).json({ message: 'Only admin can update CRX price' });
    }

    const price = roundUsd(req.body.price);
    const expectedRisePercent = Number(req.body.expected_rise_percent || 0);
    const note = (req.body.note || '').toString().trim();

    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Valid CRX price is required' });
    }

    const created = await CrxPrice.create({
      price,
      expected_rise_percent: Number.isFinite(expectedRisePercent) ? expectedRisePercent : 0,
      note,
      createdBy: getUserIdFromReq(req)
    });

    return res.status(201).json({
      message: 'CRX price updated successfully',
      data: created
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
