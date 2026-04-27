const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Discount', 'Promo Code', 'Special Code'], required: true },
  discountType: { type: String, enum: ['Amount', 'Percentage'], required: true },
  discountValue: { type: Number, required: true },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
