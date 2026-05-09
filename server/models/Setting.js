const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'activeTheme'
  value: { type: mongoose.Schema.Types.Mixed, required: true } // 'pink', { cod: true, ... }, etc.
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
