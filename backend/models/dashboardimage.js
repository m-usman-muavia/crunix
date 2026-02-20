const mongoose = require('mongoose');

const dashboardImageSchema = new mongoose.Schema({
  images: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      image_path: { type: String, required: true },
      image_public_id: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('DashboardImage', dashboardImageSchema);
