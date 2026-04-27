const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { upload } = require('../config/cloudinary');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new category
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const imageUrl = req.file ? req.file.path : '';

    if (!imageUrl) {
      return res.status(400).json({ message: 'Category image is required.' });
    }

    const category = new Category({ name, image: imageUrl });
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE category (Suspend/Unsuspend)
router.put('/:id', async (req, res) => {
  try {
    const { isSuspended, name } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (isSuspended !== undefined) updateData.isSuspended = isSuspended;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' }
    );
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE categories (Multiple)
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    await Category.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Categories deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
