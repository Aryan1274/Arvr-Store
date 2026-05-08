import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import api from '../api';

const CategoryCards = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/api/categories');
        setCategories(res.data.filter(c => !c.isSuspended));
      } catch (err) { console.error(err); }
    };
    fetchCats();
  }, []);

  return (
    <div className="my-6 lg:my-10">
      {/* Mobile: horizontal scroll | Desktop: flex-wrap centered row */}
      <div className="flex overflow-x-auto lg:flex-wrap lg:overflow-x-visible lg:justify-start gap-4 lg:gap-8 xl:gap-10 px-4 lg:px-10 xl:px-14 pb-4 lg:pb-2 hide-scrollbar">
        <Link 
          to="/categories"
          className="flex flex-col items-center gap-2 min-w-[80px] lg:min-w-0"
        >
          <div className="w-20 h-20 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-gray-100 bg-pink-50 transition-transform hover:scale-105">
            <LayoutGrid className="w-8 h-8 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-pink-500" />
          </div>
          <span className="text-xs lg:text-sm xl:text-base font-medium text-gray-700 text-center whitespace-nowrap overflow-hidden text-ellipsis w-20 lg:w-28 xl:w-32">
            Categories
          </span>
        </Link>

        {categories.map((cat) => (
          <Link 
            key={cat._id} 
            to={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`}
            className="flex flex-col items-center gap-2 min-w-[80px] lg:min-w-0"
          >
            <div className="w-20 h-20 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-gray-100 bg-white transition-transform hover:scale-105">
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs lg:text-sm xl:text-base font-medium text-gray-700 text-center whitespace-nowrap overflow-hidden text-ellipsis w-20 lg:w-28 xl:w-32">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryCards;
