const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('EMAIL_USER or EMAIL_PASS is missing in environment variables');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendOrderConfirmationEmail = async (order) => {
  const transporter = createTransporter();
  if (!transporter) return;
  
  const { address, products, totalPrice, _id } = order;
  
  const productDetails = products.map(p => {
    const productName = p.product?.name || 'Deleted Product';
    const productPrice = p.price || p.product?.price || 0;
    const productImage = p.product?.images?.[0] || 'https://via.placeholder.com/60';
    return `
    <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
      <img src="${productImage}" alt="${productName}" style="width: 60px; height: 60px; object-cover; border-radius: 8px; margin-right: 15px;" />
      <div>
        <p style="margin: 0; font-weight: bold; color: #333;">${productName}</p>
        <p style="margin: 0; font-size: 12px; color: #666;">Qty: ${p.quantity} | ₹${productPrice}</p>
      </div>
    </div>
  `}).join('');

  const mailOptions = {
    from: `"ArVr Store" <${process.env.EMAIL_USER}>`,
    to: address.email,
    subject: `Order Confirmed - #${_id.toString().slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f472b6; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ArVr Store</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333;">Thank you for purchasing!</h2>
          <p style="color: #555;">Best wishes from us, <strong>${address.name}</strong>. Great doing business with you!</p>
          
          <div style="margin: 30px 0; background-color: #fafafa; padding: 20px; border-radius: 12px;">
            <h3 style="margin-top: 0; border-bottom: 2px solid #f472b6; display: inline-block; padding-bottom: 5px;">Order Details</h3>
            <div style="margin-top: 15px;">
              ${productDetails}
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 20px; font-weight: bold; font-size: 18px; color: #f472b6;">
              <span>Total Amount:</span>
              <span>₹${totalPrice}</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/profile" style="background-color: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: bold;">Track Your Order</a>
          </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          © 2026 ArVr Store. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', address.email);
  } catch (error) {
    console.error('Email sending failed for order:', _id, error);
  }
};

const sendOrderStatusUpdateEmail = async (order) => {
  const { address, status, _id, deliveryDate } = order;

  const deliveryInfo = deliveryDate ? `
    <div style="margin-top: 15px; color: #666; font-size: 14px;">
      <strong>Estimated Delivery Date:</strong> ${new Date(deliveryDate).toDateString()}
    </div>
  ` : '';

  const mailOptions = {
    from: `"ArVr Store" <${process.env.EMAIL_USER}>`,
    to: address.email,
    subject: `Order Status Updated - #${_id.toString().slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f472b6; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ArVr Store</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333;">Order Status Update</h2>
          <p style="color: #555;">Hi <strong>${address.name}</strong>, the status of your order <strong>#${_id.toString().slice(-6)}</strong> has been updated to:</p>
          
          <div style="margin: 30px 0; background-color: #fdf2f8; border-left: 4px solid #f472b6; padding: 20px; border-radius: 4px;">
            <span style="font-size: 24px; font-weight: bold; color: #f472b6;">${status}</span>
            ${deliveryInfo}
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/profile" style="background-color: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: bold;">Track Your Order</a>
          </div>
        </div>
      </div>
    `
  };

  const transporter = createTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order status update email sent to:', address.email);
  } catch (error) {
    console.error('Email sending failed for status update:', _id, error);
  }
};

module.exports = { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail };
