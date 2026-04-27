const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

// Get all collections with populated products
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find().populate({
      path: 'products',
      populate: { path: 'tags' }
    });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or Update a collection
router.post('/', async (req, res) => {
  try {
    const { name, products } = req.body;
    const collection = await Collection.findOneAndUpdate(
      { name },
      { products },
      { upsert: true, returnDocument: 'after' }
    ).populate({
      path: 'products',
      populate: { path: 'tags' }
    });
    res.json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
