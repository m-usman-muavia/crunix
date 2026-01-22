const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    main_balance: { type: Number, default: 0 },
    bonus_balance: { type: Number, default: 0 },
    referral_balance: { type: Number, default: 0 }
});

module.exports = mongoose.model('Wallet', walletSchema);