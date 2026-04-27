import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white mt-12 py-10 border-t">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-primary mb-4">ArVr Store</h3>
          <p className="text-gray-500 text-sm">Trendy, aesthetic, and minimal shopping experience curated just for you.</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
          <ul className="text-gray-500 text-sm space-y-2">
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
            <li><Link to="/shipping" className="hover:text-primary">Shipping & Returns</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Legal</h4>
          <ul className="text-gray-500 text-sm space-y-2">
            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Follow Us</h4>
          <div className="flex gap-4 text-gray-500">
            <a href="#" className="hover:text-primary">IG</a>
            <a href="#" className="hover:text-primary">FB</a>
            <a href="#" className="hover:text-primary">X</a>
          </div>
        </div>
      </div>
      <div className="container mx-auto text-center text-gray-400 text-xs mt-10">
        <p>&copy; 2026 ARVR | Made with Love & Trends</p>
      </div>
    </footer>
  );
};

export default Footer;
