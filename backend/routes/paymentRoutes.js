const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Order = require('../Models/Order');
const Discount = require('../Models/Discount');
const Product = require('../Models/Product');
const axios = require('axios');

// Initialize Stripe with secret key
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;



// Security: Validate cart totals on server side
// This prevents clients from manipulating prices
async function validateCartTotals(products, clientTotal) {
  let serverCalculatedTotal = 0;
  const validatedProducts = [];

  for (const item of products) {
    // Get product from database to verify price
    let product;
    if (item.productId) {
      product = await Product.findById(item.productId);
    }
    
    // Use database price if available, otherwise use provided price (for compatibility)
    const verifiedPrice = product ? product.price : item.price;
    const itemTotal = verifiedPrice * item.quantity;
    serverCalculatedTotal += itemTotal;

    validatedProducts.push({
      productId: item.productId || item.productId,
      name: product ? product.name : item.name,
      quantity: item.quantity,
      price: verifiedPrice,
      category: product ? product.category : item.category,
      size: item.size || item.selectedSize,
      color: item.color || item.selectedColor
    });
  }

  // Allow small floating point differences (within 0.01)
  const difference = Math.abs(serverCalculatedTotal - clientTotal);
  if (difference > 0.01) {
    console.warn(`Price manipulation detected! Client: ${clientTotal}, Server: ${serverCalculatedTotal}`);
    return { valid: false, products: validatedProducts, calculatedTotal: serverCalculatedTotal };
  }

  return { valid: true, products: validatedProducts, calculatedTotal: serverCalculatedTotal };
}

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

// POST /api/create-payment-intent - Create Stripe payment intent
router.post('/api/create-payment-intent', async (req, res) => {
  const { amount, currency, products, couponCode } = req.body;

  if (!stripe) {
    return res.status(500).json({ error: 'Payment processing not configured' });
  }

  // Security: Validate cart totals on server side
  const validation = await validateCartTotals(products, amount);
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Invalid cart total. Prices have been tampered with.',
      serverCalculated: validation.calculatedTotal
    });
  }

  try {
    // Calculate discounts using validated products (in original currency - PKR)
    const { totalSavings, breakdown } = await calculateDiscounts(amount, validation.products, couponCode);
    const amountAfterDiscount = amount - totalSavings;
    
    // Use the currency passed from frontend (defaulting to pkr for this store)
    const stripeCurrency = (currency || 'pkr').toLowerCase();
    const stripeAmount = Math.round(amountAfterDiscount);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: stripeCurrency,
      payment_method_types: ['card'],
      metadata: {
        couponCode: couponCode || '',
        discountAmount: totalSavings.toString(),
        originalAmount: amount.toString(),
        currency: stripeCurrency,
        finalAmount: (stripeAmount / 100).toString(),
        validatedProducts: JSON.stringify(validation.products.map(p => ({
          productId: p.productId,
          price: p.price,
          quantity: p.quantity
        })))
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: stripeAmount,
      currency: stripeCurrency,
      discount: totalSavings,
      breakdown,
      finalAmount: stripeAmount / 100
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// POST /api/process-payment - Process completed payment
router.post('/api/process-payment', async (req, res) => {
  const { 
    paymentIntentId, 
    customerName, 
    email, 
    phone, 
    address, 
    city, 
    zipCode, 
    products, 
    totalAmount, 
    couponCode,
    paymentMethod 
  } = req.body;

  try {
    // Calculate discounts
    const { totalSavings, breakdown } = await calculateDiscounts(totalAmount, products, couponCode);
    const finalAmount = totalAmount - totalSavings;

    // Create order with payment info - totalAmount in original PKR
    const newOrder = new Order({
      customerName,
      email,
      phone,
      address,
      city,
      zipCode,
      products,
      totalAmount: finalAmount,  // PKR final amount
      appliedDiscount: totalSavings,
      discountBreakdown: breakdown,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'paid',
      paymentIntentId: paymentIntentId || null,
      stripeCustomerEmail: email
    });

    await newOrder.save();

    res.status(201).json({ 
      success: true, 
      order: newOrder, 
      savings: totalSavings 
    });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// GET /api/payment-config - Get payment configuration (public key only)
router.get('/api/payment-config', (req, res) => {
  res.json({
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
    payoneerEmail: process.env.PAYONEER_RECEIVING_ACCOUNT_EMAIL || '',
    isPaymentEnabled: !!stripe
  });
});

// POST /api/payment/webhook - Handle Stripe payment events
// NOTE: Raw body parsing is handled in index.js for webhook signature verification
router.post('/api/payment/webhook', async (req, res) => {
  // When using global raw body middleware, req.body is already a Buffer
  // We need to handle both cases: raw body from middleware or parsed JSON
  let event;
  
  if (!stripe) {
    console.error('Stripe not configured');
    return res.status(500).json({ error: 'Payment processing not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    // Get the raw body - it could be in req.body (Buffer) or already parsed
    const rawBody = Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body);
    
    // Verify webhook signature
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // If no webhook secret, parse the body directly (for testing)
      event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Find and update the order
        const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'confirmed';
          await order.save();
          console.log(`Order ${order._id} marked as paid`);
        } else {
          console.log('Order not found for payment intent:', paymentIntent.id);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Find and update the order
        const failedOrder = await Order.findOne({ paymentIntentId: failedPayment.id });
        if (failedOrder) {
          failedOrder.paymentStatus = 'failed';
          await failedOrder.save();
          console.log(`Order ${failedOrder._id} marked as failed`);
        }
        break;

      case 'charge.refunded':
        const refund = event.data.object;
        console.log('Payment refunded:', refund.id);
        
        // Find and update the order
        const refundedOrder = await Order.findOne({ paymentIntentId: refund.payment_intent });
        if (refundedOrder) {
          refundedOrder.paymentStatus = 'refunded';
          await refundedOrder.save();
          console.log(`Order ${refundedOrder._id} marked as refunded`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/payment/verify/:paymentIntentId - Verify payment status
router.get('/api/payment/verify/:paymentIntentId', async (req, res) => {
  const { paymentIntentId } = req.params;

  if (!stripe) {
    return res.status(500).json({ error: 'Payment processing not configured' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Find order by payment intent
    const order = await Order.findOne({ paymentIntentId });
    
    res.json({
      status: paymentIntent.status,
      orderStatus: order?.paymentStatus || 'not_found',
      orderId: order?._id || null
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// POST /api/payment/refund - Process refund (admin endpoint)
router.post('/api/payment/refund', async (req, res) => {
  const { paymentIntentId, amount } = req.body;

  if (!stripe) {
    return res.status(500).json({ error: 'Payment processing not configured' });
  }

  try {
    // Verify payment exists
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not eligible for refund' });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined // Amount in cents, optional
    });

    // Update order status
    const order = await Order.findOne({ paymentIntentId });
    if (order) {
      order.paymentStatus = amount ? 'paid' : 'refunded'; // Partial refund keeps 'paid'
      await order.save();
    }

    res.json({
      success: true,
      refundId: refund.id,
      status: refund.status
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

module.exports = router;

