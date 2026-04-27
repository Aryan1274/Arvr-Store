import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('/api/products');
        // Just show the first 4 for 'Trending'
        setProducts(res.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch trending products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <div className="container mx-auto px-4 my-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Trending Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default TrendingProducts;
