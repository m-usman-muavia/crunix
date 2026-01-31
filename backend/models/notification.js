const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'deposit_request_sent',
            'deposit_approved',
            'deposit_rejected',
            'withdrawal_request_sent',
            'withdrawal_approved',
            'withdrawal_rejected',
            'plan_activated',
            'plan_completed',
            'plan_paused',
            'plan_resumed',
            'daily_income',
            'referral_earning',
            'referral_signup',
            'general'
        ],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
