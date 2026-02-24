const mongoose = require('mongoose');

const crxPriceSchema = new mongoose.Schema({
  price: { type: Number, required: true, min: 0.000001 },
  expected_rise_percent: { type: Number, default: 0 },
  note: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('CrxPrice', crxPriceSchema);
