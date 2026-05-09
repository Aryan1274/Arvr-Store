const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../utils/emailUtils');

// @route   POST api/contact
// @desc    Send a contact message
// @access  Public
router.post('/', async (req, res) => {
  const { email, message, name } = req.body;

  if (!email || !message) {
    return res.status(400).json({ message: 'Email and message are required' });
  }

  try {
    await sendContactEmail({ email, message, name });
    res.json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
