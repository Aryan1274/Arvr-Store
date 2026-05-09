import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

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
            <a href="https://instagram.com/arvrstore" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:bg-pink-50 transition-all border border-gray-100">
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
