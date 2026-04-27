import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CouponContext = createContext();

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([]);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get('/api/coupons');
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
    const discount = coupons.find(c => 
      c.type === 'Discount' && 
      c.isActive &&
      c.applicableProducts.some(p => (p._id || p) === productId)
    );
    return discount || null;
  };

  return (
    <CouponContext.Provider value={{ coupons, getProductDiscount, fetchCoupons }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupons = () => useContext(CouponContext);
