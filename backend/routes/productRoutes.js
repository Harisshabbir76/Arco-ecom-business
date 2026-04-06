const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');
const Review = require('../Models/Review');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage: storage });

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-');      // Replace multiple - with single -
}

// POST /dashboard/add-product - Add a new product
router.post('/dashboard/add-product', upload.fields([{name: 'images', maxCount: 10}, {name: 'designs', maxCount: 10}]), async (req, res) => {
  let { name, description, originalPrice, discountedPrice, category, stock, sizes, colors, featured } = req.body;
  featured = featured === 'true';
const imageFiles = req.files?.images || [];
  const designFiles = req.files?.designs || [];
  const imagePaths = imageFiles.map(file => file.path);
  const designPaths = designFiles.map(file => file.path);

  try {
    category = category.toLowerCase().trim();

    const variants = {};
    if (sizes) {
      variants.sizes = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()).filter(s => s) : sizes;
    }
    if (colors) {
      variants.colors = typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(c => c) : colors;
    }

    const baseSlug = slugify(name);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newProduct = new Product({
      name,
      description,
      originalPrice,
      discountedPrice,
      image: imagePaths,
      designs: designPaths,
      category,
      stock,
      slug: uniqueSlug,
      variants: Object.keys(variants).length > 0 ? variants : undefined,
      featured
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding product' });
  }
});

// GET /catalog - Get all products
router.get('/catalog', async (req, res) => {
  try {
    console.log('Fetching products from database...');
    const products = await Product.find().sort({ createdAt: -1 });
    console.log('Products found:', products);

    if (!Array.isArray(products)) {
      console.error('Products is not an array:', typeof products);
      return res.status(500).json({ error: 'Unexpected data format', data: [] });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error('Error in /catalog:', err);
    res.status(500).json({ error: 'Failed to fetch products', data: [] });
  }
});

// GET /new-arrival - Get new arrival products
router.get('/new-arrival', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const products = await Product.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 }).limit(10);

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// GET /search - Search products
router.get('/search', async (req, res) => {
  try {
    let { query } = req.query;
    console.log('Search query:', query);
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    query = query.trim().toLowerCase();
    const keywords = query.split(/\s+/);

    const regexConditions = keywords.flatMap((word) => [
      { name: { $regex: new RegExp(word, 'i') } },
      { description: { $regex: new RegExp(word, 'i') } },
      { category: { $regex: new RegExp(word, 'i') } }
    ]);

    const products = await Product.find({ $or: regexConditions }).limit(20);

    if (products.length === 0) {
      console.log('No matches found for:', keywords);
    }

    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// GET /product/:id - Get single product
router.get('/product/:id', async (req, res) => {
  const productId = req.params.id;
  const mongoose = require('mongoose');

  try {
    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ slug: productId });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length || 0;

    res.json({
      ...product.toObject(),
      reviews,
      averageRating: averageRating.toFixed(1),
      reviewCount: reviews.length
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /update/:id - Update a product
router.put('/update/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Always lowercase the category to keep it consistent with add route
    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase().trim();
    }
    // If name is being updated, regenerate the slug if it's missing or if the name changed
    if (updateData.name) {
      const existingProduct = await Product.findById(req.params.id);
      if (existingProduct && (existingProduct.name !== updateData.name || !existingProduct.slug)) {
        const baseSlug = slugify(updateData.name);
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await Product.findOne({ slug: uniqueSlug, _id: { $ne: req.params.id } })) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        updateData.slug = uniqueSlug;
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /delete/:id - Delete a product
router.delete('/delete/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/list - Get products for admin (bundle creation)
router.get('/api/products/list', async (req, res) => {
  try {
    const products = await Product.find().select('name originalPrice discountedPrice image').sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// GET /api/featured-products - Get featured products for home page
router.get('/api/featured-products', async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).sort({ createdAt: -1 }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching featured products' });
  }
});

module.exports = router;

