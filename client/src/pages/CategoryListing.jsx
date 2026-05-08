import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
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
        const res = await api.get(`/api/products?category=${displayName}`);
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
    <div className="max-w-[1600px] mx-auto px-4 lg:px-10 xl:px-14 py-8 lg:py-12 min-h-[60vh]">
      <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-text-main mb-8 lg:mb-12 capitalize text-center border-b border-theme pb-4 lg:pb-6">
        {formatCategoryName(id).toLowerCase().includes('collection') 
          ? formatCategoryName(id) 
          : `${formatCategoryName(id)} Collection`}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} discount={getProductDiscount(product._id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-bg-card rounded-2xl shadow-sm border border-theme">
          <p className="text-text-muted text-lg lg:text-xl">No products found in this category yet.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryListing;
