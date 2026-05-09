import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/categories');
        setCategories(res.data.filter(c => !c.isSuspended));
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 py-8 lg:py-12 min-h-[60vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-gray-800 tracking-tight mb-4">
          Explore Our <span className="text-primary">Categories</span>
        </h1>
        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
        <p className="mt-4 text-gray-500 font-medium text-lg">Browse through our curated collections of premium items</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8 xl:gap-10">
          {categories.map((cat) => (
            <Link 
              key={cat._id} 
              to={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`}
              className="group"
            >
              <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-pink-100 hover:-translate-y-2">
                {/* Image */}
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                
                {/* Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-center transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-white text-lg lg:text-xl font-black tracking-wide drop-shadow-md">
                    {cat.name}
                  </h3>
                  <span className="inline-block mt-2 px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] text-white font-bold uppercase tracking-widest border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    View Products
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {categories.length === 0 && !loading && (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg font-bold">No categories found at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default AllCategories;
