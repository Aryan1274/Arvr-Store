const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Determine role based on email
    const assignRole = email === 'official.arvr@gmail.com' ? 'admin' : 'customer';

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        role: assignRole
      });
    } else {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (user.role !== assignRole && assignRole === 'admin') {
        user.role = assignRole;
        updated = true;
      }
      if (updated) await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ message: 'Invalid Google Token' });
  }
});

module.exports = router;
