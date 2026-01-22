const express = require('express');
const router = express.Router();
const BankAccount = require('../models/bankaccount');

// GET active account (shows one account at a time)
router.get('/active', async (req, res) => {
  try {
    const account = await BankAccount.findOne({ status: 'active' });
    
    if (!account) {
      return res.status(404).json({ message: 'No active account found' });
    }
    
    res.json({
      accountName: account.account_name,
      accountNumber: account.account_number,
      bankName: account.bank_name,
      accountType: account.account_type
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
