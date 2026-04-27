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
    <div className="my-6">
      <div className="flex overflow-x-auto gap-6 px-4 pb-4 hide-scrollbar">
        <Link 
          to="/categories"
          className="flex flex-col items-center gap-2 min-w-[80px]"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-gray-100 bg-pink-50">
            <LayoutGrid className="w-8 h-8 text-pink-500" />
          </div>
          <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap overflow-hidden text-ellipsis w-20">
            Categories
          </span>
        </Link>

        {categories.map((cat) => (
          <Link 
            key={cat._id} 
            to={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`}
            className="flex flex-col items-center gap-2 min-w-[80px]"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-gray-100 bg-white">
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform hover:scale-110"
              />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap overflow-hidden text-ellipsis w-20">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryCards;
