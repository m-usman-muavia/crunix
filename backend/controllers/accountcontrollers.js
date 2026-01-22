const Plan = require('../models/accounts.js');

// ...existing code...

// Admin: Get all bank accounts
exports.getAdminAccounts = async (req, res) => {
    try {
        const BankAccount = require('../models/bankaccount');
        const accounts = await BankAccount.find(); // no status filter
        res.status(200).json({ success: true, data: accounts });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch accounts' });
    }
};

// Admin: Add new bank account
exports.addAdminAccount = async (req, res) => {
    try {
        const { account_name, account_number, bank_name, account_type, status } = req.body;
        
        // Validate required fields
        if (!account_name || !account_number || !bank_name || !account_type) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const BankAccount = require('../models/bankaccount');
        
        // Check if account already exists
        const existingAccount = await BankAccount.findOne({ account_number });
        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: 'Account number already exists'
            });
        }

        // Create new account
        const newAccount = new BankAccount({
            account_name,
            account_number,
            bank_name,
            account_type,
            status: status || 'active'
        });

        await newAccount.save();

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: newAccount
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create account'
        });
    }
};
