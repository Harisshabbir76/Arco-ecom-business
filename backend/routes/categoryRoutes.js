const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');
const Category = require('../Models/Category');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage: storage });

// GET /categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const dbCategories = await Category.find();
    const productCategories = await Product.distinct('category');

    const result = [...dbCategories];
    const dbCatNames = dbCategories.map(c => c.name.toLowerCase().trim());

    productCategories.forEach(catName => {
      const normalized = (catName || '').toLowerCase().trim();
      if (normalized && !dbCatNames.includes(normalized)) {
        result.push({ name: catName, image: null });
      }
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// GET /api/categories - Get categories (admin)
router.get('/api/categories', async (req, res) => {
  try {
    const dbCategories = await Category.find();
    res.json(dbCategories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// POST /api/categories - Create category
router.post('/api/categories', upload.single('image'), async (req, res) => {
  try {
    const { name, showOnHome } = req.body;
    const isShowOnHome = showOnHome === 'true' || showOnHome === true;
    const image = req.file.path;
    const category = new Category({ name, image, showOnHome: isShowOnHome });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

// PUT /api/categories/:id - Update category
router.put('/api/categories/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, showOnHome } = req.body;
    const updateData = { name };
    if (showOnHome !== undefined) {
      updateData.showOnHome = showOnHome === 'true' || showOnHome === true;
    }
    if (req.file) updateData.image = req.file.path;
    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error updating category' });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/api/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// GET /category/:categoryName - Get products by category
router.get('/category/:categoryName', async (req, res) => {
  // Robust normalization for slugs like 'dinner-sets' or '-dinner-sets'
  let categoryName = req.params.categoryName.toLowerCase().replace(/^[-]+|[-]+$/g, '').trim();
  categoryName = categoryName.replace(/-+/g, ' ').trim();

  try {
    const products = await Product.find({
      category: { $regex: new RegExp(categoryName, 'i') }
    }).sort({ createdAt: -1 });

    res.json(products);  // Always return array, empty if no match
  } catch (err) {
    console.error('Error fetching category products:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = router;
