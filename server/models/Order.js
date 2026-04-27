const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 }
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Dispatched', 'Delivered'], default: 'Pending' },
  deliveryDate: { type: Date },
  paymentType: { type: String, enum: ['COD', 'Online'], required: true },
  address: {
    name: String,
    mobile: String,
    email: String,
    addressLine: String,
    landmark: String,
    pincode: String,
    city: String,
    state: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
