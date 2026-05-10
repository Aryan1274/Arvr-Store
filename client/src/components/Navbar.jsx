import React, { useState, useEffect } from 'react';
import { Menu, ShoppingBag, User, X, ShieldCheck, LogOut, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Navbar = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/api/categories');
        setCategories(res.data.filter(c => !c.isSuspended));
      } catch (err) { console.error(err); }
    };
    fetchCats();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-bg-card shadow-sm py-3 lg:py-4 px-2 lg:px-6 sticky top-0 z-50">
      <div className="w-full mx-auto flex justify-between items-center px-4 lg:px-6 xl:px-10 2xl:px-16">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-text-main/80 p-1 hover:bg-primary-light rounded-md"
            onClick={toggleMenu}
          >
            <Menu className="w-6 h-6" />
          </button>
          <a href="/" className="text-2xl lg:text-3xl xl:text-4xl font-bold text-primary tracking-wider font-serif">ArVr</a>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10 text-sm lg:text-base font-medium text-text-main/80">
          <Link to="/" className="hover:text-primary transition-colors">Shop</Link>
          {categories.slice(0, 4).map(cat => (
            <Link key={cat._id} to={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`} className="hover:text-primary transition-colors whitespace-nowrap">{cat.name}</Link>
          ))}
          
          {categories.length > 4 && (
            <div 
              className="relative group"
              onMouseEnter={() => setIsMoreOpen(true)}
              onMouseLeave={() => setIsMoreOpen(false)}
            >
              <button 
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`flex items-center gap-1 hover:text-primary transition-all p-1 rounded-full ${isMoreOpen ? 'text-primary bg-primary-light' : ''}`}
              >
                <MoreHorizontal className="w-6 h-6 lg:w-7 lg:h-7" />
              </button>

              {/* Mega Dropdown */}
              <div className={`absolute top-full right-0 mt-2 w-[450px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 transform transition-all duration-300 origin-top-right ${isMoreOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                <div className="grid grid-cols-3 gap-4">
                  {categories.slice(4).map(cat => (
                    <Link 
                      key={cat._id} 
                      to={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`}
                      onClick={() => setIsMoreOpen(false)}
                      className="group/item flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-pink-50 transition-all border border-transparent hover:border-pink-100"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-50 group-hover/item:border-primary/30 transition-all">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 text-center line-clamp-1 group-hover/item:text-primary">{cat.name}</span>
                    </Link>
                  ))}
                  <Link 
                    to="/categories" 
                    onClick={() => setIsMoreOpen(false)}
                    className="col-span-3 mt-4 flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-primary hover:text-white transition-all"
                  >
                    View All Categories <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <Link to="/contact" className="hover:text-primary transition-colors whitespace-nowrap">Contact Us</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-primary font-bold hover:underline whitespace-nowrap">Admin Panel</Link>
          )}
        </div>
 
        <div className="flex items-center gap-4 lg:gap-5 text-text-main/80">
          {user?.role === 'admin' && (
            <Link to="/admin" className="md:hidden hover:text-primary transition-colors p-1 rounded-full hover:bg-primary-light" title="Admin Panel">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </Link>
          )}
          <Link to="/profile" className="hover:text-primary transition-colors p-1 rounded-full hover:bg-primary-light">
            <User className="w-6 h-6 lg:w-7 lg:h-7" />
          </Link>
          <Link to="/cart" className="hover:text-primary transition-colors relative p-1 rounded-full hover:bg-gray-100">
            <ShoppingBag className="w-6 h-6 lg:w-7 lg:h-7" />
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
          <a href="/" onClick={toggleMenu} className="hover:text-primary py-2 border-b border-theme">Shop</a>
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
