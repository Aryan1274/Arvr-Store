const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Internal ID like 'trending', 'recommended'
  title: { type: String }, // Display title like 'Trending Now'
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  template: { type: String, default: 'default' }, // 'default', 'offer', 'deal', 'card'
  flashDealEnd: { type: Date },
  cards: [{
    text: { type: String },
    image: { type: String },
    cardType: { type: String, enum: ['price', 'custom'], default: 'price' },
    minPriceLimit: { type: Number },
    priceLimit: { type: Number },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);
