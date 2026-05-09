import React from 'react';
import { Link } from 'react-router-dom';

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Facebook = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Twitter = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-white mt-12 py-12 lg:py-16 border-t border-gray-100">
      <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-primary tracking-tighter">ArVr Store</h3>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">Trendy, aesthetic, and minimal shopping experience curated just for you.</p>
        </div>
        
        <div>
          <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6">Quick Links</h4>
          <ul className="text-gray-500 text-sm font-bold space-y-3">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link to="/profile" className="hover:text-primary transition-colors">Order Tracking</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6">Legal</h4>
          <ul className="text-gray-500 text-sm font-bold space-y-3">
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6">Follow Us</h4>
          <div className="flex gap-4">
            <a href="https://instagram.com/aryan120704" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:bg-pink-50 transition-all border border-gray-100">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all border border-gray-100">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-16 pt-8 border-t border-gray-50">
        <p>&copy; 2026 ARVR | Made with Love & Trends</p>
      </div>
    </footer>
  );
};

export default Footer;
