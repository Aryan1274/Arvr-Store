const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true }, // Cloudinary URL (Logo)
  isSuspended: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Tag', tagSchema);
