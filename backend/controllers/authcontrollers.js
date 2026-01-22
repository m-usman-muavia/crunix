const User = require('../models/user');
const Wallet = require('../models/wallet');
const Referral = require('../models/referral');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Set up the "Post Office" (Sender)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'payzo4810@gmail.com',
        pass: process.env.EMAIL_PASS || 'iqbj kuly jrce mwcp' // You get this from Google Security
    }
});

// ...existing code...

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email does not exist. Please sign up.' });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified. Please verify your email first.' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password. Please try again.' });
        }

        // Generate JWT token
        const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_12345';
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            secret,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login. Please try again.' });
    }
};

exports.login = login;

// ...existing code...

exports.register = async (req, res) => {
    try {
        const { email, name, password, referralCode } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        // If user exists and is verified, don't allow re-registration
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: 'Email already registered and verified. Please login.' });
        }

        // Check if referral code is valid (if provided)
        let referrer = null;
        if (referralCode) {
            referrer = await User.findOne({ referralCode });
            if (!referrer) {
                return res.status(400).json({ message: 'Invalid referral code' });
            }
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // If user exists but not verified, update their information
        if (existingUser && !existingUser.isVerified) {
            existingUser.name = name;
            existingUser.password = password;  // Model will hash it via pre-save hook
            existingUser.referredBy = referralCode || existingUser.referredBy;
            existingUser.otp = otp;
            existingUser.otpExpires = otpExpires;
            
            await existingUser.save();

            // Update referral if changed
            if (referralCode && referrer) {
                // Check if referral already exists
                const existingReferral = await Referral.findOne({ referred_user_id: existingUser._id });
                if (!existingReferral) {
                    const newReferral = new Referral({
                        referrer_id: referrer._id,
                        referred_user_id: existingUser._id,
                        status: 'registered'
                    });
                    await newReferral.save();
                }
            }

            // Send OTP via email
            const mailOptions = {
                from: process.env.EMAIL_USER || 'm.usman540582@gmail.com',
                to: email,
                subject: 'Email Verification OTP',
                html: `
                    <h2>Welcome Back!</h2>
                    <p>Your new OTP for email verification is:</p>
                    <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
                    <p>This OTP will expire in 10 minutes.</p>
                `
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({
                message: 'Account updated. Please check your email for new OTP.',
                userId: existingUser._id
            });
        }

        // Create new user if doesn't exist
        const newUser = new User({
            email,
            name,
            password,  // Model will hash it via pre-save hook
            referredBy: referralCode || null,
            otp,
            otpExpires
        });

        await newUser.save();

        // Create wallet for new user
        const newWallet = new Wallet({
            user_id: newUser._id,
            balance: 0
        });
        await newWallet.save();

        // Create referral entry if referral code was used
        if (referrer) {
            const newReferral = new Referral({
                referrer_id: referrer._id,
                referred_user_id: newUser._id,
                status: 'registered'
            });
            await newReferral.save();
        }

        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER || 'm.usman540582@gmail.com',
            to: email,
            subject: 'Email Verification OTP',
            html: `
                <h2>Welcome to Our Platform!</h2>
                <p>Your OTP for email verification is:</p>
                <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            message: 'Registration successful. Please check your email for OTP.',
            userId: newUser._id
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// ...existing code...


exports.verifyOTP = async (req, res) => {
    try {
        const { email, otpCode } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isVerified) return res.status(400).json({ message: "Already verified" });
        if (!user.otp || user.otp !== otpCode) return res.status(400).json({ message: "Invalid OTP" });
        if (user.otpExpires < Date.now()) return res.status(400).json({ message: "OTP expired" });

        // Mark user as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // --- NEW: Update Referral Status & Pay Referrer ---
        const referralRecord = await Referral.findOne({ 
            referred_user_id: user._id, 
            status: 'pending' 
        });

        if (referralRecord) {
            referralRecord.status = 'completed';
            await referralRecord.save();

            // Add bonus to the person who invited this user
            // $inc means "increment" (add to the current value)
            await Wallet.findOneAndUpdate(
                { userId: referralRecord.referrer_id },
                { $inc: { referral_balance: 10, bonus_balance: 5 } } 
            );
        }

        res.status(200).json({ message: "Account verified! Referral bonuses updated." });
    } catch (error) {
        res.status(500).json({ message: "Verification failed" });
    }
};

// Admin: Get all bank accounts
exports.getAdminAccounts = async (req, res) => {
    try {
        const BankAccount = require('../models/bankaccount');
        const accounts = await BankAccount.find({ status: 'active' });
        
        res.status(200).json({
            success: true,
            data: accounts
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch accounts'
        });
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

// Admin: Update bank account
exports.updateAdminAccount = async (req, res) => {
    try {
        const BankAccount = require('../models/bankaccount');
        const { id } = req.params;
        const { account_name, account_number, bank_name, account_type, status } = req.body;

        const account = await BankAccount.findById(id);
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        if (account_name !== undefined) account.account_name = account_name;
        if (account_number !== undefined) account.account_number = account_number;
        if (bank_name !== undefined) account.bank_name = bank_name;
        if (account_type !== undefined) account.account_type = account_type;
        if (status !== undefined) account.status = status;

        await account.save();

        res.status(200).json({ success: true, message: 'Account updated', data: account });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ success: false, message: 'Failed to update account' });
    }
};

// Admin: Delete bank account
exports.deleteAdminAccount = async (req, res) => {
    try {
        const BankAccount = require('../models/bankaccount');
        const { id } = req.params;

        const deleted = await BankAccount.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        res.status(200).json({ success: true, message: 'Account deleted' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ success: false, message: 'Failed to delete account' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.userId;

        // Validation
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old password and new password are required' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        // Check if new password is the same as old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password must be different from the old password' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error.message);
        res.status(500).json({ message: 'Server error during password change. Please try again.' });
    }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email not found. Please sign up first.' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to user document
        user.resetOTP = otp;
        user.resetOTPExpires = otpExpires;
        await user.save();

        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER || 'payzo4810@gmail.com',
            to: email,
            subject: 'Password Reset OTP',
            html: `
                <h2>Password Reset Request</h2>
                <p>Your OTP for password reset is:</p>
                <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent to your email successfully' });
    } catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ message: 'Server error sending OTP. Please try again.' });
    }
};

// Verify Forgot Password OTP
exports.verifyForgotOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP exists and is not expired
        if (!user.resetOTP || !user.resetOTPExpires) {
            return res.status(400).json({ message: 'OTP not found. Please request a new one.' });
        }

        if (new Date() > user.resetOTPExpires) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Verify OTP
        if (user.resetOTP !== otp) {
            return res.status(401).json({ message: 'Incorrect OTP' });
        }

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Verify OTP error:', error.message);
        res.status(500).json({ message: 'Server error verifying OTP. Please try again.' });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP is correct and not expired
        if (!user.resetOTP || user.resetOTP !== otp) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.resetOTPExpires) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Update password and clear OTP (let the pre-save hook handle hashing)
        user.password = newPassword;
        user.resetOTP = null;
        user.resetOTPExpires = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ message: 'Server error resetting password. Please try again.' });
    }
};
