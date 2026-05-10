import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const CouponContext = createContext();

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([]);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/api/coupons');
      setCoupons(res.data);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const getProductDiscount = (productId) => {
    // Only 'Discount' type coupons are applied automatically to the product display
    const activeCoupons = coupons.filter(c => 
      c.type === 'Discount' && 
      c.isActive &&
      c.applicableProducts.some(p => (p._id || p) === productId)
    );
    
    if (activeCoupons.length === 0) return null;
    
    // Return the most recently created one
    return [...activeCoupons].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  };

  return (
    <CouponContext.Provider value={{ coupons, getProductDiscount, fetchCoupons }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupons = () => useContext(CouponContext);
