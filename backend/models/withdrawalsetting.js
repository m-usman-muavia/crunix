const mongoose = require('mongoose');

const withdrawalSettingSchema = new mongoose.Schema(
  {
    isEnabled: { type: Boolean, default: true },
    updatedBy: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WithdrawalSetting', withdrawalSettingSchema);
