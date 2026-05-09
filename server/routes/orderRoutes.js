const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/emailUtils');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order (COD or Online)
router.post('/create', async (req, res) => {
  try {
    const { products, totalPrice, subTotal, shippingCharges, paymentType, address, userId } = req.body;

    const newOrder = new Order({
      user: userId,
      products,
      subTotal,
      shippingCharges,
      totalPrice,
      paymentType,
      address,
      status: paymentType === 'COD' ? 'Processing' : 'Pending'
    });

    const savedOrder = await newOrder.save();

    // Populate products for the email
    const populatedOrder = await Order.findById(savedOrder._id).populate('products.product');

    if (paymentType === 'COD') {
      // Send email in background to prevent hanging the response
      sendOrderConfirmationEmail(populatedOrder).catch(err => console.error('Background email error:', err));
      return res.status(201).json({ success: true, order: savedOrder });
    }

    // If online payment, create Razorpay order
    const options = {
      amount: Math.round(totalPrice * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${savedOrder._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    res.status(201).json({
      success: true,
      order: savedOrder,
      razorpayOrder
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify Payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const order = await Order.findByIdAndUpdate(orderId, { status: 'Processing' }, { returnDocument: 'after' }).populate('products.product');
      sendOrderConfirmationEmail(order).catch(err => console.error('Background email error:', err));
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      await Order.findByIdAndUpdate(orderId, { status: 'Failed' });
      res.status(400).json({ success: false, message: 'Invalid Signature' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch Orders for User
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).populate('products.product').sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch All Orders (Admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('products.product').sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Order Status & Delivery Date (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, deliveryDate } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (deliveryDate) updateData.deliveryDate = deliveryDate;

    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (order) {
      await sendOrderStatusUpdateEmail(order);
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Order (Admin)
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
