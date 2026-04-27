import React, { useState } from 'react';
import { Search, Mic, Camera, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryCards from '../components/CategoryCards';
import DynamicSections from '../components/DynamicSections';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Home = () => {
  const { user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="bg-bg-main min-h-screen">
      <div className="max-w-7xl mx-auto pt-4">
        {/* User Greeting */}
        <div className="px-4 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-card border border-theme shadow-sm flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-text-muted" />
              )}
            </div>
            <div>
              <p className="text-sm text-text-muted font-medium">Hello,</p>
              <p className="text-sm font-bold text-text-main truncate max-w-[200px]">
                {user ? user.email : 'Guest User'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-6">
          <div className="flex items-center bg-bg-card rounded-full px-4 py-3 shadow-sm border border-theme focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-5 h-5 text-text-muted mr-2" />
            <input 
              type="text" 
              placeholder="Search by Keyword, Category or Tag" 
              className="bg-transparent border-none outline-none text-sm w-full text-text-main/80 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
            <div className="flex items-center gap-3 border-l pl-3 ml-2 border-theme">
              <Mic className="w-5 h-5 text-text-muted cursor-pointer hover:text-primary transition-colors" />
              <Camera className="w-5 h-5 text-text-muted cursor-pointer hover:text-primary transition-colors" />
            </div>
          </div>
        </div>

        <CategoryCards />
        <DynamicSections />
      </div>
    </div>
  );
};

export default Home;
