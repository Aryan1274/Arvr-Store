import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCoupons } from './CouponContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { getProductDiscount } = useCoupons();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    const productId = product._id || product.id;
    setCart(prev => {
      const existing = prev.find(item => (item._id || item.id) === productId);
      if (existing) {
        return prev.map(item => 
          (item._id || item.id) === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, id: productId, quantity }];
    });
  };

  const updateQuantity = (productId, change) => {
    setCart(prev => prev.map(item => {
      if ((item._id || item.id) === productId) {
        const newQ = item.quantity + change;
        return { ...item, quantity: newQ > 0 ? newQ : 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => (item._id || item.id) !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const productId = item._id || item.id;
      const discount = getProductDiscount(productId);
      let price = parseFloat(String(item.price).replace('₹', ''));
      
      if (discount && discount.type === 'Discount') {
        if (discount.discountType === 'Percentage') {
          price = price * (1 - discount.discountValue / 100);
        } else {
          price = Math.max(0, price - discount.discountValue);
        }
      }
      
      return total + price * item.quantity;
    }, 0);
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, getCartTotal, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
