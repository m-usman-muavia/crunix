const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('./models/user');
const UserPlan = require('./models/userplan');
const Wallet = require('./models/wallet');
const Plan = require('./models/plan');
const Deposit = require('./models/deposit');
const Withdrawal = require('./models/withdrawal');
const Notification = require('./models/notification');
const BonusCode = require('./models/bonuscode');
const Referral = require('./models/referral');
const BankAccount = require('./models/bankaccount');

const initializeDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected Successfully');

    // Create indexes for all models
    console.log('\nCreating collections and indexes...');
    
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ User collection created');

    await UserPlan.collection.createIndex({ userId: 1 });
    console.log('✓ UserPlan collection created');

    await Wallet.collection.createIndex({ userId: 1 });
    console.log('✓ Wallet collection created');

    await Plan.collection.createIndex({ name: 1 });
    console.log('✓ Plan collection created');

    await Deposit.collection.createIndex({ userId: 1 });
    console.log('✓ Deposit collection created');

    await Withdrawal.collection.createIndex({ userId: 1 });
    console.log('✓ Withdrawal collection created');

    await Notification.collection.createIndex({ userId: 1 });
    console.log('✓ Notification collection created');

    await BonusCode.collection.createIndex({ code: 1 }, { unique: true });
    console.log('✓ BonusCode collection created');

    await Referral.collection.createIndex({ referrerId: 1 });
    console.log('✓ Referral collection created');

    await BankAccount.collection.createIndex({ userId: 1 });
    console.log('✓ BankAccount collection created');

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nAll collections have been created in MongoDB');
    console.log('Connection URI:', process.env.MONGODB_URI);

    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
};

initializeDatabase();
