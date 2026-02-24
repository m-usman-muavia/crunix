const mongoose = require('mongoose');

const crxTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  price_per_crx: { type: Number, required: true },
  crx_amount: { type: Number, required: true },
  usd_amount: { type: Number, required: true },
  main_balance_before: { type: Number, required: true },
  main_balance_after: { type: Number, required: true },
  crx_balance_before: { type: Number, required: true },
  crx_balance_after: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CrxTransaction', crxTransactionSchema);
