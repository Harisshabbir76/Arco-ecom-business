const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  originalPrice: {
    type: Number,
    default: 0
  },
  bundlePrice: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Timeline system - lifetime or specific date range
  isLifetime: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Virtual to check if bundle is currently active based on timeline
bundleSchema.virtual('isCurrentlyActive').get(function() {
  if (!this.isActive) return false;
  if (this.isLifetime) return true;
  
  const now = new Date();
  const afterStart = !this.startDate || now >= new Date(this.startDate);
  const beforeEnd = !this.endDate || now <= new Date(this.endDate);
  
  return afterStart && beforeEnd;
});

bundleSchema.set('toJSON', { virtuals: true });
bundleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Bundle', bundleSchema);

