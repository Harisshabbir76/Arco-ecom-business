const express = require('express');
const router = express.Router();
const FAQ = require('../Models/FAQ');

// GET /api/faqs - Get all FAQs (public - only active ones)
router.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    console.log('FAQ query result:', faqs.length, 'FAQs found');
    res.json(faqs);
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
});

// GET /api/faqs/admin - Get all FAQs for admin (including inactive)
router.get('/api/faqs/admin', async (req, res) => {
  try {
    console.log('Fetching all FAQs for admin...');
    const faqs = await FAQ.find({}).sort({ order: 1, createdAt: -1 });
    console.log('Found FAQs:', faqs.length);
    res.json(faqs);
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
});

// POST /api/faqs - Create a new FAQ
router.post('/api/faqs', async (req, res) => {
  try {
    console.log('Creating FAQ with data:', req.body);
    const { question, answer, isActive, order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const faq = new FAQ({
      question,
      answer,
      isActive: isActive !== false,
      order: order || 0
    });

    await faq.save();
    console.log('FAQ created successfully:', faq._id);
    res.status(201).json(faq);
  } catch (err) {
    console.error('Error creating FAQ:', err);
    res.status(500).json({ message: 'Error creating FAQ', error: err.message });
  }
});

// PUT /api/faqs/:id - Update a FAQ
router.put('/api/faqs/:id', async (req, res) => {
  try {
    const { question, answer, isActive, order } = req.body;

    const updateData = {};
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;

    const faq = await FAQ.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(faq);
  } catch (err) {
    console.error('Error updating FAQ:', err);
    res.status(500).json({ message: 'Error updating FAQ' });
  }
});

// DELETE /api/faqs/:id - Delete a FAQ
router.delete('/api/faqs/:id', async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted' });
  } catch (err) {
    console.error('Error deleting FAQ:', err);
    res.status(500).json({ message: 'Error deleting FAQ' });
  }
});

module.exports = router;