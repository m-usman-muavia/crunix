const mongoose = require('mongoose');

const userPlanSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    planId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Plan', 
        required: true 
    },
    planName: {
        type: String,
        required: true
    },
    investment_amount: {
        type: Number,
        required: true
    },
    daily_profit: {
        type: Number,
        required: true
    },
    total_profit: {
        type: Number,
        required: true
    },
    duration_days: {
        type: Number,
        required: true
    },
    investmentDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    lastAccruedAt: {
        type: Date,
        default: Date.now
    },
    lastCollectTime: {
        type: Date,
        default: null
    },
    totalEarned: {
        type: Number,
        default: 0
    },
    accrualHistory: [{
        timestamp: { type: Date, default: Date.now },
        daysAccrued: { type: Number },
        amountAdded: { type: Number }
    }],
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'cancelled'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserPlan', userPlanSchema);
