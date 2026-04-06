const express = require('express');
const router = express.Router();
const Settings = require('../Models/Settings');
const Product = require('../Models/Product');
const Order = require('../Models/Order');
const ContactUs = require('../Models/ContactUs');

// GET /api/settings - Get settings
router.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ shippingCharge: 0 });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/settings - Update settings
router.put('/api/settings', async (req, res) => {
  try {
    const { shippingCharge } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ shippingCharge });
    } else {
      settings.shippingCharge = shippingCharge;
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/api/dashboard/stats', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const messageCount = await ContactUs.countDocuments();

    res.json({
      products: productCount,
      orders: orderCount,
      messages: messageCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

