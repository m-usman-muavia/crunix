const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The Person who shared the link
    referred_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The New person
    status: { type: String, default: 'registered' }, // registered | activated
    bonusCollected: { type: Boolean, default: false }, // Track if $0.8 bonus has been collected
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Referral', referralSchema);