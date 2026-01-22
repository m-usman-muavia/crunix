const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
    account_name: {
        type: String,
        required: true
    },
    account_number: {
        type: String,
        required: true,
        unique: true
    },
    bank_name: {
        type: String,
        required: true
    },
    account_type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);