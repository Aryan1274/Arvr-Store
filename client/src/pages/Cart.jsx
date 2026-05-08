import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCoupons } from '../context/CouponContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { getProductDiscount } = useCoupons();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Bag is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-pink-500 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-10 py-8 lg:py-12 max-w-5xl lg:max-w-6xl xl:max-w-7xl">
      <h1 className="text-3xl lg:text-5xl font-bold text-gray-800 mb-8 lg:mb-10 border-b pb-4 lg:pb-6">Your Bag</h1>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 space-y-4">
          {cart.map((item) => {
            const productId = item._id || item.id;
            const discount = getProductDiscount(productId);
            let itemPrice = parseFloat(String(item.price).replace('₹', ''));
            let hasDiscount = false;

            if (discount && discount.type === 'Discount') {
              hasDiscount = true;
              if (discount.discountType === 'Percentage') {
                itemPrice = itemPrice * (1 - discount.discountValue / 100);
              } else {
                itemPrice = Math.max(0, itemPrice - discount.discountValue);
              }
            }

            return (
              <div key={item.cartKey} className="flex gap-4 border p-4 rounded-xl bg-white shadow-sm">
                <img src={item.image || item.images?.[0]} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-gray-100" />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      {item.selectedOptions && (Object.values(item.selectedOptions).some(v => v)) && (
                        <div className="text-[10px] text-primary font-bold mt-1 flex gap-2">
                          {item.selectedOptions.size && <span>SIZE: {item.selectedOptions.size}</span>}
                          {item.selectedOptions.color && <span>COLOR: {item.selectedOptions.color}</span>}
                          {item.selectedOptions.custom && <span>{item.selectedOptions.custom}</span>}
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(item.cartKey)} className="text-red-500 text-sm hover:underline">Remove</button>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasDiscount ? (
                      <>
                        <p className="text-green-600 font-bold text-lg">₹{Math.round(itemPrice)}</p>
                        <p className="text-gray-400 text-xs line-through">₹{item.price}</p>
                      </>
                    ) : (
                      <p className="text-primary font-bold">₹{item.price}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.cartKey, -1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100">-</button>
                      <span className="px-4 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartKey, 1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100">+</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="lg:w-1/3 bg-gray-50 p-6 rounded-xl h-fit border">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>
          <div className="flex justify-between mb-4 text-gray-600">
            <span>Subtotal</span>
            <span>₹{getCartTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4 text-gray-600">
            <span>Shipping</span>
            <span className="text-green-500">Free</span>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg text-gray-800 mb-6">
            <span>Total</span>
            <span>₹{getCartTotal().toFixed(2)}</span>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary hover:bg-pink-500 text-white font-bold py-3 rounded-full shadow-md transition-transform transform hover:scale-105"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
