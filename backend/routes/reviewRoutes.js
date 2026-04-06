const express = require('express');
const router = express.Router();
const Review = require('../Models/Review');
const Product = require('../Models/Product');

// GET /api/reviews/:productId - Get reviews for a product
router.get('/api/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// POST /api/reviews - Add a review
router.post('/api/reviews', async (req, res) => {
  try {
    const { product, userName, userEmail, rating, comment } = req.body;

    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = await Review.create({
      product,
      userName,
      userEmail,
      rating,
      comment
    });

    // Calculate new average rating and review count
    const reviews = await Review.find({ product });
    const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings / reviews.length;
    const reviewCount = reviews.length;

    await Product.findByIdAndUpdate(product, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Error adding review' });
  }
});

module.exports = router;

