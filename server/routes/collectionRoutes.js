const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

// Get all collections sorted by order
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find().sort('order').populate({
      path: 'products',
      populate: { path: 'tags' }
    });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new collection
router.post('/', async (req, res) => {
  try {
    const { name, title, products, order, template, isActive } = req.body;
    
    // Check if collection with name exists
    let collection = await Collection.findOne({ name });
    
    if (collection) {
      // Update existing
      collection.title = title || collection.title;
      collection.products = products || collection.products;
      collection.order = order !== undefined ? order : collection.order;
      collection.template = template || collection.template;
      collection.isActive = isActive !== undefined ? isActive : collection.isActive;
      await collection.save();
    } else {
      // Create new
      collection = new Collection({
        name,
        title: title || name,
        products: products || [],
        order: order || 0,
        template: template || 'default',
        isActive: isActive !== undefined ? isActive : true
      });
      await collection.save();
    }

    const populated = await Collection.findById(collection._id).populate({
      path: 'products',
      populate: { path: 'tags' }
    });
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a collection by ID
router.put('/:id', async (req, res) => {
  try {
    const { title, order, template, isActive, products } = req.body;
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      { title, order, template, isActive, products },
      { new: true }
    ).populate({
      path: 'products',
      populate: { path: 'tags' }
    });
    res.json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a collection by ID
router.delete('/:id', async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
