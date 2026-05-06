const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    const products = await Product.find(filter).populate('category').sort({ order: 1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create product (admin)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { nameAr, nameEn, descAr, descEn, price, category, inStock, featured, order } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    const product = new Product({
      name: { ar: nameAr, en: nameEn },
      description: { ar: descAr || '', en: descEn || '' },
      price: Number(price),
      category,
      images,
      inStock: inStock !== 'false',
      featured: featured === 'true',
      order: Number(order) || 0
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update product (admin)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { nameAr, nameEn, descAr, descEn, price, category, inStock, featured, order, keepImages } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = { ar: nameAr, en: nameEn };
    product.description = { ar: descAr || '', en: descEn || '' };
    product.price = Number(price);
    product.category = category;
    product.inStock = inStock !== 'false';
    product.featured = featured === 'true';
    product.order = Number(order) || 0;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => '/uploads/' + f.filename);
      product.images = keepImages ? [...(JSON.parse(keepImages || '[]')), ...newImages] : newImages;
    } else if (keepImages) {
      product.images = JSON.parse(keepImages);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE product (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
