const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { 
        type: String, 
        enum: ['jazzcash', 'easypaisa', 'hbl'], 
        required: true 
    },
    account_number: { type: String, required: true },
    mobile_number: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'paid'], 
        default: 'pending' 
    },
    created_at: { type: Date, default: Date.now },
    approved_at: { type: Date, default: null }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
