const mongoose = require('mongoose');
const Counter = require('./Counter');

const productSchema = new mongoose.Schema({
  customId: { type: String, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String, required: true }], // Cloudinary URLs
  availability: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  variants: {
    sizes: [String],
    colors: [String],
    custom: {
      title: String,
      options: [String]
    }
  },
  returnPolicy: { type: String, default: "No Return" },
  deliveryTime: { type: String, default: "Delivery under 10 days" },
  shippingCharges: { type: Number, default: 49 }
}, { timestamps: true });

productSchema.pre('save', async function() {
  if (!this.isNew) return;
  
  const counter = await Counter.findOneAndUpdate(
    { id: 'productId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  // Start from 100
  const sequenceNumber = counter.seq + 99;
  this.customId = `product${sequenceNumber}`;
});

module.exports = mongoose.model('Product', productSchema);
