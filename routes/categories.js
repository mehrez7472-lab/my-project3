const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// GET all categories (public)
router.get('/', async (req, res) => {
  try {
    const cats = await Category.find({ active: true }).sort({ order: 1 });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all categories including inactive (admin)
router.get('/all', auth, async (req, res) => {
  try {
    const cats = await Category.find().sort({ order: 1 });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create category (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { nameAr, nameEn, icon, order } = req.body;
    const cat = new Category({ name: { ar: nameAr, en: nameEn }, icon, order: Number(order) || 0 });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update category (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { nameAr, nameEn, icon, order, active } = req.body;
    const cat = await Category.findByIdAndUpdate(req.params.id, {
      name: { ar: nameAr, en: nameEn }, icon, order: Number(order) || 0, active: active !== false
    }, { new: true });
    res.json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE category (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
