const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// Get settings by key
router.get('/:key', async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: req.params.key });
    if (!setting) {
      // Default settings
      if (req.params.key === 'payment_methods') {
        setting = await Setting.create({ 
          key: 'payment_methods', 
          value: { cod: true, online: true, whatsapp: true } 
        });
      }
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update settings by key
router.put('/:key', async (req, res) => {
  try {
    const updated = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
