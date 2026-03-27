const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: {
    type: String,
    default: ''
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
  category: {
    type: String,
    enum: ['Premium Plan', 'Special Plan', 'Elite Plan', 'Starter Plan', 'Business Plan'],
    default: 'Premium Plan'
  },
  image_path: {
    type: String,
    default: ''
  },
  image_public_id: {
    type: String,
    default: ''
  },
  purchase_limit: {
    type: Number,
    default: 0,
    min: 0
  },
  countdown_hours: {
    type: Number,
    default: null,
    min: 0
  },
  countdown_start_time: {
    type: Date,
    default: null
  },
  countdown_end_time: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
