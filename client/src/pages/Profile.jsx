import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../api';
import { Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [addressForm, setAddressForm] = useState({
    name: user?.address?.name || user?.name || '',
    mobile: user?.address?.mobile || '',
    addressLine: user?.address?.addressLine || '',
    landmark: user?.address?.landmark || '',
    pincode: user?.address?.pincode || '',
    city: user?.address?.city || '',
    state: user?.address?.state || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchOrders();
    }
  }, [user]);

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/api/users/${user._id}`, { address: addressForm });
      updateUser(res.data); // Update global Auth state and localStorage
      alert('Address saved successfully! It will now be pre-filled at checkout.');
    } catch (err) {
      alert('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  // Sync form with user data if user data updates (e.g. on load or after save)
  useEffect(() => {
    if (user?.address) {
      setAddressForm({
        name: user.address.name || user.name || '',
        mobile: user.address.mobile || '',
        addressLine: user.address.addressLine || '',
        landmark: user.address.landmark || '',
        pincode: user.address.pincode || '',
        city: user.address.city || '',
        state: user.address.state || ''
      });
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/api/orders/user/${user._id}`);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.put(`/api/orders/${orderId}/status`, { status: 'Failed' });
        fetchOrders();
      } catch (err) {
        alert('Failed to cancel order.');
      }
    }
  };

  if (!user) return <Navigate to="/login" />;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeOrders = orders.filter(o => !['Delivered', 'Cancelled', 'Failed'].includes(o.status));
  const orderHistory = orders.filter(o => ['Delivered', 'Cancelled', 'Failed'].includes(o.status));

  const OrderCard = ({ order }) => (
    <div className="bg-white border rounded-2xl p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-pink-50 p-2 rounded-xl">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order #{order._id.slice(-6)}</p>
            <p className="text-sm font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
            {order.paymentType === 'WhatsApp' && (
              <div className="mt-1 flex items-center gap-1 text-[8px] font-black uppercase text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 w-fit">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="" className="w-2.5 h-2.5" />
                Ordered on WhatsApp
              </div>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
          order.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
          order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
          order.status === 'Under Verification' ? 'bg-amber-100 text-amber-700 animate-pulse' :
          'bg-amber-50 text-amber-600'
        }`}>
          {order.status}
        </span>
      </div>
      
      <div className="space-y-3">
        {order.products.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <img src={item.product?.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover border" />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700 line-clamp-1">{item.product?.name}</p>
              <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
            </div>
            <div className="text-right">
              {item.originalPrice && item.originalPrice > item.price ? (
                <>
                  <p className="text-[10px] text-gray-400 line-through">₹{item.originalPrice * item.quantity}</p>
                  <p className="text-sm font-bold text-gray-800">₹{item.price * item.quantity}</p>
                </>
              ) : (
                <p className="text-sm font-bold text-gray-800">₹{(item.price || item.product?.price || 0) * item.quantity}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 font-medium">Subtotal</p>
          <p className="text-xs font-bold text-gray-800">₹{order.subTotal || 0}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 font-medium">Delivery Charges</p>
          <p className="text-xs font-bold text-gray-800">₹{order.shippingCharges || 0}</p>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-800 font-black">Total Amount</p>
          <p className="text-lg font-black text-primary">₹{order.totalPrice}</p>
        </div>
      </div>

      {order.status === 'Processing' && (
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => handleCancelOrder(order._id)}
            className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 py-8">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">My Profile</h1>
        <button 
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-red-50 transition-all border border-red-100"
        >
          Logout
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-6 mb-10">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-pink-100 rounded-full flex items-center justify-center text-primary text-2xl md:text-3xl font-black border-4 border-pink-50">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 leading-tight">{user.name}</h2>
          <p className="text-gray-500 font-medium">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">Customer</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Active Orders
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Order History
          </button>
          <button 
            onClick={() => setActiveTab('address')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'address' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Saved Address
          </button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
            <div className="py-12 text-center text-gray-400 font-medium">Loading your orders...</div>
          ) : activeTab === 'active' ? (
            activeOrders.length > 0 ? (
              activeOrders.map(order => <OrderCard key={order._id} order={order} />)
            ) : (
              <div className="bg-white border-2 border-dashed rounded-3xl py-16 flex flex-col items-center justify-center gap-4">
                <Clock className="w-12 h-12 text-gray-200" />
                <p className="text-gray-400 font-bold text-lg">No active orders right now.</p>
                <button onClick={() => navigate('/')} className="text-primary font-black text-sm uppercase tracking-widest hover:underline">Start Shopping</button>
              </div>
            )
          ) : activeTab === 'history' ? (
            orderHistory.length > 0 ? (
              orderHistory.map(order => <OrderCard key={order._id} order={order} />)
            ) : (
              <div className="bg-white border-2 border-dashed rounded-3xl py-16 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-gray-200" />
                <p className="text-gray-400 font-bold text-lg">Your order history is empty.</p>
              </div>
            )
          ) : (
            <div className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-pink-50 rounded-2xl text-primary">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800">Saved Address</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">This will be auto-filled during checkout</p>
                </div>
              </div>

              <form onSubmit={handleAddressUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                    className="w-full border-2 border-gray-50 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" 
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    required
                    value={addressForm.mobile}
                    onChange={(e) => setAddressForm({...addressForm, mobile: e.target.value})}
                    className="w-full border-2 border-gray-50 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" 
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Address Line</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.addressLine}
                    onChange={(e) => setAddressForm({...addressForm, addressLine: e.target.value})}
                    className="w-full border-2 border-gray-50 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" 
                    placeholder="House/Flat No., Building, Street"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Landmark</label>
                  <input 
                    type="text" 
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})}
                    className="w-full border-2 border-gray-50 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" 
                    placeholder="E.g. Near Apollo Hospital"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                    className="w-full border-2 border-gray-50 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" 
                    placeholder="6-digit pincode"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="w-full border-2 border-gray-50 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" 
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    className="w-full border-2 border-gray-50 p-4 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium" 
                    placeholder="Enter state"
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-pink-100 hover:bg-pink-500 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> Save Address</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
