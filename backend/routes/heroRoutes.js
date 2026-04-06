const express = require('express');
const router = express.Router();
const HeroSlide = require('../Models/HeroSlide');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 15 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  }
});

// GET /api/hero-slides
router.get('/api/hero-slides', async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching slides' });
  }
});

// POST /api/hero-slides
router.post('/api/hero-slides', upload.fields([
  { name: 'desktopImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, subtitle, ctaText, ctaLink } = req.body;
    const desktopImage = req.files?.desktopImage?.[0]?.path;
    const mobileImage = req.files?.mobileImage?.[0]?.path;

    if (!desktopImage) {
      return res.status(400).json({ message: 'Desktop image is required (max 10MB - resize if needed)' });
    }
    if (!mobileImage) {
      return res.status(400).json({ message: 'Mobile image is required (max 10MB - resize if needed)' });
    }

    const slide = new HeroSlide({ 
      desktopImage, 
      mobileImage, 
      // Store exactly what was sent — empty string stays empty, no defaults
      title:    title    ?? '',
      subtitle: subtitle ?? '',
      ctaText:  ctaText  ?? '',
      ctaLink:  ctaLink  ?? '',
    });
    await slide.save();
    res.status(201).json(slide);
  } catch (err) {
    console.error('Create slide error:', err);
    if (err.message.includes('Cloudinary') || err.message.includes('file size')) {
      res.status(400).json({ message: 'Image too large. Please use <10MB images (Cloudinary free plan limit). Resize your images.' });
    } else {
      res.status(500).json({ message: 'Error creating slide', error: err.message });
    }
  }
});

// PUT /api/hero-slides/:id
router.put('/api/hero-slides/:id', upload.fields([
  { name: 'desktopImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, subtitle, ctaText, ctaLink, isActive } = req.body;

    const updateData = { 
      // Use ?? so that an empty string ("") is kept as-is instead of being replaced by a default
      title:    title    ?? '',
      subtitle: subtitle ?? '',
      ctaText:  ctaText  ?? '',
      ctaLink:  ctaLink  ?? '',
      ...(isActive !== undefined && { isActive }),
    };
    
    // Only update images if new ones were uploaded
    if (req.files?.desktopImage) updateData.desktopImage = req.files.desktopImage[0].path;
    if (req.files?.mobileImage)  updateData.mobileImage  = req.files.mobileImage[0].path;

    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json(slide);
  } catch (err) {
    console.error('Update slide error:', err);
    if (err.message.includes('Cloudinary') || err.message.includes('file size')) {
      res.status(400).json({ message: 'Image too large. Please use <10MB images.' });
    } else {
      res.status(500).json({ message: 'Error updating slide', error: err.message });
    }
  }
});

// DELETE /api/hero-slides/:id
router.delete('/api/hero-slides/:id', async (req, res) => {
  try {
    await HeroSlide.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slide deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting slide' });
  }
});

module.exports = router;