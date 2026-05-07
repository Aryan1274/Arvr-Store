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
});// Get a single collection by ID
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate({
      path: 'products',
      populate: { path: 'tags' }
    });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });
    res.json(collection);
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
      let flashDealEnd = undefined;
      if (template === 'deal') {
        flashDealEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      collection = new Collection({
        name,
        title: title || name,
        products: products || [],
        order: order || 0,
        template: template || 'default',
        isActive: isActive !== undefined ? isActive : true,
        flashDealEnd
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
    const updateData = { title, order, template, isActive, products };
    
    if (template === 'deal') {
      // Set 24 hour timer only if it's not already set (to prevent resetting on every edit)
      // or if it was NOT a deal before.
      const existing = await Collection.findById(req.params.id);
      if (existing.template !== 'deal' || !existing.flashDealEnd) {
        updateData.flashDealEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
    } else {
      updateData.flashDealEnd = null;
    }

    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      updateData,
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
