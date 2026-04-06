// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, default: '' },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: String,
    color: String
  }],
  totalAmount: { type: Number, required: true },
  appliedDiscount: { type: Number, default: 0 },
  discountBreakdown: { type: Array, default: [] },
  couponCode: String,
  paymentMethod: { type: String, default: 'cash-on-delivery' },
  paymentStatus: { type: String, default: 'pending', enum: ['pending', 'paid', 'failed', 'refunded'] },
  paymentIntentId: { type: String, default: null },
  stripeCustomerEmail: { type: String, default: null },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Order', orderSchema);
