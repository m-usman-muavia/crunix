const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { 
        type: String, 
        minlength: [8, "Password must be at least 8 characters long"], 
        required: true 
    },
    referralCode: { type: String, unique: true },
    referredBy: { type: String }, 
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetOTP: { type: String },
    resetOTPExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

// COMBINED PRE-SAVE HOOK
userSchema.pre('save', async function () {
    // 1. Generate Referral Code if the user is new
    if (this.isNew && !this.referralCode) {
        this.referralCode = 'INV-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    // 2. Hash Password if it's new or being changed
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            throw error; 
        }
    }
    
    // No 'next()' needed here because the function is 'async'
});

module.exports = mongoose.model('User', userSchema);