const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  investment_amount: { 
    type: Number, 
    required: true 
  },
  daily_profit: { 
    type: Number, 
    required: true 
  },
  duration_days: { 
    type: Number, 
    required: true 
  },
  total_profit: { 
    type: Number, 
    required: true 
  },
  roi_percentage: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'inactive' 
  },
  image_path: {
    type: String,
    default: ''
  },
  image_base64: {
    type: String,
    default: ''
  },
  purchase_limit: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
