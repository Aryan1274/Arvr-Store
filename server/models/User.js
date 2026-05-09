const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  address: {
    name: String,
    mobile: String,
    addressLine: String,
    landmark: String,
    pincode: String,
    city: String,
    state: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
