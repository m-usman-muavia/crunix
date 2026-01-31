const mongoose = require('mongoose');

const bonusCodeSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true,
        uppercase: true
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
    perUserAmount: { 
        type: Number, 
        required: true 
    },
    maxUses: { 
        type: Number, 
        required: true 
    },
    usedCount: { 
        type: Number, 
        default: 0 
    },
    status: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active'
    },
    usedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now }
    }],
    expiresAt: {
        type: Date
    }
}, { timestamps: true });

// Auto-update status based on usage
bonusCodeSchema.pre('save', async function() {
    if (this.usedCount >= this.maxUses) {
        this.status = 'expired';
    }
});

module.exports = mongoose.model('BonusCode', bonusCodeSchema);
