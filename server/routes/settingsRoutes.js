const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get settings by key
router.get('/:key', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: req.params.key });
    if (!settings) {
      // Default settings if not found
      if (req.params.key === 'payment_methods') {
        settings = new Settings({
          key: 'payment_methods',
          value: { cod: true, online: true, whatsapp: true }
        });
        await settings.save();
      }
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update settings
router.put('/:key', async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
