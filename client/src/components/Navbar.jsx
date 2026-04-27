import React, { useState, useEffect } from 'react';
import { Menu, ShoppingBag, User, X, ShieldCheck, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data.filter(c => !c.isSuspended));
      } catch (err) { console.error(err); }
    };
    fetchCats();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-bg-card shadow-sm p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-text-main/80 p-1 hover:bg-primary-light rounded-md"
            onClick={toggleMenu}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="text-2xl font-bold text-primary tracking-wider font-serif">ArVr</Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-text-main/80">
          <Link to="/" className="hover:text-primary transition-colors">Shop</Link>
          {categories.slice(0, 4).map(cat => (
            <Link key={cat._id} to={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`} className="hover:text-primary transition-colors">{cat.name}</Link>
          ))}
          <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-primary font-bold hover:underline">Admin Panel</Link>
          )}
        </div>
 
        <div className="flex items-center gap-4 text-text-main/80">
          {user?.role === 'admin' && (
            <Link to="/admin" className="md:hidden hover:text-primary transition-colors p-1 rounded-full hover:bg-primary-light" title="Admin Panel">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </Link>
          )}
          <Link to="/profile" className="hover:text-primary transition-colors p-1 rounded-full hover:bg-primary-light">
            <User className="w-6 h-6" />
          </Link>
          <Link to="/cart" className="hover:text-primary transition-colors relative p-1 rounded-full hover:bg-gray-100">
            <ShoppingBag className="w-6 h-6" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#a78bfa] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-white font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-bg-card z-[70] transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-theme flex justify-between items-center">
          <span className="text-xl font-bold text-primary font-serif">ArVr</span>
          <button onClick={toggleMenu} className="p-1 hover:bg-primary-light rounded-md">
            <X className="w-6 h-6 text-text-main/80" />
          </button>
        </div>
        <div className="flex flex-col p-4 gap-4 text-text-main/80 font-medium">
          <Link to="/" onClick={toggleMenu} className="hover:text-primary py-2 border-b border-theme">Shop</Link>
          {categories.map(cat => (
            <Link key={cat._id} to={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`} onClick={toggleMenu} className="hover:text-primary py-2 border-b border-theme">{cat.name}</Link>
          ))}
          <Link to="/contact" onClick={toggleMenu} className="hover:text-primary py-2 border-b border-theme">Contact Us</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={toggleMenu} className="text-primary font-bold py-2">Admin Panel</Link>
          )}
          {user && (
            <button 
              onClick={() => { logout(); toggleMenu(); }}
              className="flex items-center gap-2 text-red-500 font-bold py-4 mt-auto border-t border-theme"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
