const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Bundle = require('../Models/Bundle');
const Product = require('../Models/Product');

// GET /api/bundles - Get all bundles
router.get('/api/bundles', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    const showActiveOnly = req.query.active === 'true';
    
    let bundles;
    
    if (showAll) {
      bundles = await Bundle.find({})
        .populate('products')
        .sort({ createdAt: -1 });
      return res.json(bundles);
    }
    
    bundles = await Bundle.find({})
      .populate('products')
      .sort({ createdAt: -1 });
    
    const now = new Date();
    const activeBundles = bundles.filter(bundle => {
      if (bundle.isActive === false) return false;
      if (bundle.isLifetime) return true;
      if (!bundle.startDate && !bundle.endDate) return true;
      const afterStart = !bundle.startDate || now >= new Date(bundle.startDate);
      const beforeEnd = !bundle.endDate || now <= new Date(bundle.endDate);
      return afterStart && beforeEnd;
    });
    
    res.json(activeBundles);
  } catch (err) {
    console.error('Error fetching bundles:', err);
    res.status(500).json({ message: 'Error fetching bundles' });
  }
});

// GET /api/bundles/latest - Get latest 8 bundles
router.get('/api/bundles/latest', async (req, res) => {
  try {
    const bundles = await Bundle.find({})
      .populate('products')
      .sort({ createdAt: -1 });
    
    const now = new Date();
    const activeBundles = bundles.filter(bundle => {
      if (bundle.isActive === false) return false;
      if (bundle.isLifetime) return true;
      if (!bundle.startDate && !bundle.endDate) return true;
      const afterStart = !bundle.startDate || now >= new Date(bundle.startDate);
      const beforeEnd = !bundle.endDate || now <= new Date(bundle.endDate);
      return afterStart && beforeEnd;
    });
    
    res.json(activeBundles.slice(0, 8));
  } catch (err) {
    console.error('Error fetching bundles:', err);
    res.status(500).json({ message: 'Error fetching bundles' });
  }
});

// POST /api/bundles - Create a new bundle
router.post('/api/bundles', async (req, res) => {
  try {
    const { name, description, productIds, bundlePrice, image, isActive, isLifetime, startDate, endDate } = req.body;
    
    console.log('Creating bundle with data:', { name, productIds, bundlePrice, isActive, isLifetime });
    
    if (!name || !bundlePrice) {
      return res.status(400).json({ message: 'Name and bundle price are required' });
    }
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'At least one product is required' });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    
    if (products.length === 0) {
      return res.status(400).json({ message: 'No valid products found for the given IDs' });
    }
    
    const originalPrice = products.reduce((sum, p) => sum + (p.discountedPrice || p.originalPrice || 0), 0);

    const bundle = new Bundle({
      name,
      description: description || '',
      products: productIds.map(id => new mongoose.Types.ObjectId(id)),
      originalPrice,
      bundlePrice,
      image: image || '',
      isActive: isActive !== false,
      isLifetime: isLifetime !== false,
      startDate: startDate || null,
      endDate: endDate || null
    });

    await bundle.save();
    console.log('Bundle created successfully:', bundle._id);
    
    const populatedBundle = await Bundle.findById(bundle._id).populate('products');
    res.status(201).json(populatedBundle);
  } catch (err) {
    console.error('Error creating bundle:', err);
    res.status(500).json({ message: 'Error creating bundle', error: err.message });
  }
});

// PUT /api/bundles/:id - Update a bundle
router.put('/api/bundles/:id', async (req, res) => {
  try {
    const { name, description, productIds, bundlePrice, image, isActive, isLifetime, startDate, endDate } = req.body;
    
    const updateData = { 
      name, 
      description, 
      bundlePrice, 
      isActive,
      isLifetime: isLifetime || false,
      startDate: startDate || null,
      endDate: endDate || null
    };
    
    if (productIds) {
      const products = await Product.find({ _id: { $in: productIds } });
      const originalPrice = products.reduce((sum, p) => sum + (p.discountedPrice || p.originalPrice || 0), 0);
      updateData.originalPrice = originalPrice;
      updateData.products = productIds;
    }
    
    if (image !== undefined) {
      updateData.image = image;
    }

    const bundle = await Bundle.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('products');
    res.json(bundle);
  } catch (err) {
    console.error('Error updating bundle:', err);
    res.status(500).json({ message: 'Error updating bundle' });
  }
});

// DELETE /api/bundles/:id - Delete a bundle
router.delete('/api/bundles/:id', async (req, res) => {
  try {
    await Bundle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bundle deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting bundle' });
  }
});

// POST /api/bundles/calculate-price - Calculate bundle original price
router.post('/api/bundles/calculate-price', async (req, res) => {
  try {
    const { productIds } = req.body;
    const products = await Product.find({ _id: { $in: productIds } });
    const originalPrice = products.reduce((sum, p) => sum + (p.discountedPrice || p.originalPrice || 0), 0);
    res.json({ originalPrice, products });
  } catch (err) {
    res.status(500).json({ message: 'Error calculating price' });
  }
});

module.exports = router;

