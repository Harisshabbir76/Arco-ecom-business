const Review = require('../Models/Review');
const Product = require('../Models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .sort({ createdAt: -1 });
  
  res.json(reviews);
});

// @desc    Add a review
// @route   POST /api/reviews
// @access  Public
const addReview = asyncHandler(async (req, res) => {
  const { product, userName, userEmail, rating, comment } = req.body;

  const productExists = await Product.findById(product);
  if (!productExists) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = await Review.create({
    product,
    userName,
    userEmail,
    rating,
    comment
  });

  res.status(201).json(review);
});

module.exports = {
  getReviews,
  addReview
};