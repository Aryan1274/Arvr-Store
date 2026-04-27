const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'activeTheme'
  value: { type: String, required: true } // 'pink', 'blue', 'white'
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
