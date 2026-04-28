const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { upload } = require('../config/cloudinary');

// SEARCH products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');

    // 1. Find matching tags first
    const Tag = require('../models/Tag');
    const matchedTags = await Tag.find({ name: regex });
    const tagIds = matchedTags.map(t => t._id);

    // 2. Search products by name, category, description, or matching tag IDs
    const products = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { description: regex },
        { customId: regex },
        { tags: { $in: tagIds } }
      ]
    }).populate('tags');
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all products (optionally filter by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category: { $regex: new RegExp(`^${category}$`, 'i') } } : {};
    const products = await Product.find(filter).populate('tags');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('tags');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new product (Admin typically)
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, stock, tags, variants } = req.body;
    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    
    let parsedTags = [];
    let parsedVariants = {};
    try {
      if (tags) parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      if (variants) parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    } catch (err) { console.error('Parsing error', err); }

    if (imageUrls.length === 0) {
      return res.status(400).json({ message: 'At least one image is required.' });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      tags: parsedTags,
      variants: parsedVariants,
      images: imageUrls
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE product (Admin)
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, stock, existingImages, tags, variants } = req.body;
    let imageUrls = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];
    
    let parsedTags = [];
    let parsedVariants = {};
    try {
      if (tags) parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      if (variants) parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    } catch (err) { console.error('Parsing error', err); }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      imageUrls = [...imageUrls, ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, stock, images: imageUrls, tags: parsedTags, variants: parsedVariants },
      { returnDocument: 'after' }
    ).populate('tags');
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE product (Admin)
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
