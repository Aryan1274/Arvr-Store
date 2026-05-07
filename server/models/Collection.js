const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Internal ID like 'trending', 'recommended'
  title: { type: String }, // Display title like 'Trending Now'
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  template: { type: String, default: 'default' } // 'default', 'offer', 'deal'
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);
