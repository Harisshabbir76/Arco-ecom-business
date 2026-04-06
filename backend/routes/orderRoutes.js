const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const Discount = require('../Models/Discount');
const nodemailer = require('nodemailer');

// Order email transporter
const orderTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function for discount calculations
async function calculateDiscounts(totalAmount, products, code = null) {
  let discounts = [];
  if (code) {
    const coupon = await Discount.findOne({ code, isActive: true });
    if (coupon) discounts.push(coupon);
  }

  const autoDiscounts = await Discount.find({
    isActive: true,
    $or: [{ code: { $exists: false } }, { code: "" }, { code: null }]
  });
  discounts = [...discounts, ...autoDiscounts];

  let totalSavings = 0;
  const breakdown = [];

  discounts.forEach(discount => {
    const hasTarget = (discount.targetProducts && discount.targetProducts.length > 0) ||
      (discount.targetCategories && discount.targetCategories.length > 0);

    const targetCatsLower = (discount.targetCategories || []).map(cat => cat.trim().toLowerCase());

    if (discount.type === 'COUPON' && code && discount.code === code) {
      let applicableAmount = 0;
      if (!hasTarget) {
        applicableAmount = totalAmount;
      } else {
        products.forEach(item => {
          const itemCat = (item.category || "").trim().toLowerCase();
          const isTargetProduct = discount.targetProducts.map(p => p.toString()).includes(item.productId);
          const isTargetCategory = itemCat && targetCatsLower.includes(itemCat);

          if (isTargetProduct || isTargetCategory) {
            applicableAmount += (item.price * item.quantity);
          }
        });
      }
      const couponSavings = (applicableAmount * discount.discountPercent) / 100;
      if (couponSavings > 0) {
        totalSavings += couponSavings;
        breakdown.push({ name: discount.code, amount: couponSavings, type: 'COUPON' });
      }
    } else if (discount.type === 'BUY_X_GET_Y') {
      const buyQty = discount.buyQty || 1;
      const getQty = discount.getQty || 1;

      products.forEach(item => {
        const itemCat = (item.category || "").trim().toLowerCase();
        const isTargetProduct = discount.targetProducts.map(p => p.toString()).includes(item.productId);
        const isTargetCategory = itemCat && targetCatsLower.includes(itemCat);

        if (isTargetProduct || isTargetCategory) {
          const cycleSize = buyQty + getQty;
          const fullCyclesInCart = Math.floor(item.quantity / cycleSize);
          const freeUnitsInCart = fullCyclesInCart * getQty;
          const remaining = item.quantity % cycleSize;

          let extraFreeUnits = 0;
          if (remaining >= buyQty) {
            extraFreeUnits = getQty;
          }

          const totalFreeUnits = freeUnitsInCart + extraFreeUnits;
          const savingsFromCart = freeUnitsInCart * item.price;

          if (totalFreeUnits > 0) {
            totalSavings += savingsFromCart;
            breakdown.push({
              productId: item.productId,
              name: discount.description || `Buy ${buyQty} Get ${getQty} Free`,
              freeQuantity: totalFreeUnits,
              inCartQuantity: freeUnitsInCart,
              extraQuantity: extraFreeUnits,
              amount: savingsFromCart,
              type: 'BUY_X_GET_Y'
            });
          }
        }
      });
    } else if (discount.type === 'SPEND_X_GET_Y') {
      let applicableAmount = 0;
      if (!hasTarget) {
        applicableAmount = totalAmount;
      } else {
        products.forEach(item => {
          const itemCat = (item.category || "").trim().toLowerCase();
          const isTargetProduct = discount.targetProducts.map(p => p.toString()).includes(item.productId);
          const isTargetCategory = itemCat && targetCatsLower.includes(itemCat);
          if (isTargetProduct || isTargetCategory) {
            applicableAmount += (item.price * item.quantity);
          }
        });
      }

      if (applicableAmount >= discount.minAmount) {
        const spendSavings = (applicableAmount * discount.discountPercent) / 100;
        if (spendSavings > 0) {
          totalSavings += spendSavings;
          breakdown.push({
            name: discount.description || `Spend Rs. ${discount.minAmount} Save ${discount.discountPercent}%`,
            amount: spendSavings,
            type: 'SPEND_X_GET_Y'
          });
        }
      }
    }
  });

  return { totalSavings, breakdown };
}

// POST /orders - Create a new order
router.post('/orders', async (req, res) => {
  try {
    const { customerName, email, phone, address, city, zipCode, products, totalAmount, couponCode } = req.body;

    const { totalSavings, breakdown } = await calculateDiscounts(totalAmount, products, couponCode);
    const finalAmount = totalAmount - totalSavings;

    const newOrder = new Order({
      customerName,
      email,
      phone,
      address,
      city,
      zipCode,
      products,
      totalAmount: finalAmount,
      appliedDiscount: totalSavings,
      discountBreakdown: breakdown,
      paymentMethod: 'cash-on-delivery'
    });

    await newOrder.save();

    // Send notification to admin
    const adminOrderOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🆕 New Order #${newOrder._id} - Rs. ${finalAmount.toFixed(2)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #28a745;">🎉 New Order Received!</h1>
          <p><strong>Order ID:</strong> ${newOrder._id}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Shipping Address:</strong> ${address}, ${city}, ${zipCode}</p>
          
          <h3>📦 Order Items:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${products.map(p => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px;">${p.name}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">x${p.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">Rs. ${(p.price * p.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          
          <hr>
          <p><strong>Subtotal:</strong> Rs. ${totalAmount.toFixed(2)}</p>
          ${totalSavings > 0 ? `<p><strong>Discount:</strong> -Rs. ${totalSavings.toFixed(2)}</p>` : ''}
          <p><strong>Total Amount:</strong> <strong style="font-size: 24px; color: #28a745;">Rs. ${finalAmount.toFixed(2)}</p>
          <p><strong>Payment:</strong> Cash on Delivery</p>
          
          <div style="background: #e7f3ff; padding: 15px; border-left: 5px solid #007bff; margin-top: 20px;">
            <strong>Action Required:</strong> Process this order in dashboard.
          </div>
        </div>
      `
    };

    await orderTransporter.sendMail(adminOrderOptions);
    
    res.status(201).json({ message: 'Order created successfully', order: newOrder, savings: totalSavings });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /allOrder - Get all orders
router.get('/allOrder', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /order/:id - Get single order
router.get('/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /allOrder/:id/status - Update order status
router.put('/allOrder/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

