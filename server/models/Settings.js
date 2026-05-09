const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'payment_methods'
  value: { type: mongoose.Schema.Types.Mixed, required: true } // e.g., { cod: true, online: true, whatsapp: true }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
