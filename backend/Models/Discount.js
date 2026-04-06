const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    code: { type: String, unique: true, sparse: true }, // Optional for coupons
    type: {
        type: String,
        enum: ['COUPON', 'BUY_X_GET_Y', 'SPEND_X_GET_Y'],
        required: true
    },
    description: String,
    discountPercent: Number, // For coupons or spend X get Y
    minAmount: Number, // For spend X get Y
    buyQty: Number, // For buy X get Y
    getQty: Number, // For buy X get Y
    targetProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Specific products it applies to
    targetCategories: [String], // Specific categories it applies to
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Discount', discountSchema);
