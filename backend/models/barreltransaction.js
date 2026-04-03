const mongoose = require('mongoose');

const barrelTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  price_per_barrel: { type: Number, required: true },
  barrel_amount: { type: Number, required: true },
  usd_amount: { type: Number, required: true },
  main_balance_before: { type: Number, required: true },
  main_balance_after: { type: Number, required: true },
  barrel_balance_before: { type: Number, required: true },
  barrel_balance_after: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('BarrelTransaction', barrelTransactionSchema);