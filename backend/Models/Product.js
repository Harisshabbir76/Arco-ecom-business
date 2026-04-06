const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  originalPrice: Number,
  discountedPrice: Number,
  image: [String],
  category: String,
  stock: Number,
  variants: {
    sizes: [String],
    colors: [String]
  },
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  designs: [String]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

