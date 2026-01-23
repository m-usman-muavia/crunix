const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deposit_amount: { type: Number, required: true },
    sender_mobile: { type: String, required: true },
    transaction_id: { type: String, required: true },
    screenshot_path: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    created_at: { type: Date, default: Date.now },
    approved_at: { type: Date, default: null }
});

module.exports = mongoose.model('Deposit', depositSchema);
