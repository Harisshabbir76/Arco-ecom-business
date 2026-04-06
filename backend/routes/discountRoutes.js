const express = require('express');
const router = express.Router();
const Discount = require('../Models/Discount');
const Product = require('../Models/Product');

// GET /api/discounts - Get all discounts
router.get('/api/discounts', async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching discounts' });
  }
});

// POST /api/discounts - Create a discount
router.post('/api/discounts', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.code === "" || data.code === null) {
      delete data.code;
    }
    const discount = new Discount(data);
    await discount.save();
    res.status(201).json(discount);
  } catch (err) {
    console.error('Error creating discount:', err);
    res.status(500).json({ message: 'Error creating discount', error: err.message });
  }
});

// PUT /api/discounts/:id - Update a discount
router.put('/api/discounts/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.code === "" || data.code === null) {
      delete data.code;
    }
    const discount = await Discount.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(discount);
  } catch (err) {
    console.error('Error updating discount:', err);
    res.status(500).json({ message: 'Error updating discount', error: err.message });
  }
});

// DELETE /api/discounts/:id - Delete a discount
router.delete('/api/discounts/:id', async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discount deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting discount' });
  }
});

// POST /api/apply-coupon - Apply coupon code
router.post('/api/apply-coupon', async (req, res) => {
  const { code, totalAmount, products } = req.body;
  try {
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

    if (code && !breakdown.some(b => b.type === 'COUPON')) {
      const checkCoupon = await Discount.findOne({ code, isActive: true });
      if (!checkCoupon) return res.status(404).json({ message: 'Invalid coupon' });
      return res.status(400).json({ message: 'Coupon not applicable to items in cart' });
    }

    res.json({ discount: totalSavings, breakdown });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error applying discounts' });
  }
});

module.exports = router;

