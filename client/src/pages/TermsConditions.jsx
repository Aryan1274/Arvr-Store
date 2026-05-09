import React from 'react';

const TermsConditions = () => {
  return (
    <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 py-12 lg:py-20 min-h-[70vh]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 tracking-tighter">Terms & Conditions</h1>
        <div className="prose prose-pink max-w-none space-y-6 text-gray-600 font-medium">
          <p>Last updated: May 09, 2026</p>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using ArVr Store, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">2. Intellectual Property</h2>
            <p>The service and its original content, features, and functionality are and will remain the exclusive property of ArVr Store and its licensors.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">3. User Accounts</h2>
            <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">4. Purchases</h2>
            <p>We reserve the right to refuse or cancel your order if fraud or an unauthorized or illegal transaction is suspected. All prices are in INR and subject to change without notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">5. Limitation of Liability</h2>
            <p>In no event shall ArVr Store be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, or use.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
