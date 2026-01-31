const BonusCode = require('../models/bonuscode');
const Wallet = require('../models/wallet');

// Generate and save bonus code
exports.generateBonusCode = async (req, res) => {
  try {
    const { code, totalAmount, perUserAmount, maxUses } = req.body;
    
    console.log('========== BONUS CODE GENERATION ==========');
    console.log('Request body:', req.body);
    console.log('Code:', code, 'Type:', typeof code);
    console.log('TotalAmount:', totalAmount, 'Type:', typeof totalAmount);
    console.log('PerUserAmount:', perUserAmount, 'Type:', typeof perUserAmount);
    console.log('MaxUses:', maxUses, 'Type:', typeof maxUses);

    // Validation
    if (!code || totalAmount === undefined || perUserAmount === undefined || !maxUses) {
      console.log('❌ Validation failed - missing fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate data types
    if (typeof totalAmount !== 'number' || typeof perUserAmount !== 'number' || typeof maxUses !== 'number') {
      console.log('❌ Invalid data types');
      return res.status(400).json({ message: 'Invalid data types - amounts and maxUses must be numbers' });
    }

    // Check if code already exists
    const existingCode = await BonusCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      console.log('❌ Code already exists:', code);
      return res.status(400).json({ message: 'Bonus code already exists' });
    }

    // Create new bonus code
    const bonusCodeDoc = new BonusCode({
      code: code.toUpperCase(),
      totalAmount: Number(totalAmount),
      perUserAmount: Number(perUserAmount),
      maxUses: Number(maxUses),
      usedCount: 0,
      status: 'active'
    });

    console.log('📝 Created BonusCode document:', bonusCodeDoc);

    await bonusCodeDoc.save();
    console.log('✅ Bonus code saved successfully:', bonusCodeDoc._id);

    res.status(201).json({
      message: 'Bonus code generated successfully',
      bonusCode: {
        code: bonusCodeDoc.code,
        totalAmount: bonusCodeDoc.totalAmount,
        perUserAmount: bonusCodeDoc.perUserAmount,
        maxUses: bonusCodeDoc.maxUses,
        status: bonusCodeDoc.status
      }
    });
  } catch (err) {
    console.error('❌ ERROR generating bonus code:');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Full error:', err);
    res.status(500).json({ 
      message: 'Error generating bonus code', 
      error: err.message,
      details: err.errors || 'No additional details'
    });
  }
};

// Redeem bonus code
exports.redeemBonusCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.userId || req.user.id;

    console.log('========== REDEEM BONUS CODE ==========');
    console.log('User ID:', userId);
    console.log('Bonus Code:', code);

    if (!userId) {
      console.log('❌ No userId found in request');
      return res.status(401).json({ message: 'User authentication failed' });
    }

    if (!code) {
      return res.status(400).json({ message: 'Bonus code is required' });
    }

    // Find bonus code
    const bonusCode = await BonusCode.findOne({ code: code.toUpperCase() });
    console.log('Found bonus code:', bonusCode);

    if (!bonusCode) {
      return res.status(404).json({ message: 'Invalid bonus code' });
    }

    // Check if code is active
    if (bonusCode.status !== 'active') {
      console.log('❌ Code is not active:', bonusCode.status);
      return res.status(400).json({ message: 'Bonus code has expired' });
    }

    // Check if code has been used all times
    if (bonusCode.usedCount >= bonusCode.maxUses) {
      console.log('❌ Code max uses reached');
      bonusCode.status = 'expired';
      await bonusCode.save();
      return res.status(400).json({ message: 'Bonus code has expired' });
    }

    // Check if user already used this code (with safety check for userId field)
    const alreadyUsed = bonusCode.usedBy.some(u => u.userId && u.userId.toString() === userId);
    if (alreadyUsed) {
      console.log('❌ User already redeemed this code');
      return res.status(400).json({ message: 'You have already redeemed this bonus code' });
    }

    // Add user to usedBy array
    bonusCode.usedBy.push({ userId });
    bonusCode.usedCount += 1;

    // Check if code should expire
    if (bonusCode.usedCount >= bonusCode.maxUses) {
      bonusCode.status = 'expired';
    }

    console.log('Saving bonus code with updated usage...');
    await bonusCode.save();
    console.log('✅ Bonus code saved');

    // Add bonus amount to user's wallet
    console.log('Finding user wallet...');
    let wallet = await Wallet.findOne({ userId });
    console.log('Wallet found:', wallet);

    if (!wallet) {
      console.log('Creating new wallet for user');
      wallet = new Wallet({
        userId,
        main_balance: 0,
        referral_balance: 0,
        bonus_balance: bonusCode.perUserAmount
      });
    } else {
      console.log('Updating existing wallet');
      wallet.bonus_balance = (wallet.bonus_balance || 0) + bonusCode.perUserAmount;
    }

    console.log('Saving wallet...');
    await wallet.save();
    console.log('✅ Wallet saved');

    res.status(200).json({
      message: 'Bonus redeemed successfully',
      bonusAmount: bonusCode.perUserAmount,
      newBonusBalance: wallet.bonus_balance,
      codeStatus: bonusCode.status,
      remainingUses: bonusCode.maxUses - bonusCode.usedCount
    });
  } catch (err) {
    console.error('❌ ERROR redeeming bonus code:');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Error redeeming bonus code', error: err.message });
  }
};

// Get bonus code details (for admin)
exports.getBonusCodeDetails = async (req, res) => {
  try {
    const { code } = req.params;

    const bonusCode = await BonusCode.findOne({ code: code.toUpperCase() })
      .populate('usedBy.userId', 'name email');

    if (!bonusCode) {
      return res.status(404).json({ message: 'Bonus code not found' });
    }

    res.status(200).json({
      code: bonusCode.code,
      totalAmount: bonusCode.totalAmount,
      perUserAmount: bonusCode.perUserAmount,
      maxUses: bonusCode.maxUses,
      usedCount: bonusCode.usedCount,
      remainingUses: bonusCode.maxUses - bonusCode.usedCount,
      status: bonusCode.status,
      usedBy: bonusCode.usedBy,
      createdAt: bonusCode.createdAt
    });
  } catch (err) {
    console.error('Error fetching bonus code details:', err);
    res.status(500).json({ message: 'Error fetching bonus code details', error: err.message });
  }
};

// Get all bonus codes (for admin)
exports.getAllBonusCodes = async (req, res) => {
  try {
    const bonusCodes = await BonusCode.find()
      .select('code totalAmount perUserAmount maxUses usedCount status createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      totalCodes: bonusCodes.length,
      bonusCodes
    });
  } catch (err) {
    console.error('Error fetching bonus codes:', err);
    res.status(500).json({ message: 'Error fetching bonus codes', error: err.message });
  }
};
