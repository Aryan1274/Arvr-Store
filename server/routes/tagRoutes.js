const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const { upload } = require('../config/cloudinary');

// GET all tags
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new tag
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const imageUrl = req.file ? req.file.path : '';

    if (!imageUrl) {
      return res.status(400).json({ message: 'Tag logo is required.' });
    }

    const tag = new Tag({ name, image: imageUrl });
    const savedTag = await tag.save();
    res.status(201).json(savedTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE tag (Suspend/Unsuspend)
router.put('/:id', async (req, res) => {
  try {
    const { isSuspended, name } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (isSuspended !== undefined) updateData.isSuspended = isSuspended;

    const updatedTag = await Tag.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' }
    );
    res.json(updatedTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE tags (Multiple)
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    await Tag.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Tags deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
