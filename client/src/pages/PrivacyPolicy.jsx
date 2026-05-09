import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 py-12 lg:py-20 min-h-[70vh]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 tracking-tighter">Privacy Policy</h1>
        <div className="prose prose-pink max-w-none space-y-6 text-gray-600 font-medium">
          <p>Last updated: May 09, 2026</p>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, make a purchase, or contact us. This includes your name, email, shipping address, and phone number.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to process orders, send order updates, communicate with you about products and services, and improve our store experience.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">3. Data Security</h2>
            <p>We implement various security measures to maintain the safety of your personal information. Your payment details are processed through secure gateways like Razorpay and are never stored on our servers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">4. Cookies</h2>
            <p>We use cookies to enhance your browsing experience and remember items in your shopping cart.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at official.arvr@gmail.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
