import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../api';
import { Plus, Pencil, Trash2, Filter, X, Save, Image as ImageIcon, Calendar, Wrench, ChevronLeft, ChevronRight, Palette, CheckCircle2, Users as UsersIcon, Ticket } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { theme: currentTheme, updateTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', stock: 0, tags: [] });
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);

  // Category Tab States
  const [isCatFormOpen, setIsCatFormOpen] = useState(false);
  const [catFormData, setCatFormData] = useState({ name: '', image: null });
  const [selectedCats, setSelectedCats] = useState([]);

  // Tag Tab States
  const [isTagFormOpen, setIsTagFormOpen] = useState(false);
  const [tagFormData, setTagFormData] = useState({ name: '', image: null });
  const [selectedTagsList, setSelectedTagsList] = useState([]);

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Delivery Date State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [deliveryDateValue, setDeliveryDateValue] = useState('');

  // Tools / Collections State
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [currentToolSection, setCurrentToolSection] = useState(null); // 'Trending', etc.
  const [toolView, setToolView] = useState('sections'); // 'sections', 'categories', 'products'
  const [toolSelectedCat, setToolSelectedCat] = useState(null);
  const [tempSelectedProducts, setTempSelectedProducts] = useState({}); // { sectionName: [id1, id2] }
  const [toolActiveMode, setToolActiveMode] = useState('menu'); // 'menu', 'collections', 'coupons'
  const [coupons, setCoupons] = useState([]);
  const [selectedCouponProducts, setSelectedCouponProducts] = useState([]);
  const [couponFormData, setCouponFormData] = useState({ code: '', type: '', discountType: 'Percentage', discountValue: 0 });
  const [couponStep, setCouponStep] = useState('type'); // 'type', 'categories', 'products', 'config'

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOrders();
      fetchProducts();
      fetchCategories();
      fetchTags();
      fetchCollections();
      fetchUsers();
      fetchCoupons();
    }
  }, [user]);

  const fetchCollections = async () => {
    try {
      const res = await api.get('/api/collections');
      setCollections(res.data);
      const initialSelection = {};
      res.data.forEach(col => {
        initialSelection[col.name] = col.products ? col.products.map(p => p._id) : [];
      });
      setTempSelectedProducts(initialSelection);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data);
      if (res.data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: res.data[0].name }));
      }
    } catch (err) { console.error(err); }
  };

  const fetchTags = async () => {
    try {
      const res = await api.get('/api/tags');
      setTags(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); setUsers([]); }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/api/coupons');
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); setCoupons([]); }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.get(`/api/users/delete/${id}`);
        fetchUsers();
      } catch (err) { alert('Failed to delete user'); }
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleStatusUpdate = async (id, status) => {
    await api.put(`/api/orders/${id}/status`, { status });
    fetchOrders();
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Delete this order record permanently?')) {
      try {
        await api.delete(`/api/orders/${id}`);
        fetchOrders();
      } catch (err) { alert('Failed to delete order'); }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (err) { alert('Failed to delete product'); }
    }
  };

  const handleEditClick = (product) => {
    console.log('Editing product:', product.name);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock || 0,
      tags: product.tags?.map(t => t._id || t) || []
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    data.append('tags', JSON.stringify(formData.tags));

    if (images) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    if (editingProduct) {
      // Add existing images to data
      editingProduct.images.forEach(img => data.append('existingImages', img));
    }

    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, data);
        alert('Product updated successfully!');
      } else {
        await api.post('/api/products', data);
        alert('Product added successfully!');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: categories[0]?.name || 'For Her', stock: 0, tags: [] });
    setImages(null);
    setIsFormOpen(false);
  };

  const toggleCategoryFilter = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredProducts = selectedCategories.length > 0 
    ? products.filter(p => selectedCategories.includes(p.category))
    : products;

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8">
      {/* Navigation (Sidebar on Desktop, Horizontal Scroll on Mobile) */}
      <div className="w-full md:w-1/4">
        <div className="bg-bg-card rounded-2xl shadow-sm border border-theme p-2 md:p-4 md:sticky md:top-24">
          <h2 className="text-lg md:text-xl font-bold text-text-main mb-4 md:mb-6 px-2 hidden md:block">Admin Control</h2>
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`whitespace-nowrap px-4 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${activeTab === 'orders' ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-text-main hover:bg-primary-light flex-1 md:flex-none text-center md:text-left'}`}
            >
              Manage Orders
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`whitespace-nowrap px-4 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${activeTab === 'products' ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-text-main hover:bg-primary-light flex-1 md:flex-none text-center md:text-left'}`}
            >
              Products Inventory
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`whitespace-nowrap px-4 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${activeTab === 'categories' ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-text-main hover:bg-primary-light flex-1 md:flex-none text-center md:text-left'}`}
            >
              Categories
            </button>
            <button 
              onClick={() => setActiveTab('tags')}
              className={`whitespace-nowrap px-4 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${activeTab === 'tags' ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-text-main hover:bg-primary-light flex-1 md:flex-none text-center md:text-left'}`}
            >
              Tags
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap px-4 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${activeTab === 'users' ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-text-main hover:bg-primary-light flex-1 md:flex-none text-center md:text-left'}`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveTab('theme')}
              className={`whitespace-nowrap px-4 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${activeTab === 'theme' ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-text-main hover:bg-primary-light flex-1 md:flex-none text-center md:text-left'}`}
            >
              Theme
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-400 text-sm">
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Order ID</th>
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Customer</th>
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Email</th>
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Amount</th>
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Payment</th>
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Status</th>
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Coupon</th>
                    <th className="py-4 px-4 font-medium uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(orders) && orders.map(order => (
                    <tr key={order._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-mono text-gray-500">{order._id?.slice(-6)}</td>
                      <td className="py-4 px-4 font-medium">{order.user?.name || order.address?.name || 'Guest'}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">{order.address?.email || order.user?.email || 'N/A'}</td>
                      <td className="py-4 px-4 font-bold text-primary">₹{order.totalPrice}</td>
                      <td className="py-4 px-4 text-sm">{order.paymentType}</td>
                      <td className="py-4 px-4">
                        <select 
                          value={order.status} 
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="border rounded-lg px-2 py-1 text-xs font-bold bg-white focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Dispatched</option>
                          <option>Delivered</option>
                          <option>Failed</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        {order.couponCode ? (
                          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-black uppercase">
                            {order.couponCode}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedOrderId(order._id);
                              setDeliveryDateValue(order.deliveryDate ? order.deliveryDate.split('T')[0] : '');
                              setIsDatePickerOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-pink-50 rounded-lg transition-colors"
                            title="Set Delivery Date"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Order Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <p className="text-gray-500 py-10 text-center">No orders yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Category Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">Collections</h3>
                {selectedCats.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in slide-in-from-left-2">
                    <button 
                      onClick={async () => {
                        if (window.confirm('Delete selected categories?')) {
                          await api.delete('/api/categories/bulk', { data: { ids: selectedCats } });
                          setSelectedCats([]);
                          fetchCategories();
                        }
                      }}
                      className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete ({selectedCats.length})
                    </button>
                    <button 
                      onClick={async () => {
                        await Promise.all(selectedCats.map(id => api.put(`/api/categories/${id}`, { isSuspended: true })));
                        setSelectedCats([]);
                        fetchCategories();
                      }}
                      className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                    >
                      Suspend
                    </button>
                    <button 
                      onClick={async () => {
                        await Promise.all(selectedCats.map(id => api.put(`/api/categories/${id}`, { isSuspended: false })));
                        setSelectedCats([]);
                        fetchCategories();
                      }}
                      className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                    >
                      Unsuspend
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsCatFormOpen(!isCatFormOpen)}
                className="bg-gray-800 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 text-sm"
              >
                {isCatFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isCatFormOpen ? 'Cancel' : 'New Category'}
              </button>
            </div>

            {/* Add Category Form */}
            {isCatFormOpen && (
              <div className="bg-white rounded-2xl shadow-sm border p-6 animate-in slide-in-from-top-4">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    const data = new FormData();
                    data.append('name', catFormData.name);
                    data.append('image', catFormData.image);
                    try {
                      await api.post('/api/categories', data);
                      setCatFormData({ name: '', image: null });
                      setIsCatFormOpen(false);
                      fetchCategories();
                    } catch (err) { alert('Failed to add category'); }
                    finally { setLoading(false); }
                  }}
                  className="flex flex-col md:flex-row gap-4 items-end"
                >
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category Name</label>
                    <input required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={catFormData.name} onChange={e => setCatFormData({...catFormData, name: e.target.value})} />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cover Image</label>
                    <input required type="file" accept="image/*" className="w-full border p-2 rounded-xl bg-gray-50 text-sm" onChange={e => setCatFormData({...catFormData, image: e.target.files[0]})} />
                  </div>
                  <button disabled={loading} type="submit" className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-pink-500 transition-all flex items-center gap-2 w-full md:w-auto">
                    {loading ? 'Saving...' : 'Save Category'}
                  </button>
                </form>
              </div>
            )}

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
              {Array.isArray(categories) && categories.map(cat => (
                <div key={cat._id} className="flex flex-col items-center gap-3 relative group">
                  <input 
                    type="checkbox" 
                    className="absolute top-0 right-0 w-5 h-5 rounded-full border-gray-300 text-primary focus:ring-primary z-10 cursor-pointer shadow-sm"
                    checked={selectedCats.includes(cat._id)}
                    onChange={() => setSelectedCats(prev => prev.includes(cat._id) ? prev.filter(id => id !== cat._id) : [...prev, cat._id])}
                  />
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 transition-all shadow-sm ${selectedCats.includes(cat._id) ? 'border-primary ring-4 ring-pink-50' : 'border-transparent hover:border-pink-200'}`}>
                    <img 
                      src={cat.image} 
                      alt="" 
                      className={`w-full h-full object-cover transition-all ${cat.isSuspended ? 'grayscale opacity-50' : 'group-hover:scale-110'}`} 
                    />
                    {cat.isSuspended && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                        <span className="text-white text-[8px] font-bold uppercase tracking-widest">Suspended</span>
                      </div>
                    )}
                  </div>
                  <h4 className={`font-bold text-sm transition-colors ${cat.isSuspended ? 'text-gray-400' : 'text-gray-700'}`}>{cat.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">Product Tags</h3>
                {selectedTagsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in slide-in-from-left-2">
                    <button 
                      onClick={async () => {
                        if (window.confirm('Delete selected tags?')) {
                          await api.delete('/api/tags/bulk', { data: { ids: selectedTagsList } });
                          setSelectedTagsList([]);
                          fetchTags();
                        }
                      }}
                      className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete ({selectedTagsList.length})
                    </button>
                    <button 
                      onClick={async () => {
                        await Promise.all(selectedTagsList.map(id => api.put(`/api/tags/${id}`, { isSuspended: true })));
                        setSelectedTagsList([]);
                        fetchTags();
                      }}
                      className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                    >
                      Suspend
                    </button>
                    <button 
                      onClick={async () => {
                        await Promise.all(selectedTagsList.map(id => api.put(`/api/tags/${id}`, { isSuspended: false })));
                        setSelectedTagsList([]);
                        fetchTags();
                      }}
                      className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                    >
                      Unsuspend
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsTagFormOpen(!isTagFormOpen)}
                className="bg-gray-800 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 text-sm"
              >
                {isTagFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isTagFormOpen ? 'Cancel' : 'New Tag'}
              </button>
            </div>

            {isTagFormOpen && (
              <div className="bg-white rounded-2xl shadow-sm border p-6 animate-in slide-in-from-top-4">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    const data = new FormData();
                    data.append('name', tagFormData.name);
                    data.append('image', tagFormData.image);
                    try {
                      await api.post('/api/tags', data);
                      setTagFormData({ name: '', image: null });
                      setIsTagFormOpen(false);
                      fetchTags();
                    } catch (err) { alert('Failed to add tag'); }
                    finally { setLoading(false); }
                  }}
                  className="flex flex-col md:flex-row gap-4 items-end"
                >
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tag Name (e.g. Hot)</label>
                    <input required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={tagFormData.name} onChange={e => setTagFormData({...tagFormData, name: e.target.value})} />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Badge Image/Logo</label>
                    <input required type="file" accept="image/*" className="w-full border p-2 rounded-xl bg-gray-50 text-sm" onChange={e => setTagFormData({...tagFormData, image: e.target.files[0]})} />
                  </div>
                  <button disabled={loading} type="submit" className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-pink-500 transition-all flex items-center gap-2 w-full md:w-auto">
                    {loading ? 'Saving...' : 'Save Tag'}
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
              {Array.isArray(tags) && tags.map(tag => (
                <div key={tag._id} className="flex flex-col items-center gap-3 relative group">
                  <input 
                    type="checkbox" 
                    className="absolute top-0 right-0 w-5 h-5 rounded-full border-gray-300 text-primary focus:ring-primary z-10 cursor-pointer shadow-sm"
                    checked={selectedTagsList.includes(tag._id)}
                    onChange={() => setSelectedTagsList(prev => prev.includes(tag._id) ? prev.filter(id => id !== tag._id) : [...prev, tag._id])}
                  />
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 transition-all shadow-sm ${selectedTagsList.includes(tag._id) ? 'border-primary ring-4 ring-pink-50' : 'border-transparent hover:border-pink-200'}`}>
                    <img 
                      src={tag.image} 
                      alt="" 
                      className={`w-full h-full object-cover transition-all ${tag.isSuspended ? 'grayscale opacity-50' : 'group-hover:scale-110'}`} 
                    />
                    {tag.isSuspended && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                        <span className="text-white text-[8px] font-bold uppercase tracking-widest">Suspended</span>
                      </div>
                    )}
                  </div>
                  <h4 className={`font-bold text-sm transition-colors ${tag.isSuspended ? 'text-gray-400' : 'text-gray-700'}`}>{tag.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Inventory</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border">{filteredProducts.length} Total Items</span>
              </div>
              
              <div className="flex flex-wrap gap-3 items-center">
                {/* Filter Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all ${selectedCategories.length > 0 ? 'bg-pink-50 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary'}`}
                  >
                    <Filter className="w-4 h-4" />
                    {selectedCategories.length > 0 ? `Filtered (${selectedCategories.length})` : 'Filter By'}
                    <Plus className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-45' : ''}`} />
                  </button>

                  {isFilterOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border rounded-2xl shadow-2xl z-20 p-3 animate-in fade-in zoom-in duration-200">
                      <div className="space-y-1.5">
                        {categories.map(cat => (
                          <label 
                            key={cat._id} 
                            className="flex items-center justify-between px-3 py-2.5 hover:bg-pink-50 rounded-xl cursor-pointer transition-colors group"
                          >
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-primary">{cat.name}</span>
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary cursor-pointer"
                              checked={selectedCategories.includes(cat.name)}
                              onChange={() => toggleCategoryFilter(cat.name)}
                            />
                          </label>
                        ))}
                      </div>
                      {selectedCategories.length > 0 && (
                        <button 
                          onClick={() => {
                            setSelectedCategories([]);
                            setIsFilterOpen(false);
                          }}
                          className="w-full mt-3 pt-3 border-t text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-widest text-center"
                        >
                          Reset All Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-1 sm:flex-none">
                  <button 
                    onClick={() => setIsToolsOpen(true)}
                    className="flex-1 sm:flex-none bg-primary-light text-primary border border-theme hover:bg-primary-light font-bold py-2.5 px-6 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                  >
                    <Wrench className="w-4 h-4" />
                    Tools
                  </button>
                  <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="flex-1 sm:flex-none bg-gray-800 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                  >
                    {isFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isFormOpen ? 'Close' : 'Add Product'}
                  </button>
                </div>
              </div>
            </div>

            {/* Product Form */}
            {isFormOpen && (
              <div className="bg-white rounded-2xl shadow-sm border p-6 animate-in slide-in-from-top-4 duration-300">
                <h4 className="text-lg font-bold text-gray-800 mb-6">{editingProduct ? 'Edit Product' : 'Create New Product'}</h4>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Product Name</label>
                      <input required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                      <textarea required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price (₹)</label>
                        <input required type="number" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Stock Qty</label>
                        <input required type="number" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                      <select className="w-full border p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {categories.map(cat => <option key={cat._id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tags (Multiple)</label>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-white max-h-32 overflow-y-auto">
                        {tags.map(tag => (
                          <label key={tag._id} className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold cursor-pointer border transition-all ${formData.tags.includes(tag._id) ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary'}`}>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={formData.tags.includes(tag._id)}
                              onChange={() => {
                                const newTags = formData.tags.includes(tag._id) 
                                  ? formData.tags.filter(id => id !== tag._id) 
                                  : [...formData.tags, tag._id];
                                setFormData({...formData, tags: newTags});
                              }}
                            />
                            {tag.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Images {editingProduct && '(Add more)'}</label>
                      <input type="file" multiple accept="image/*" className="w-full border p-2 rounded-xl bg-gray-50 text-sm" onChange={e => setImages(e.target.files)} />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={resetForm} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                    <button disabled={loading} type="submit" className="bg-gray-800 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg hover:bg-black transition-all flex items-center gap-2">
                      {loading ? 'Saving...' : (editingProduct ? <><Save className="w-5 h-5" /> Update Product</> : <><Plus className="w-5 h-5" /> Publish Product</>)}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Grouped Product List */}
            {Object.keys(groupedProducts).length > 0 ? (
              Object.entries(groupedProducts).map(([category, catProducts]) => (
                <div key={category} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
                    <h4 className="font-bold text-gray-700 uppercase tracking-widest text-xs">{category} Collection</h4>
                    <span className="bg-white border text-[10px] px-2 py-0.5 rounded-full font-bold text-gray-400">{catProducts.length} Items</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b text-[10px] text-gray-400 uppercase tracking-tighter">
                          <th className="py-4 px-6 w-24">PID</th>
                          <th className="py-4 px-4 w-16">Icon</th>
                          <th className="py-4 px-4">Product Details</th>
                          <th className="py-4 px-4">Price</th>
                          <th className="py-4 px-4">Qty</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(catProducts) && catProducts.map((p, idx) => (
                          <tr key={p._id} className="border-b last:border-0 hover:bg-pink-50/30 transition-colors group">
                            <td className="py-4 px-6 text-[10px] font-mono text-gray-400">{p.customId}</td>
                            <td className="py-4 px-4">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border">
                                {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-2 text-gray-300" />}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-bold text-gray-800 text-sm leading-tight">{p.name}</p>
                              <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{p.description}</p>
                            </td>
                            <td className="py-4 px-4 font-bold text-gray-700 text-sm">₹{p.price}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {p.stock}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleEditClick(p)}
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(p._id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border p-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-10 h-10 text-gray-200" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">No products found</h4>
                <p className="text-gray-500 max-w-xs mx-auto mb-6">Start by adding your first product or try adjusting your category filters.</p>
                <button onClick={() => setIsFormOpen(true)} className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all">Add New Product</button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="bg-bg-card rounded-2xl shadow-sm border border-theme overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 border-b border-theme bg-primary-light/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary text-white rounded-lg">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-main">Registered Users</h3>
                  <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Manage your customer base</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-theme text-text-muted text-xs font-black uppercase tracking-tighter bg-gray-50/50">
                    <th className="py-4 px-6">User ID</th>
                    <th className="py-4 px-6">User Details</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {Array.isArray(users) && users.length > 0 ? users.map(u => (
                    <tr key={u._id} className="hover:bg-primary-light/20 transition-colors group">
                      <td className="py-4 px-6 text-xs font-mono text-text-muted">#{u._id?.slice(-8)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-text-main text-sm">{u.name}</p>
                            <p className="text-xs text-text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-text-muted font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u.role === 'admin'}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <UsersIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-text-muted font-bold">No users found in database</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-sm border p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary-light rounded-2xl">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">Website <span className="text-primary">Theme Settings</span></h3>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Personalize the brand aesthetic</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'pink', name: 'Classic Pink', color: '#f472b6', bg: '#fdf2f8', desc: 'The signature warm and playful look.' },
                  { id: 'blue', name: 'Sky Blue', color: '#0ea5e9', bg: '#f0f9ff', desc: 'A calm, modern, and refreshing vibe.' },
                  { id: 'white', name: 'Minimal White', color: '#404040', bg: '#fafafa', desc: 'Clean, professional, and high-contrast.' }
                ].map(t => (
                  <button 
                    key={t.id}
                    onClick={() => updateTheme(t.id)}
                    className={`relative p-8 rounded-[2.5rem] border-4 transition-all text-left overflow-hidden group ${currentTheme === t.id ? 'border-primary bg-white shadow-xl scale-[1.02]' : 'border-transparent bg-gray-50 hover:bg-white hover:shadow-lg'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-2">
                        <div style={{ backgroundColor: t.color }} className="w-10 h-10 rounded-2xl shadow-inner border-2 border-white/20"></div>
                        <div style={{ backgroundColor: t.bg }} className="w-10 h-10 rounded-2xl shadow-inner border-2 border-white/20"></div>
                      </div>
                      {currentTheme === t.id && (
                        <CheckCircle2 className="w-8 h-8 text-primary animate-in zoom-in" />
                      )}
                    </div>
                    <h4 className="text-xl font-black text-gray-800 mb-2">{t.name}</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{t.desc}</p>
                    
                    {/* Visual Decor */}
                    <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity`} style={{ backgroundColor: t.color }}></div>
                  </button>
                ))}
              </div>

              <div className="mt-12 p-6 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 text-center">
                <p className="text-gray-500 font-bold text-sm">Selecting a theme will apply it to the entire website for all visitors.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Delivery Date Modal */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-gray-800">Set Delivery Date</h4>
              <button onClick={() => setIsDatePickerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Select Date</label>
                <input 
                  type="date" 
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-700 font-medium"
                  value={deliveryDateValue}
                  onChange={(e) => setDeliveryDateValue(e.target.value)}
                />
              </div>
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    await api.put(`/api/orders/${selectedOrderId}/status`, { deliveryDate: deliveryDateValue });
                    setIsDatePickerOpen(false);
                    fetchOrders();
                    alert('Delivery date updated and customer notified!');
                  } catch (err) { alert('Failed to update date'); }
                  finally { setLoading(false); }
                }}
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-500 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Updating...' : <><Calendar className="w-5 h-5" /> Save Delivery Date</>}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Tools Modal (Collections & Coupons) */}
      {isToolsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                {toolActiveMode !== 'menu' && (
                  <button 
                    onClick={() => {
                      if (toolActiveMode === 'collections') {
                        if (toolView === 'sections') setToolActiveMode('menu');
                        else setToolView(toolView === 'products' ? 'categories' : 'sections');
                      } else {
                        if (couponStep === 'type') setToolActiveMode('menu');
                        else if (couponStep === 'categories') setCouponStep('type');
                        else if (couponStep === 'products') setCouponStep('categories');
                        else if (couponStep === 'config') setCouponStep('products');
                      }
                    }}
                    className="p-2 hover:bg-white rounded-full shadow-sm border transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h4 className="text-xl font-black text-gray-800">
                    {toolActiveMode === 'menu' ? 'Admin Store Tools' : 
                     toolActiveMode === 'collections' ? 'Homepage Sections' : 
                     'Coupon Manager'}
                  </h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {toolActiveMode === 'menu' ? 'Choose a tool' : 
                     toolActiveMode === 'collections' ? (toolView === 'sections' ? 'Manage Collections' : `Editing ${currentToolSection}`) :
                     `Step: ${couponStep.toUpperCase()}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { 
                  setIsToolsOpen(false); 
                  setToolActiveMode('menu'); 
                  setToolView('sections');
                  setCouponStep('type');
                  setSelectedCouponProducts([]);
                }} 
                className="p-2 hover:bg-white rounded-full border shadow-sm text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* MODE MENU */}
              {toolActiveMode === 'menu' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button 
                    onClick={() => { setToolActiveMode('collections'); setToolView('sections'); }}
                    className="p-8 rounded-3xl border-2 border-gray-100 hover:border-primary hover:bg-pink-50 transition-all text-center group"
                  >
                    <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Wrench className="w-8 h-8 text-primary" />
                    </div>
                    <h5 className="text-lg font-black text-gray-800">Homepage Sections</h5>
                    <p className="text-xs text-gray-400 mt-2">Manage Trending, Recommended, and other custom lists.</p>
                  </button>
                  <button 
                    onClick={() => { setToolActiveMode('coupons'); setCouponStep('type'); }}
                    className="p-8 rounded-3xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Ticket className="w-8 h-8 text-blue-600" />
                    </div>
                    <h5 className="text-lg font-black text-gray-800">Coupon Generator</h5>
                    <p className="text-xs text-gray-400 mt-2">Create Discounts, Promo Codes, and Special Offers.</p>
                  </button>
                </div>
              )}

              {/* COLLECTIONS MODE (Existing Logic) */}
              {toolActiveMode === 'collections' && (
                <>
                  {toolView === 'sections' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['Trending', 'Recommended', 'Best Sell', 'Most Loved'].map(section => (
                        <button 
                          key={section}
                          onClick={() => { setCurrentToolSection(section); setToolView('categories'); }}
                          className="p-6 rounded-2xl border-2 border-gray-100 hover:border-primary hover:bg-pink-50 transition-all text-left group"
                        >
                          <h5 className="font-black text-gray-800 group-hover:text-primary transition-colors">{section}</h5>
                          <p className="text-xs text-gray-400 mt-1">{(tempSelectedProducts[section] || []).length} Products Selected</p>
                        </button>
                      ))}
                    </div>
                  ) : toolView === 'categories' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {categories.map(cat => (
                        <button 
                          key={cat._id}
                          onClick={() => { setToolSelectedCat(cat.name); setToolView('products'); }}
                          className="flex flex-col items-center gap-2 p-4 rounded-2xl border hover:border-primary transition-all bg-gray-50/50 hover:bg-white"
                        >
                          <img src={cat.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                          <span className="text-xs font-bold text-gray-700">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {products.filter(p => p.category === toolSelectedCat).map(product => {
                        const isSelected = (tempSelectedProducts[currentToolSection] || []).includes(product._id);
                        return (
                          <label key={product._id} className={`flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-pink-50 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                            <input type="checkbox" className="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary" checked={isSelected}
                              onChange={() => {
                                const currentList = tempSelectedProducts[currentToolSection] || [];
                                const newList = isSelected ? currentList.filter(id => id !== product._id) : [...currentList, product._id];
                                setTempSelectedProducts({ ...tempSelectedProducts, [currentToolSection]: newList });
                              }}
                            />
                            <img src={product.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div><p className="text-sm font-bold text-gray-800">{product.name}</p><p className="text-xs text-gray-400">₹{product.price}</p></div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* COUPONS MODE */}
              {toolActiveMode === 'coupons' && (
                <>
                  {couponStep === 'type' && (
                    <div className="space-y-4">
                      <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Select Coupon Type</h5>
                      {['Discount', 'Promo Code', 'Special Code'].map(type => (
                        <button 
                          key={type}
                          onClick={() => { setCouponFormData({ ...couponFormData, type }); setCouponStep('categories'); }}
                          className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex items-center justify-between group"
                        >
                          <div>
                            <h6 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{type}</h6>
                            <p className="text-xs text-gray-400">{type === 'Discount' ? 'Applied directly to products (crossed price).' : 'Redeemable at checkout by customers.'}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                        </button>
                      ))}
                    </div>
                  )}

                  {couponStep === 'categories' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Product Categories</h5>
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">{selectedCouponProducts.length} Selected</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {categories.map(cat => (
                          <button 
                            key={cat._id}
                            onClick={() => { setToolSelectedCat(cat.name); setCouponStep('products'); }}
                            className="flex items-center gap-3 p-4 rounded-2xl border hover:border-blue-500 transition-all bg-gray-50/50 hover:bg-white"
                          >
                            <img src={cat.image} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                            <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                      {selectedCouponProducts.length > 0 && (
                        <button 
                          onClick={() => setCouponStep('config')}
                          className="w-full mt-6 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          Next: Configure Coupon <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}

                  {couponStep === 'products' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest">{toolSelectedCat} Products</h5>
                        <button onClick={() => setCouponStep('categories')} className="text-xs font-bold text-blue-600 hover:underline">Back to Categories</button>
                      </div>
                      <div className="space-y-2">
                        {products.filter(p => p.category === toolSelectedCat).map(product => {
                          const isSelected = selectedCouponProducts.includes(product._id);
                          return (
                            <label key={product._id} className={`flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white hover:bg-gray-50'}`}>
                              <input type="checkbox" className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" checked={isSelected}
                                onChange={() => {
                                  setSelectedCouponProducts(prev => isSelected ? prev.filter(id => id !== product._id) : [...prev, product._id]);
                                }}
                              />
                              <img src={product.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800">{product.name}</p>
                                <p className="text-xs text-gray-400">PID: {product.customId}</p>
                              </div>
                              <span className="text-sm font-bold text-gray-700">₹{product.price}</span>
                            </label>
                          );
                        })}
                      </div>
                      <button 
                        onClick={() => setCouponStep('categories')}
                        className="w-full mt-4 bg-gray-800 text-white font-bold py-3 rounded-xl transition-all"
                      >
                        Done selecting in this category
                      </button>
                    </div>
                  )}

                  {couponStep === 'config' && (
                    <div className="space-y-6">
                      <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest">Final Configuration</h5>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Unique Coupon Code</label>
                          <input 
                            placeholder="e.g. SUMMER50"
                            className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold uppercase"
                            value={couponFormData.code}
                            onChange={e => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Value Type</label>
                            <select 
                              className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                              value={couponFormData.discountType}
                              onChange={e => setCouponFormData({ ...couponFormData, discountType: e.target.value })}
                            >
                              <option>Percentage</option>
                              <option>Amount</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Discount {couponFormData.discountType === 'Percentage' ? '(%)' : '(₹)'}</label>
                            <input 
                              type="number"
                              className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                              value={couponFormData.discountValue}
                              onChange={e => setCouponFormData({ ...couponFormData, discountValue: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-xs text-blue-700 font-medium">This coupon will apply to <strong>{selectedCouponProducts.length}</strong> selected products.</p>
                      </div>
                      <button 
                        onClick={async () => {
                          setLoading(true);
                          try {
                            await api.post('/api/coupons', {
                              ...couponFormData,
                              applicableProducts: selectedCouponProducts
                            });
                            fetchCoupons();
                            alert('Coupon created successfully!');
                            setIsToolsOpen(false);
                            setToolActiveMode('menu');
                          } catch (err) { alert('Failed to create coupon'); }
                          finally { setLoading(false); }
                        }}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'Creating...' : <><Save className="w-5 h-5" /> Generate Coupon</>}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer (For Collections Mode) */}
            {toolActiveMode === 'collections' && (
              <div className="p-6 border-t bg-gray-50/50 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400">
                  {currentToolSection ? `Editing: ${currentToolSection}` : 'Select a section to begin'}
                </p>
                <button 
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await api.post('/api/collections', {
                        name: currentToolSection,
                        products: tempSelectedProducts[currentToolSection] || []
                      });
                      fetchCollections();
                      alert(`${currentToolSection} updated successfully!`);
                    } catch (err) { alert('Failed to update section'); }
                    finally { setLoading(false); }
                  }}
                  disabled={!currentToolSection || loading}
                  className="bg-primary text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-500 transition-all flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
