const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');

// GET all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('applicableProducts').sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a coupon
router.post('/', async (req, res) => {
  const coupon = new Coupon(req.body);
  try {
    const newCoupon = await coupon.save();
    res.status(201).json(newCoupon);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A coupon with this code already exists.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// DELETE a coupon
router.delete('/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VALIDATE a coupon
router.post('/validate', async (req, res) => {
  const { code, productIds } = req.body;
  try {
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon code' });

    // Check if any product in the cart is applicable
    const applicableInCart = productIds.filter(id => 
      coupon.applicableProducts.map(ap => ap.toString()).includes(id)
    );

    if (applicableInCart.length === 0) {
      return res.status(400).json({ message: 'This coupon is not applicable to the products in your cart' });
    }

    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
