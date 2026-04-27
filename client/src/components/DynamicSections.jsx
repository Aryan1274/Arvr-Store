import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { useCoupons } from '../context/CouponContext';

const DynamicSections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getProductDiscount } = useCoupons();
  const [expanded, setExpanded] = useState({}); // Track expanded collections

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axios.get('/api/collections');
        // Only show collections that have at least one product
        setCollections(res.data.filter(c => c.products.length > 0));
      } catch (err) {
        console.error('Failed to fetch collections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (loading) return null;

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-12 mb-20">
      {collections.map((collection) => (
        <div key={collection._id} className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              {collection.name} <span className="text-primary">Products</span>
            </h2>
            <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-pink-50 to-transparent hidden md:block"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {collection.products.slice(0, 5).map((product) => (
              <ProductCard key={product._id} product={product} discount={getProductDiscount(product._id)} />
            ))}
          </div>
          {collection.products.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  window.location.href = `/collection/${collection._id}`;
                }}
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition"
              >
                View All
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DynamicSections;
