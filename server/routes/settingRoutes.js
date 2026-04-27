const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// Get active theme
router.get('/theme', async (req, res) => {
  try {
    let theme = await Setting.findOne({ key: 'activeTheme' });
    if (!theme) {
      theme = await Setting.create({ key: 'activeTheme', value: 'pink' });
    }
    res.json({ theme: theme.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update active theme
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

module.exports = router;
