const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
