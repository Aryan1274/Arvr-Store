import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useCoupons } from '../context/CouponContext';


const CategoryListing = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getProductDiscount } = useCoupons();

  // Helper to convert slug back to display name (e.g., 'for-him' -> 'For Him')
  const formatCategoryName = (slug) => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const displayName = formatCategoryName(id);
        const res = await axios.get(`/api/products?category=${displayName}`);
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[60vh]">
      <h1 className="text-3xl font-bold text-text-main mb-8 capitalize text-center border-b border-theme pb-4">
        {formatCategoryName(id).toLowerCase().includes('collection') 
          ? formatCategoryName(id) 
          : `${formatCategoryName(id)} Collection`}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} discount={getProductDiscount(product._id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-bg-card rounded-2xl shadow-sm border border-theme">
          <p className="text-text-muted text-lg">No products found in this category yet.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryListing;
