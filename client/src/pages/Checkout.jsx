import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCoupons } from '../context/CouponContext';

const Checkout = () => {
  const { cart, getCartTotal, getShippingTotal, clearCart } = useCart();
  const { getProductDiscount } = useCoupons();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const [formData, setFormData] = useState({
    name: user?.name || '', mobile: '', email: user?.email || '', addressLine: '', landmark: '', pincode: '', city: '', state: ''
  });

  React.useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/api/coupons');
        setAvailableCoupons(res.data);
      } catch (err) { console.error(err); }
    };
    fetchCoupons();
  }, []);

  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, navigate]);

  if (cart.length === 0) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const cartProductIds = cart.map(item => item._id || item.id);
  const eligibleForCoupon = availableCoupons.some(c => 
    (c.type === 'Promo Code' || c.type === 'Special Code') &&
    c.applicableProducts.some(p => cartProductIds.includes(p._id || p))
  );

  const handleApplyCoupon = async () => {
    try {
      const res = await api.post('/api/coupons/validate', { code: couponCode, productIds: cartProductIds });
      setAppliedCoupon(res.data);
      alert('Coupon applied successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const calculateDiscountedTotal = () => {
    let total = getCartTotal();
    if (appliedCoupon) {
      let discountAmount = 0;
      cart.forEach(item => {
        const productId = item._id || item.id;
        const isApplicable = appliedCoupon.applicableProducts.some(p => (p._id || p) === productId);
        if (isApplicable) {
          // IMPORTANT: Promo/Special discounts should apply to the ALREADY discounted price (if any)
          const autoDiscount = getProductDiscount(productId);
          let currentPrice = parseFloat(String(item.price).replace('₹', ''));
          if (autoDiscount && autoDiscount.type === 'Discount') {
            if (autoDiscount.discountType === 'Percentage') {
              currentPrice = currentPrice * (1 - autoDiscount.discountValue / 100);
            } else {
              currentPrice = Math.max(0, currentPrice - autoDiscount.discountValue);
            }
          }

          if (appliedCoupon.discountType === 'Percentage') {
            discountAmount += (currentPrice * item.quantity) * (appliedCoupon.discountValue / 100);
          } else {
            discountAmount += appliedCoupon.discountValue; 
          }
        }
      });
      total -= discountAmount;
    }
    return Math.max(0, total + getShippingTotal());
  };

  const handleRazorpayPayment = async (orderData) => {
    const options = {
      key: 'rzp_test_SONVM85SR0Fj0w', 
      amount: orderData.razorpayOrder.amount,
      currency: 'INR',
      name: 'ARVR Store',
      description: 'Test Transaction',
      order_id: orderData.razorpayOrder.id,
      handler: async function (response) {
        try {
          const verifyRes = await api.post('/api/orders/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderData.order._id
          });
          if (verifyRes.data.success) {
            alert('Payment Successful!');
            clearCart();
            if (user) {
              navigate('/profile');
            } else {
              navigate('/');
            }
          }
        } catch (error) {
          console.error(error);
          alert('Payment verification failed.');
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.mobile
      },
      theme: { color: '#f472b6' }
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response){
      alert(`Payment failed: ${response.error.description}`);
    });
    rzp1.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.mobile || !formData.email || !formData.addressLine || !formData.pincode || !formData.city || !formData.state) {
      alert('Please fill in all required shipping details.');
      return;
    }

    setLoading(true);
    
    try {
      const orderPayload = {
        userId: user?._id || user?.id || null,
        products: cart.map(item => ({ 
          product: item._id || item.id, 
          quantity: item.quantity,
          selectedOptions: item.selectedOptions
        })),
        subTotal: calculateDiscountedTotal() - getShippingTotal(),
        shippingCharges: getShippingTotal(),
        totalPrice: calculateDiscountedTotal(),
        paymentType: paymentMethod,
        address: formData,
        couponCode: appliedCoupon?.code
      };

      const res = await api.post('/api/orders/create', orderPayload);

      if (paymentMethod === 'COD') {
        clearCart();
        if (user) {
          navigate('/profile');
        } else {
          navigate('/');
        }
      } else {
        handleRazorpayPayment(res.data);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to process order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Checkout</h1>
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 lg:gap-16 xl:gap-24">
        
        <div className="flex-1 space-y-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="border p-3 rounded-lg w-full" />
              <input required name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" className="border p-3 rounded-lg w-full" />
              <input required name="email" value={formData.email} type="email" onChange={handleChange} placeholder="Email Address" className="border p-3 rounded-lg w-full md:col-span-2" />
              <input required name="addressLine" value={formData.addressLine} onChange={handleChange} placeholder="Address Line" className="border p-3 rounded-lg w-full md:col-span-2" />
              <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark (Optional)" className="border p-3 rounded-lg w-full" />
              <input required name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" className="border p-3 rounded-lg w-full" />
              <input required name="city" value={formData.city} onChange={handleChange} placeholder="City" className="border p-3 rounded-lg w-full" />
              <input required name="state" value={formData.state} onChange={handleChange} placeholder="State" className="border p-3 rounded-lg w-full" />
            </div>
          </div>

          {eligibleForCoupon && (
            <div className="bg-white p-6 rounded-xl border shadow-sm border-blue-100 bg-blue-50/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Do you have a coupon code?</h2>
                <div className="flex bg-gray-100 p-1 rounded-full w-fit border border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setHasCoupon(true)}
                    className={`px-6 py-1.5 rounded-full font-bold text-xs transition-all ${hasCoupon ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    YES
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setHasCoupon(false);
                      setAppliedCoupon(null);
                      setCouponCode('');
                    }}
                    className={`px-6 py-1.5 rounded-full font-bold text-xs transition-all ${!hasCoupon ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    NO
                  </button>
                </div>
              </div>
              {hasCoupon && (
                <div className="flex gap-2 animate-in slide-in-from-top duration-300">
                  <input 
                    placeholder="Enter Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 border p-3 rounded-lg uppercase font-bold tracking-widest outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <button 
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {appliedCoupon && (
                <p className="mt-3 text-sm font-bold text-green-600 flex items-center gap-2">
                  ✓ {appliedCoupon.code} applied! Saving you {appliedCoupon.discountType === 'Percentage' ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`} on eligible items.
                </p>
              )}
            </div>
          )}

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" value="Online" checked={paymentMethod === 'Online'} onChange={() => setPaymentMethod('Online')} className="w-4 h-4 text-primary" />
                <span className="font-medium text-gray-700">Online Payment (Razorpay)</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-primary" />
                <span className="font-medium text-gray-700">Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 h-fit">
          <div className="bg-gray-50 p-6 rounded-xl border sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cart.map(item => {
                const productId = item._id || item.id;
                const autoDiscount = getProductDiscount(productId);
                let itemPrice = parseFloat(String(item.price).replace('₹', ''));
                if (autoDiscount && autoDiscount.type === 'Discount') {
                  if (autoDiscount.discountType === 'Percentage') {
                    itemPrice = itemPrice * (1 - autoDiscount.discountValue / 100);
                  } else {
                    itemPrice = Math.max(0, itemPrice - autoDiscount.discountValue);
                  }
                }
                return (
                  <div key={item.cartKey} className="flex flex-col text-sm border-b border-gray-100 pb-2 last:border-0">
                    <div className="flex justify-between">
                      <span className="text-gray-600 line-clamp-1 flex-1 font-medium">{item.name} x {item.quantity}</span>
                      <span className="font-semibold">₹{(itemPrice * item.quantity).toFixed(0)}</span>
                    </div>
                    {item.selectedOptions && (Object.values(item.selectedOptions).some(v => v)) && (
                      <div className="text-[9px] text-primary font-bold uppercase mt-0.5">
                        {item.selectedOptions.size && <span>Size: {item.selectedOptions.size} | </span>}
                        {item.selectedOptions.color && <span>Color: {item.selectedOptions.color} | </span>}
                        {item.selectedOptions.custom && <span>{item.selectedOptions.custom}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
              <div className="flex justify-between text-green-600 font-bold text-sm mb-4">
                <span>Coupon Discount</span>
                <span>-₹{(getCartTotal() - calculateDiscountedTotal() + getShippingTotal()).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 text-sm mb-4">
              <span>Shipping</span>
              <span className={getShippingTotal() === 0 ? "text-green-500" : "text-gray-800"}>
                {getShippingTotal() === 0 ? "Free" : `₹${getShippingTotal().toFixed(2)}`}
              </span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg text-gray-800 mb-6">
              <span>Total to Pay</span>
              <span>₹{calculateDiscountedTotal().toFixed(2)}</span>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-primary hover:bg-pink-500 text-white font-bold py-3 rounded-full shadow-md transition-transform transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : (paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay securely with Razorpay')}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
