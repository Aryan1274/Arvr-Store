const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// Get settings by key
router.get('/:key', async (req, res) => {
  try {
    const key = req.params.key === 'theme' ? 'activeTheme' : req.params.key;
    let setting = await Setting.findOne({ key });
    
    if (!setting) {
      if (key === 'activeTheme') {
        setting = await Setting.create({ key: 'activeTheme', value: 'pink' });
      } else if (key === 'payment_methods') {
        setting = await Setting.create({ 
          key: 'payment_methods', 
          value: { cod: true, online: true, whatsapp: true } 
        });
      }
    }

    // For backwards compatibility with ThemeContext.jsx
    if (req.params.key === 'theme') {
      return res.json({ theme: setting.value });
    }
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Support both POST (old) and PUT (new) for theme
router.post('/theme', async (req, res) => {
  try {
    const { theme } = req.body;
    const updated = await Setting.findOneAndUpdate(
      { key: 'activeTheme' },
      { value: theme },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ theme: updated.value });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update settings by key
router.put('/:key', async (req, res) => {
  try {
    const key = req.params.key === 'theme' ? 'activeTheme' : req.params.key;
    const value = req.params.key === 'theme' ? req.body.theme : req.body.value;
    
    const updated = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, returnDocument: 'after' }
    );

    if (req.params.key === 'theme') {
      return res.json({ theme: updated.value });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
