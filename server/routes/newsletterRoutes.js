const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// @route   POST api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
  const { email, userId } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if already subscribed
    let subscriber = await Newsletter.findOne({ email });
    if (subscriber) {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }

    subscriber = new Newsletter({
      email,
      userId
    });

    await subscriber.save();
    res.status(201).json({ message: 'Successfully subscribed to newsletter!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/newsletter/subscribers
// @desc    Get all subscribers (Admin only - for future use)
// @access  Private/Admin
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
