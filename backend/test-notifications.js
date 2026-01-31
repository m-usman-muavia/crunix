const mongoose = require('mongoose');
const Notification = require('./models/notification');
const User = require('./models/user');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventmanagement');
        console.log('MongoDB Connected for testing');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

// Create test notifications
const createTestNotifications = async () => {
    try {
        // Find first user
        const user = await User.findOne();
        
        if (!user) {
            console.log('No users found in database. Please create a user first.');
            return;
        }

        console.log(`Creating test notifications for user: ${user.email}`);

        // Create sample notifications
        const notifications = [
            {
                userId: user._id,
                type: 'deposit_rest_sent',
                message: 'Deposit Request is sent for verification.',
                amount: 5000,
                metadata: { depositId: 'test123' }
            },
            {
                userId: user._id,
                type: 'deposit_approved',
                message: 'Deposit Request is approved and added to your wallet.',
                amount: 5000,
                metadata: { depositId: 'test123' }
            },
            {
                userId: user._id,
                type: 'deposit_rejected',
                message: 'Deposit Request is rejected. Please contact support.',
                amount: 2000,
                metadata: { depositId: 'test124' }
            },
            {
                userId: user._id,
                type: 'withdrawal_request_sent',
                message: 'Your withdrawal request of Rs 1000 via Bank Transfer has been submitted for processing.',
                amount: 1000,
                metadata: { withdrawalId: 'test789' }
            },
            {
                userId: user._id,
                type: 'withdrawal_approved',
                message: 'Your withdrawal of Rs 1000 has been approved and processed to your account.',
                amount: 1000,
                metadata: { withdrawalId: 'test789' }
            },
            {
                userId: user._id,
                type: 'withdrawal_rejected',
                message: 'Your withdrawal request of Rs 500 has been rejected due to insufficient funds.',
                amount: 500,
                metadata: { withdrawalId: 'test790' }
            },
            {
                userId: user._id,
                type: 'plan_activated',
                message: 'You have successfully activated the Premium Plan with Rs 3000 investment. Enjoy daily profits!',
                amount: 3000,
                metadata: { planId: 'test456' }
            },
            {
                userId: user._id,
                type: 'plan_paused',
                message: 'Your Premium Plan has been paused. Daily accruals will resume when you reactivate it.',
                amount: 0,
                metadata: { planId: 'test456' }
            },
            {
                userId: user._id,
                type: 'plan_resumed',
                message: 'Your Premium Plan has been resumed. Daily accruals will continue.',
                amount: 0,
                metadata: { planId: 'test456' }
            },
            {
                userId: user._id,
                type: 'plan_completed',
                message: 'Congratulations! Your Premium Plan has completed. Total earned: Rs 4500',
                amount: 4500,
                metadata: { planId: 'test456' }
            },
            {
                userId: user._id,
                type: 'daily_income',
                message: 'You have earned Rs 150 as daily income from your active Premium Plan.',
                amount: 150,
                metadata: { planId: 'test456' }
            },
            {
                userId: user._id,
                type: 'daily_income',
                message: 'You have earned Rs 200 as daily income from your active Gold Plan.',
                amount: 200,
                metadata: { planId: 'test457' }
            },
            {
                userId: user._id,
                type: 'referral_signup',
                message: 'Great! Your referral link was used by John Doe. They are now part of your network!',
                amount: 0,
                metadata: { referralId: 'test998' }
            },
            {
                userId: user._id,
                type: 'referral_earning',
                message: 'You earned Rs 300 (10% commission) from your referral\'s Rs 3000 plan investment.',
                amount: 300,
                metadata: { referralId: 'test999' }
            },
            {
                userId: user._id,
                type: 'referral_earning',
                message: 'You earned Rs 500 (10% commission) from your referral\'s Rs 5000 deposit.',
                amount: 500,
                metadata: { referralId: 'test1000' }
            }
        ];

        // Insert notifications
        await Notification.insertMany(notifications);
        console.log(`✅ Created ${notifications.length} test notifications successfully!`);
        
        // Display created notifications
        const created = await Notification.find({ userId: user._id }).sort({ createdAt: -1 });
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📬 CREATED NOTIFICATIONS');
        console.log('═══════════════════════════════════════════════════════════════');
        created.forEach((notif, index) => {
            const typeEmoji = {
                'deposit_request_sent': '📤',
                'deposit_approved': '✅',
                'deposit_rejected': '❌',
                'withdrawal_request_sent': '📤',
                'withdrawal_approved': '✅',
                'withdrawal_rejected': '❌',
                'plan_activated': '🚀',
                'plan_paused': '⏸️',
                'plan_resumed': '▶️',
                'plan_completed': '🏆',
                'daily_income': '💰',
                'referral_signup': '👥',
                'referral_earning': '💵'
            };
            const emoji = typeEmoji[notif.type] || '📬';
            console.log(`${index + 1}. ${emoji} [${notif.type}]`);
            console.log(`   Message: ${notif.message}`);
            if (notif.amount) console.log(`   Amount: Rs ${notif.amount}`);
            console.log('');
        });
        console.log('═══════════════════════════════════════════════════════════════');

    } catch (error) {
        console.error('Error creating test notifications:', error);
    }
};

// Run the test
const runTest = async () => {
    await connectDB();
    await createTestNotifications();
    console.log('\nTest complete! Check your notifications page.');
    process.exit(0);
};

runTest();
