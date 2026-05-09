const { OAuth2Client } = require('google-auth-library');
const MailComposer = require('nodemailer/lib/mail-composer');

/**
 * Sends an email using the Gmail REST API (HTTP) to bypass SMTP port blocks on Render.
 */
const sendEmailViaAPI = async (mailOptions) => {
  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const { token } = await oauth2Client.getAccessToken();

    // Use MailComposer to create the RFC822 compliant email string
    const mail = new MailComposer({
      ...mailOptions,
      from: `"ArVr Store" <${process.env.EMAIL_USER}>`
    });
    
    const message = await mail.compile().build();
    // Gmail API requires base64url encoding
    const encodedMail = message.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedMail
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gmail API Error: ${JSON.stringify(errorData)}`);
    }

    return true;
  } catch (error) {
    console.error('Gmail API send failed:', error.message);
    throw error;
  }
};

const sendOrderConfirmationEmail = async (order) => {
  const { address, products, totalPrice, _id } = order;
  
  if (!address || !address.email) {
    console.error('No recipient email found for order:', _id);
    return;
  }

  const productDetails = products.map(p => {
    const productName = p.product?.name || 'Deleted Product';
    const productPrice = p.price || p.product?.price || 0;
    const productImage = p.product?.images?.[0] || 'https://via.placeholder.com/60';
    return `
    <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
      <img src="${productImage}" alt="${productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;" />
      <div>
        <p style="margin: 0; font-weight: bold; color: #333;">${productName}</p>
        <p style="margin: 0; font-size: 12px; color: #666;">Qty: ${p.quantity} | ₹${productPrice}</p>
      </div>
    </div>
  `}).join('');

  const mailOptions = {
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
            <a href="https://arvr-store.vercel.app/profile" style="background-color: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: bold;">Track Your Order</a>
          </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          © 2026 ArVr Store. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    await sendEmailViaAPI(mailOptions);
    console.log('Order confirmation email sent via API to:', address.email);
  } catch (error) {
    console.error('Email sending failed for order:', _id);
  }
};

const sendOrderStatusUpdateEmail = async (order) => {
  const { address, status, _id, deliveryDate } = order;

  if (!address || !address.email) return;

  const deliveryInfo = deliveryDate ? `
    <div style="margin-top: 15px; color: #666; font-size: 14px;">
      <strong>Estimated Delivery Date:</strong> ${new Date(deliveryDate).toDateString()}
    </div>
  ` : '';

  const mailOptions = {
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
            <a href="https://arvr-store.vercel.app/profile" style="background-color: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: bold;">Track Your Order</a>
          </div>
        </div>
      </div>
    `
  };

  try {
    await sendEmailViaAPI(mailOptions);
    console.log('Order status update email sent via API to:', address.email);
  } catch (error) {
    console.error('Email sending failed for status update:', _id);
  }
};

const sendContactEmail = async (contactData) => {
  const { email, message, name } = contactData;

  const mailOptions = {
    to: process.env.EMAIL_USER, // Send to admin
    subject: `New Contact Message from ${name || email}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Contact Message</h1>
        </div>
        <div style="padding: 30px;">
          <p style="color: #555;">You received a new message from your website contact form:</p>
          
          <div style="margin: 20px 0; background-color: #f9f9f9; padding: 20px; border-radius: 12px; border-left: 4px solid #f472b6;">
            <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${name || 'N/A'} (${email})</p>
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap; color: #333; line-height: 1.6;">${message}</p>
          </div>
          
          <p style="color: #999; font-size: 12px;">Sent via ArVr Store Contact Form</p>
        </div>
      </div>
    `
  };

  await sendEmailViaAPI(mailOptions);
};

module.exports = { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendContactEmail };

