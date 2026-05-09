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
      <div className="w-full mx-auto pt-4 lg:pt-10 xl:pt-12 px-4 lg:px-6 xl:px-10 2xl:px-16">
        {/* User Greeting */}
        <div className="px-2 lg:px-5 xl:px-7 mb-4 lg:mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3 lg:gap-5">
            <div className="w-12 h-12 lg:w-[72px] lg:h-[72px] rounded-full overflow-hidden bg-bg-card border border-theme shadow-sm flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 lg:w-9 lg:h-9 text-text-muted" />
              )}
            </div>
            <div>
              <p className="text-sm lg:text-base xl:text-lg text-text-muted font-medium">Hello,</p>
              <p className="text-sm lg:text-lg xl:text-xl font-bold text-text-main truncate max-w-[200px] lg:max-w-[480px]">
                {user ? user.email : 'Guest User'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-2 lg:px-5 xl:px-7 mb-6 lg:mb-10">
          <div className="flex items-center bg-bg-card rounded-full px-4 lg:px-8 py-3 lg:py-5 shadow-sm lg:shadow-md border border-theme focus-within:ring-2 focus-within:ring-primary/20 transition-all lg:max-w-3xl xl:max-w-4xl">
            <Search className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-text-muted mr-2 lg:mr-3 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search by Keyword, Category or Tag" 
              className="bg-transparent border-none outline-none text-sm lg:text-base xl:text-lg w-full text-text-main/80 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
            <div className="flex items-center gap-3 lg:gap-4 border-l pl-3 ml-2 border-theme">
              <Mic className="w-5 h-5 lg:w-6 lg:h-6 text-text-muted cursor-pointer hover:text-primary transition-colors" />
              <Camera className="w-5 h-5 lg:w-6 lg:h-6 text-text-muted cursor-pointer hover:text-primary transition-colors" />
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
