import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Plus, Pencil, Trash2, Filter, X, Save, Image as ImageIcon, Calendar, Wrench, ChevronLeft, ChevronRight, Palette, CheckCircle2, Users as UsersIcon, Ticket, Download, Eye, EyeOff, MoveUp, MoveDown, Layout, List, Gift, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCoupons } from '../context/CouponContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { fetchCoupons: refreshGlobalCoupons } = useCoupons();
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
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: '', 
    stock: 0, 
    tags: [],
    variants: {
      sizes: [],
      colors: [],
      custom: { title: '', options: [] }
    },
    returnPolicy: 'No Return',
    deliveryTime: 'Delivery under 10 days',
    shippingCharges: 49
  });
  const [images, setImages] = useState([]); // Array for multi-image
  const [existingImages, setExistingImages] = useState([]); // Array for existing images when editing
  const [loading, setLoading] = useState(false);
  const [currentSize, setCurrentSize] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [currentCustomOption, setCurrentCustomOption] = useState('');
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [variantTab, setVariantTab] = useState('sizes'); // 'sizes', 'colors', 'custom'
  const [tempVariants, setTempVariants] = useState({ sizes: [], colors: [], custom: { title: '', options: [] } });

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
  const [editingCollection, setEditingCollection] = useState(null);
  const [collectionFormData, setCollectionFormData] = useState({ name: '', title: '', template: 'default', isActive: true, order: 0, cards: [] });
  const [ordersSettings, setOrdersSettings] = useState(null);

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
      fetchOrdersSettings();
    }
  }, [user]);

  const fetchOrdersSettings = async () => {
    try {
      const res = await api.get('/api/settings/payment_methods');
      setOrdersSettings(res.data);
    } catch (err) { console.error(err); }
  };

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

  const handleReorder = async (currentIndex, direction) => {
    const neighborIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (neighborIndex < 0 || neighborIndex >= collections.length) return;

    // OPTIMISTIC UI UPDATE: Swap immediately in local state
    const newCollections = [...collections];
    const currentSection = { ...newCollections[currentIndex] };
    const neighborSection = { ...newCollections[neighborIndex] };
    
    // Swap order values in local objects
    const tempOrder = currentSection.order;
    currentSection.order = neighborSection.order;
    neighborSection.order = tempOrder;

    // Swap positions in array
    newCollections[currentIndex] = neighborSection;
    newCollections[neighborIndex] = currentSection;

    setCollections(newCollections);

    try {
      // Parallel API calls for speed
      await Promise.all([
        api.put(`/api/collections/${currentSection._id}`, { order: currentSection.order }),
        api.put(`/api/collections/${neighborSection._id}`, { order: neighborSection.order })
      ]);
      // Silently sync with server to ensure consistency
      const res = await api.get('/api/collections');
      setCollections(res.data);
    } catch (err) {
      console.error('Failed to reorder:', err);
      fetchCollections(); // Revert to server state on error
    }
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
    setOrders(prev => prev.map(order => order._id === id ? { ...order, status } : order));
    try {
      await api.put(`/api/orders/${id}/status`, { status });
    } catch (error) {
      console.error(error);
      fetchOrders(); // Revert on failure
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Delete this order record permanently?')) {
      try {
        await api.delete(`/api/orders/${id}`);
        fetchOrders();
      } catch (err) { alert('Failed to delete order'); }
    }
  };

  const handleDownloadInvoice = (order) => {
    const doc = new jsPDF();
    const customerName = order.user?.name || order.address?.name || 'Guest';
    const email = order.address?.email || order.user?.email || 'N/A';
    const addressStr = order.address 
      ? `${order.address.addressLine}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
      : 'N/A';

    // Header
    doc.setFontSize(22);
    doc.setTextColor(244, 114, 182); // Primary pink
    doc.text('ArVr Store', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Invoice for Order #' + (order._id?.slice(-6) || ''), 14, 30);
    doc.text('Date: ' + new Date(order.createdAt).toLocaleDateString(), 14, 35);

    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Billed To:', 14, 50);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Name: ${customerName}`, 14, 57);
    doc.text(`Email: ${email}`, 14, 62);
    doc.text(`Address: ${addressStr}`, 14, 67);
    if (order.address?.landmark) {
      doc.text(`Landmark: ${order.address.landmark}`, 14, 72);
    }
    doc.text(`Payment Method: ${order.paymentType}`, 14, 77);

    // Table Data
    const tableColumn = ["Product", "Options", "Quantity", "Price", "Total"];
    const tableRows = [];

    order.products.forEach(item => {
      const productName = item.product?.name || 'Deleted Product';
      
      let optionsStr = '';
      if (item.selectedOptions) {
        if (item.selectedOptions.size) optionsStr += `Size: ${item.selectedOptions.size}\n`;
        if (item.selectedOptions.color) optionsStr += `Color: ${item.selectedOptions.color}\n`;
        if (item.selectedOptions.custom) optionsStr += `Custom: ${item.selectedOptions.custom}\n`;
      }
      
      const price = `Rs. ${item.price || item.product?.price || 0}`;
      const total = `Rs. ${(item.price || item.product?.price || 0) * item.quantity}`;
      
      tableRows.push([productName, optionsStr.trim() || '-', item.quantity, price, total]);
    });

    // AutoTable
    autoTable(doc, {
      startY: 85,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [244, 114, 182] }, // Pink header
      styles: { fontSize: 9 },
      columnStyles: { 
        0: { cellWidth: 60 },
        1: { cellWidth: 40 }
      }
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY || 85;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Subtotal: Rs. ${order.subTotal || (order.totalPrice - (order.shippingCharges || 0))}`, 14, finalY + 15);
    doc.text(`Shipping: Rs. ${order.shippingCharges || 0}`, 14, finalY + 22);
    
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(`Total Amount: Rs. ${order.totalPrice}`, 14, finalY + 32);
    if (order.couponCode) {
      doc.text(`Coupon Applied: ${order.couponCode}`, 14, finalY + 39);
    }

    doc.save(`Invoice_${order._id?.slice(-6)}.pdf`);
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
      tags: product.tags?.map(t => t._id || t) || [],
      variants: product.variants || { sizes: [], colors: [], custom: { title: '', options: [] } },
      returnPolicy: product.returnPolicy || 'No Return',
      deliveryTime: product.deliveryTime || 'Delivery under 10 days',
      shippingCharges: product.shippingCharges || 49
    });
    setExistingImages(product.images || []);
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
    data.append('variants', JSON.stringify(formData.variants));
    data.append('returnPolicy', formData.returnPolicy);
    data.append('deliveryTime', formData.deliveryTime);
    data.append('shippingCharges', formData.shippingCharges);

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    if (editingProduct) {
      // Add existing images to data
      existingImages.forEach(img => data.append('existingImages', img));
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
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      category: categories[0]?.name || 'For Her', 
      stock: 0, 
      tags: [],
      variants: { sizes: [], colors: [], custom: { title: '', options: [] } },
      returnPolicy: 'No Return',
      deliveryTime: 'Delivery under 10 days',
      shippingCharges: 49
    });
    setImages([]);
    setExistingImages([]);
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
    <div className="w-full mx-auto px-4 lg:px-12 xl:px-20 2xl:px-32 py-8 flex flex-col md:flex-row gap-8">
      {/* Navigation (Sidebar on Desktop, Horizontal Scroll on Mobile) */}
      <div className="w-full md:w-[280px] flex-shrink-0">
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
            <button 
              onClick={() => setActiveTab('payment')}
              className={`whitespace-nowrap px-4 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${activeTab === 'payment' ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-text-main hover:bg-primary-light flex-1 md:flex-none text-center md:text-left'}`}
            >
              Payment Control
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
                  <tr className="border-b text-gray-400 text-xs">
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Order ID</th>
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Customer</th>
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Email</th>
                    <th className="py-4 px-4 font-medium uppercase tracking-wider">Address</th>
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
                      <td className="py-4 px-4 text-xs font-mono text-gray-500">{order._id?.slice(-6)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-gray-800 text-sm">{order.user?.name || order.address?.name || 'Guest'}</div>
                          {order.paymentType === 'WhatsApp' && (
                            <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-green-200">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="" className="w-2.5 h-2.5" />
                              WHATSAPP ORDER
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          {order.products.map((item, idx) => (
                            <div key={idx} className="text-[10px] bg-gray-50 p-1.5 rounded border border-gray-100 max-w-[200px]">
                              <div className="font-bold text-gray-600 truncate">{item.product?.name || 'Deleted Product'} <span className="text-primary">x{item.quantity}</span></div>
                              {item.selectedOptions && (Object.values(item.selectedOptions).some(v => v)) && (
                                <div className="text-[9px] text-primary font-bold flex flex-wrap gap-x-2 mt-0.5 uppercase tracking-tighter">
                                  {item.selectedOptions.size && <span>Size: {item.selectedOptions.size}</span>}
                                  {item.selectedOptions.color && <span>Color: {item.selectedOptions.color}</span>}
                                  {item.selectedOptions.custom && <span>{item.selectedOptions.custom}</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[11px] text-gray-500 max-w-[200px] break-all">{order.address?.email || order.user?.email || 'N/A'}</td>
                      <td className="py-4 px-4 text-[11px] text-gray-600 max-w-[300px] break-words">
                        {order.address ? (
                          <>
                            {order.address.addressLine}, {order.address.city}, {order.address.state} - {order.address.pincode}
                            {order.address.landmark && <><br /><span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Landmark: {order.address.landmark}</span></>}
                          </>
                        ) : 'N/A'}
                      </td>
                      <td className="py-4 px-4 font-bold text-primary text-sm">₹{order.totalPrice}</td>
                      <td className="py-4 px-4">
                        {order.paymentType === 'WhatsApp' ? (
                          <div className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg border border-green-100 w-fit">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="" className="w-3 h-3" />
                            WA
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-600">{order.paymentType}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <select 
                          value={order.status} 
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className={`border rounded-lg px-2 py-1 text-xs font-bold bg-white focus:ring-2 focus:ring-primary outline-none ${order.status === 'Under Verification' ? 'border-amber-400 text-amber-600 animate-pulse' : ''}`}
                        >
                          <option>Pending</option>
                          <option>Under Verification</option>
                          <option>Processing</option>
                          <option>Dispatched</option>
                          <option>Delivered</option>
                          <option>Failed</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        {order.couponCode ? (
                          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-black uppercase max-w-[60px] truncate block">
                            {order.couponCode}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            onClick={() => handleDownloadInvoice(order)}
                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download Invoice PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-6 p-4">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-6 p-4">
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
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6 mt-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Return Policy</label>
                        <input type="text" className="w-full border p-2.5 rounded-xl bg-gray-50 text-sm" value={formData.returnPolicy} onChange={e => setFormData({...formData, returnPolicy: e.target.value})} placeholder="e.g. No Return" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Delivery Time</label>
                        <input type="text" className="w-full border p-2.5 rounded-xl bg-gray-50 text-sm" value={formData.deliveryTime} onChange={e => setFormData({...formData, deliveryTime: e.target.value})} placeholder="e.g. Under 10 days" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Shipping Charges (₹)</label>
                        <input type="number" className="w-full border p-2.5 rounded-xl bg-gray-50 text-sm" value={formData.shippingCharges} onChange={e => setFormData({...formData, shippingCharges: e.target.value})} placeholder="49" />
                      </div>
                    </div>
                    {/* Variants / Add-ons Section */}
                    <div className="md:col-span-2 border-t pt-6 mt-4">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50/50 border-2 border-dashed border-gray-200">
                        <div>
                          <h5 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2 mb-1">
                            <Wrench className="w-4 h-4 text-primary" /> Product Add-ons (Variants)
                          </h5>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-tight">
                            {formData.variants.sizes.length || 0} Sizes • {formData.variants.colors.length || 0} Colors • {formData.variants.custom.options.length > 0 ? 'Custom Feature Enabled' : 'No Custom Feature'}
                          </p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            setTempVariants(JSON.parse(JSON.stringify(formData.variants))); // Deep copy
                            setIsVariantModalOpen(true);
                          }}
                          className="bg-white border-2 border-primary text-primary px-6 py-2.5 rounded-xl font-black text-xs hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Manage Add-ons
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Product Images</label>
                      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4">
                        <div className="flex flex-wrap gap-4 mb-4">
                          {existingImages.map((url, index) => (
                            <div key={`existing-${index}`} className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                              <img src={url} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => setExistingImages(existingImages.filter((_, i) => i !== index))} 
                                className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {images.map((file, index) => (
                            <div key={`new-${index}`} className="relative w-24 h-24 rounded-xl border border-primary overflow-hidden shadow-sm group">
                              <img src={URL.createObjectURL(file)} alt={`New ${index}`} className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => setImages(images.filter((_, i) => i !== index))} 
                                className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-primary text-gray-600 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                          <ImageIcon className="w-5 h-5 text-primary" />
                          {(existingImages.length + images.length) > 0 ? 'Add More Images' : 'Add Images'}
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={e => {
                              if (e.target.files) {
                                setImages([...images, ...Array.from(e.target.files)]);
                              }
                            }} 
                          />
                        </label>
                      </div>
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
                <p className="text-gray-500 max-w-md mx-auto mb-6">Start by adding your first product or try adjusting your category filters.</p>
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
        {activeTab === 'payment' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-sm border p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-50 rounded-2xl">
                  <Ticket className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">Payment <span className="text-green-600">Method Control</span></h3>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Toggle checkout payment options</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'cod', name: 'Cash on Delivery', desc: 'Allow customers to pay when they receive the order.', icon: '🚚' },
                  { id: 'online', name: 'Online Payment', desc: 'Secure payments via Razorpay (Cards, UPI, Netbanking).', icon: '💳' },
                  { id: 'whatsapp', name: 'WhatsApp Order', desc: 'Direct orders via pre-filled WhatsApp messages.', icon: '💬' }
                ].map(method => (
                  <div key={method.id} className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-transparent hover:border-gray-100 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-4xl">{method.icon}</span>
                      <button 
                        onClick={async () => {
                          const currentMethods = ordersSettings?.value || { cod: true, online: true, whatsapp: true };
                          const updatedMethods = { ...currentMethods, [method.id]: !currentMethods[method.id] };
                          try {
                            const res = await api.put('/api/settings/payment_methods', { value: updatedMethods });
                            setOrdersSettings(res.data);
                          } catch (err) { alert('Failed to update payment settings'); }
                        }}
                        className={`relative w-14 h-7 rounded-full transition-colors ${ordersSettings?.value?.[method.id] ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${ordersSettings?.value?.[method.id] ? 'translate-x-7' : ''}`} />
                      </button>
                    </div>
                    <h4 className="text-xl font-black text-gray-800 mb-2">{method.name}</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">{method.desc}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${ordersSettings?.value?.[method.id] ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {ordersSettings?.value?.[method.id] ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 rounded-3xl bg-blue-50/50 border-2 border-dashed border-blue-200 text-center">
                <p className="text-blue-600 font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Changes are applied instantly to the checkout page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Delivery Date Modal */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
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
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            
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
                    onClick={() => { setToolActiveMode('coupons'); setCouponStep('list'); }}
                    className="p-8 rounded-3xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Ticket className="w-8 h-8 text-blue-600" />
                    </div>
                    <h5 className="text-lg font-black text-gray-800">Coupon Manager</h5>
                    <p className="text-xs text-gray-400 mt-2">View, Delete, or Create new Discount & Promo codes.</p>
                  </button>
                </div>
              )}

              {/* COLLECTIONS MODE (Dynamic Logic) */}
              {toolActiveMode === 'collections' && (
                <>
                  {toolView === 'sections' ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Sections</p>
                        <button 
                          onClick={() => {
                            setEditingCollection(null);
                            setCollectionFormData({ name: '', title: '', template: 'default', isActive: true, order: collections.length, cards: [] });
                            setToolView('edit');
                          }}
                          className="text-xs font-black text-primary flex items-center gap-1 hover:underline"
                        >
                          <Plus className="w-3 h-3" /> Add New Section
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {collections.map((col, idx) => (
                          <div 
                            key={col._id}
                            className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${col.isActive ? 'border-gray-100 bg-white hover:border-primary' : 'border-gray-50 bg-gray-50 opacity-60'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${col.template === 'offer' ? 'bg-pink-100 text-pink-600' : col.template === 'deal' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                                {col.template === 'offer' ? <Gift className="w-5 h-5" /> : col.template === 'deal' ? <Zap className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
                              </div>
                              <div>
                                <h5 className="font-black text-gray-800 flex items-center gap-2">
                                  {col.title || col.name}
                                  {!col.isActive && <span className="text-[8px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded uppercase">Suspended</span>}
                                </h5>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                  <span>{col.products?.length || 0} Products</span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span className="text-primary">Position: {col.order}</span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span>{col.template} Template</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => {
                                  setEditingCollection(col);
                                  setCollectionFormData({ name: col.name, title: col.title, template: col.template, isActive: col.isActive, order: col.order, cards: col.cards || [] });
                                  setToolView('edit');
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors"
                                title="Edit Settings"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setCurrentToolSection(col.name);
                                  setToolView('categories');
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors"
                                title="Manage Products"
                              >
                                <List className="w-4 h-4" />
                              </button>
                              <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
                              <button 
                                onClick={() => handleReorder(idx, 'up')}
                                disabled={idx === 0}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 disabled:opacity-20"
                              >
                                <MoveUp className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleReorder(idx, 'down')}
                                disabled={idx === collections.length - 1}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 disabled:opacity-20"
                              >
                                <MoveDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : toolView === 'edit' ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Section ID (Unique Name)</label>
                          <input 
                            disabled={editingCollection}
                            className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold"
                            value={collectionFormData.name}
                            onChange={e => setCollectionFormData({ ...collectionFormData, name: e.target.value.toLowerCase().replace(/ /g, '_') })}
                            placeholder="e.g. winter_specials"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Title</label>
                          <input 
                            className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold"
                            value={collectionFormData.title}
                            onChange={e => setCollectionFormData({ ...collectionFormData, title: e.target.value })}
                            placeholder="e.g. Hot Winter Deals"
                          />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">UI Template</label>
                            <select 
                              className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold"
                              value={collectionFormData.template}
                              onChange={e => setCollectionFormData({ ...collectionFormData, template: e.target.value })}
                            >
                              <option value="default">Default Grid</option>
                              <option value="offer">Special Offer (Pink)</option>
                              <option value="deal">Flash Deal (Dark)</option>
                              <option value="card">Special Card Offer (Horizontal)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Position</label>
                            <input 
                              type="number"
                              className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold"
                              value={collectionFormData.order}
                              onChange={e => setCollectionFormData({ ...collectionFormData, order: parseInt(e.target.value) || 0 })}
                              placeholder="e.g. 1"
                            />
                            <p className="text-[9px] text-gray-400 mt-1 font-bold">Lower numbers appear first</p>
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setCollectionFormData({ ...collectionFormData, isActive: true })}
                                className={`flex-1 p-4 rounded-2xl font-black text-xs transition-all ${collectionFormData.isActive ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-400'}`}
                              >
                                Active
                              </button>
                              <button 
                                onClick={() => setCollectionFormData({ ...collectionFormData, isActive: false })}
                                className={`flex-1 p-4 rounded-2xl font-black text-xs transition-all ${!collectionFormData.isActive ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-gray-100 text-gray-400'}`}
                              >
                                Off
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* CARD MANAGER (Only for 'card' template) */}
                        {collectionFormData.template === 'card' && (
                          <div className="pt-6 border-t animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-6">
                              <div>
                                <h5 className="text-sm font-black text-gray-800 uppercase tracking-widest">Card Manager</h5>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Add up to 10 special offer cards</p>
                              </div>
                              <button 
                                onClick={() => {
                                  if (collectionFormData.cards.length >= 10) return alert('Max 10 cards allowed');
                                  setCollectionFormData({
                                    ...collectionFormData,
                                    cards: [...collectionFormData.cards, { text: 'New Card', cardType: 'price', priceLimit: 99, products: [], image: '' }]
                                  });
                                }}
                                className="bg-primary text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl shadow-lg shadow-pink-100"
                              >
                                + Add Card
                              </button>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {collectionFormData.cards.map((card, cIdx) => (
                                <div key={cIdx} className="p-4 bg-gray-50 rounded-3xl border-2 border-gray-100 space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Card Text</label>
                                        <input 
                                          className="w-full bg-white border p-3 rounded-xl text-xs font-bold"
                                          value={card.text}
                                          onChange={e => {
                                            const newCards = [...collectionFormData.cards];
                                            newCards[cIdx].text = e.target.value;
                                            setCollectionFormData({ ...collectionFormData, cards: newCards });
                                          }}
                                          placeholder="e.g. Under ₹49"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Card Image URL (Optional)</label>
                                        <input 
                                          className="w-full bg-white border p-3 rounded-xl text-xs font-bold"
                                          value={card.image || ''}
                                          onChange={e => {
                                            const newCards = [...collectionFormData.cards];
                                            newCards[cIdx].image = e.target.value;
                                            setCollectionFormData({ ...collectionFormData, cards: newCards });
                                          }}
                                          placeholder="https://..."
                                        />
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        const newCards = collectionFormData.cards.filter((_, i) => i !== cIdx);
                                        setCollectionFormData({ ...collectionFormData, cards: newCards });
                                      }}
                                      className="ml-4 p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => {
                                          const newCards = [...collectionFormData.cards];
                                          newCards[cIdx].cardType = 'price';
                                          setCollectionFormData({ ...collectionFormData, cards: newCards });
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${card.cardType === 'price' ? 'bg-primary text-white' : 'bg-white text-gray-400 border'}`}
                                      >
                                        By Price
                                      </button>
                                      <button 
                                        onClick={() => {
                                          const newCards = [...collectionFormData.cards];
                                          newCards[cIdx].cardType = 'custom';
                                          setCollectionFormData({ ...collectionFormData, cards: newCards });
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${card.cardType === 'custom' ? 'bg-primary text-white' : 'bg-white text-gray-400 border'}`}
                                      >
                                        Custom Products
                                      </button>
                                    </div>

                                    {card.cardType === 'price' ? (
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Min ₹ (Optional)</span>
                                          <input 
                                            type="number"
                                            className="w-20 bg-white border p-1.5 rounded-lg text-xs font-bold"
                                            value={card.minPriceLimit === undefined ? '' : card.minPriceLimit}
                                            onChange={e => {
                                              const newCards = [...collectionFormData.cards];
                                              newCards[cIdx].minPriceLimit = e.target.value ? parseInt(e.target.value) : undefined;
                                              setCollectionFormData({ ...collectionFormData, cards: newCards });
                                            }}
                                            placeholder="0"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Under ₹</span>
                                          <input 
                                            type="number"
                                            className="w-20 bg-white border p-1.5 rounded-lg text-xs font-bold"
                                            value={card.priceLimit}
                                            onChange={e => {
                                              const newCards = [...collectionFormData.cards];
                                              newCards[cIdx].priceLimit = parseInt(e.target.value) || 0;
                                              setCollectionFormData({ ...collectionFormData, cards: newCards });
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => {
                                          // Set up currentToolSection to a special name for this card
                                          const cardSectionName = `${collectionFormData.name}_card${cIdx}`;
                                          setCurrentToolSection(cardSectionName);
                                          
                                          // Pre-fill tempSelectedProducts for this card if it exists
                                          setTempSelectedProducts({
                                            ...tempSelectedProducts,
                                            [cardSectionName]: card.products?.map(p => p._id || p) || []
                                          });
                                          
                                          setToolView('categories');
                                        }}
                                        className="text-[10px] font-black text-primary hover:underline flex items-center gap-1"
                                      >
                                        <List className="w-3 h-3" /> 
                                        Manage {card.products?.length || 0} Products
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {collectionFormData.cards.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-3xl">
                                  <p className="text-xs text-gray-400 font-bold italic">No cards added. Click "+ Add Card" to start.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 pt-4 border-t">
                        {editingCollection && (
                          <button 
                            onClick={async () => {
                              if (window.confirm('Delete this entire section?')) {
                                await api.delete(`/api/collections/${editingCollection._id}`);
                                fetchCollections();
                                setToolView('sections');
                              }
                            }}
                            className="p-4 rounded-2xl border-2 border-red-50 hover:bg-red-50 text-red-500 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={async () => {
                            setLoading(true);
                            try {
                              if (editingCollection) {
                                await api.put(`/api/collections/${editingCollection._id}`, collectionFormData);
                              } else {
                                await api.post('/api/collections', collectionFormData);
                              }
                              fetchCollections();
                              setToolView('sections');
                              alert('Section saved successfully!');
                            } catch (err) { alert('Failed to save section'); }
                            finally { setLoading(false); }
                          }}
                          className="flex-1 bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-pink-100 hover:bg-pink-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Save className="w-5 h-5" /> {editingCollection ? 'Update Section' : 'Create Section'}
                        </button>
                      </div>
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
                  {couponStep === 'list' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest">Active Coupons ({coupons.length})</h5>
                        <button 
                          onClick={() => setCouponStep('type')}
                          className="bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl shadow-lg shadow-blue-100 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Create New
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {coupons.map(cp => (
                          <div key={cp._id} className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${cp.type === 'Discount' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Ticket className="w-5 h-5" />
                              </div>
                              <div>
                                <h6 className="font-black text-gray-800 flex items-center gap-2">
                                  {cp.code}
                                  <span className="text-[8px] bg-white border px-1.5 py-0.5 rounded uppercase text-gray-400">{cp.type}</span>
                                </h6>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  {cp.discountType === 'Percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`}
                                  <span className="mx-2">•</span>
                                  {cp.applicableProducts?.length || 0} Products
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={async () => {
                                if (window.confirm('Delete this coupon permanently?')) {
                                  try {
                                    await api.delete(`/api/coupons/${cp._id}`);
                                    fetchCoupons();
                                    if (refreshGlobalCoupons) refreshGlobalCoupons();
                                  } catch (err) { alert('Failed to delete coupon'); }
                                }
                              }}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {coupons.length === 0 && (
                          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
                            <p className="text-sm text-gray-400 font-bold italic">No coupons found. Create one to get started!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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
                              discountValue: Number(couponFormData.discountValue),
                              applicableProducts: selectedCouponProducts
                            });
                             fetchCoupons();
                             if (refreshGlobalCoupons) refreshGlobalCoupons();
                             alert('Coupon created successfully!');
                             setIsToolsOpen(false);
                             setToolActiveMode('menu');
                           } catch (err) { 
                             alert(err.response?.data?.message || 'Failed to create coupon. Check if the code is already used.'); 
                           }
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
             {toolActiveMode === 'collections' && (toolView === 'products' || toolView === 'categories') && (
               <div className="p-6 border-t bg-gray-50/50 flex items-center justify-between">
                 <p className="text-xs font-bold text-gray-400">
                   {currentToolSection ? `Editing Products for: ${currentToolSection.includes('_card') ? `Card ${parseInt(currentToolSection.split('_card')[1]) + 1}` : currentToolSection}` : 'Select a section to begin'}
                 </p>
                 <button 
                   onClick={async () => {
                     if (currentToolSection.includes('_card')) {
                       // Logic for updating products within a specific card in the form
                       const [sectionName, cardSuffix] = currentToolSection.split('_card');
                       const cardIdx = parseInt(cardSuffix);
                       const newCards = [...collectionFormData.cards];
                       newCards[cardIdx].products = tempSelectedProducts[currentToolSection] || [];
                       setCollectionFormData({ ...collectionFormData, cards: newCards });
                       setToolView('edit');
                       alert('Card products updated locally. Don\'t forget to Save the Section!');
                       return;
                     }
 
                     setLoading(true);
                     try {
                       await api.post('/api/collections', {
                         name: currentToolSection,
                         products: tempSelectedProducts[currentToolSection] || []
                       });
                       fetchCollections();
                       alert(`${currentToolSection} products updated successfully!`);
                       setToolView('sections');
                     } catch (err) { alert('Failed to update products'); }
                     finally { setLoading(false); }
                   }}
                   disabled={!currentToolSection || loading}
                   className="bg-primary text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-500 transition-all flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                 >
                   {loading ? 'Saving...' : <><Save className="w-5 h-5" /> {currentToolSection?.includes('_card') ? 'Confirm Selection' : 'Save Product Selection'}</>}
                 </button>
               </div>
             )}
           </div>
         </div>
       )}
       {/* Variant Modal */}
       {isVariantModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             {/* Modal Header */}
             <div className="bg-gray-50 px-8 py-6 border-b flex justify-between items-center">
               <div>
                 <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest">Manage Add-ons</h2>
                 <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Configure sizes, colors and custom features</p>
               </div>
               <button onClick={() => setIsVariantModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                 <X className="w-6 h-6 text-gray-400" />
               </button>
             </div>
 
             {/* Modal Tabs */}
             <div className="flex border-b px-8 bg-gray-50/50">
               {['sizes', 'colors', 'custom'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setVariantTab(tab)}
                   className={`py-4 px-6 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${variantTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                 >
                   {tab}
                 </button>
               ))}
             </div>
 
             {/* Modal Content */}
             <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
               {variantTab === 'sizes' && (
                 <div className="space-y-6">
                   <div className="flex gap-3">
                     <input 
                       type="text" 
                       className="flex-1 border-2 border-gray-100 p-3 rounded-2xl text-sm outline-none focus:border-primary transition-colors font-bold" 
                       placeholder="Enter size (e.g. XL, 42, Large)"
                       value={currentSize}
                       onChange={e => setCurrentSize(e.target.value)}
                       onKeyDown={e => {
                         if (e.key === 'Enter') {
                           e.preventDefault();
                           if (currentSize.trim()) {
                             setTempVariants({...tempVariants, sizes: [...tempVariants.sizes, currentSize.trim()]});
                             setCurrentSize('');
                           }
                         }
                       }}
                     />
                     <button onClick={() => {
                       if (currentSize.trim()) {
                         setTempVariants({...tempVariants, sizes: [...tempVariants.sizes, currentSize.trim()]});
                         setCurrentSize('');
                       }
                     }} className="bg-primary text-white p-3 rounded-2xl hover:bg-pink-500 transition-all shadow-lg shadow-pink-100 active:scale-95">
                       <Plus className="w-6 h-6" />
                     </button>
                   </div>
                   <div className="flex flex-wrap gap-3">
                     {tempVariants.sizes.map((s, i) => (
                       <span key={i} className="bg-pink-50 text-primary text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2 border border-pink-100 shadow-sm animate-in zoom-in duration-200">
                         {s} <X className="w-4 h-4 cursor-pointer hover:rotate-90 transition-transform" onClick={() => setTempVariants({...tempVariants, sizes: tempVariants.sizes.filter((_, idx) => idx !== i)})} />
                       </span>
                     ))}
                     {tempVariants.sizes.length === 0 && (
                       <p className="text-sm text-gray-400 font-medium italic">No sizes added yet...</p>
                     )}
                   </div>
                 </div>
               )}
 
               {variantTab === 'colors' && (
                 <div className="space-y-6">
                   <div className="flex gap-3">
                     <input 
                       type="text" 
                       className="flex-1 border-2 border-gray-100 p-3 rounded-2xl text-sm outline-none focus:border-blue-500 transition-colors font-bold" 
                       placeholder="Enter color name (e.g. Red, Matte Black)"
                       value={currentColor}
                       onChange={e => setCurrentColor(e.target.value)}
                       onKeyDown={e => {
                         if (e.key === 'Enter') {
                           e.preventDefault();
                           if (currentColor.trim()) {
                             setTempVariants({...tempVariants, colors: [...tempVariants.colors, currentColor.trim()]});
                             setCurrentColor('');
                           }
                         }
                       }}
                     />
                     <button onClick={() => {
                       if (currentColor.trim()) {
                         setTempVariants({...tempVariants, colors: [...tempVariants.colors, currentColor.trim()]});
                         setCurrentColor('');
                       }
                     }} className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                       <Plus className="w-6 h-6" />
                     </button>
                   </div>
                   <div className="flex flex-wrap gap-3">
                     {tempVariants.colors.map((c, i) => (
                       <span key={i} className="bg-blue-50 text-blue-600 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-100 shadow-sm animate-in zoom-in duration-200">
                         {c} <X className="w-4 h-4 cursor-pointer hover:rotate-90 transition-transform" onClick={() => setTempVariants({...tempVariants, colors: tempVariants.colors.filter((_, idx) => idx !== i)})} />
                       </span>
                     ))}
                     {tempVariants.colors.length === 0 && (
                       <p className="text-sm text-gray-400 font-medium italic">No colors added yet...</p>
                     )}
                   </div>
                 </div>
               )}
 
               {variantTab === 'custom' && (
                 <div className="space-y-8">
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Feature Title</label>
                     <input 
                       type="text" 
                       className="w-full border-2 border-gray-100 p-3 rounded-2xl text-sm outline-none focus:border-amber-500 transition-colors font-bold" 
                       placeholder="e.g. Material, Print Type, Version"
                       value={tempVariants.custom.title}
                       onChange={e => setTempVariants({...tempVariants, custom: {...tempVariants.custom, title: e.target.value}})}
                     />
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Options</label>
                     <div className="flex gap-3">
                       <input 
                         type="text" 
                         className="flex-1 border-2 border-gray-100 p-3 rounded-2xl text-sm outline-none focus:border-amber-500 transition-colors font-bold" 
                         placeholder="Option name..."
                         value={currentCustomOption}
                         onChange={e => setCurrentCustomOption(e.target.value)}
                         onKeyDown={e => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             if (currentCustomOption.trim()) {
                               setTempVariants({...tempVariants, custom: {...tempVariants.custom, options: [...tempVariants.custom.options, currentCustomOption.trim()]}});
                               setCurrentCustomOption('');
                             }
                           }
                         }}
                       />
                       <button onClick={() => {
                         if (currentCustomOption.trim()) {
                           setTempVariants({...tempVariants, custom: {...tempVariants.custom, options: [...tempVariants.custom.options, currentCustomOption.trim()]}});
                           setCurrentCustomOption('');
                         }
                       }} className="bg-amber-500 text-white p-3 rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 active:scale-95">
                         <Plus className="w-6 h-6" />
                       </button>
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-3">
                     {tempVariants.custom.options.map((o, i) => (
                       <span key={i} className="bg-amber-50 text-amber-600 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2 border border-amber-100 shadow-sm animate-in zoom-in duration-200">
                         {o} <X className="w-4 h-4 cursor-pointer hover:rotate-90 transition-transform" onClick={() => setTempVariants({...tempVariants, custom: {...tempVariants.custom, options: tempVariants.custom.options.filter((_, idx) => idx !== i)}})} />
                       </span>
                     ))}
                   </div>
                 </div>
               )}
             </div>
 
             {/* Modal Footer */}
             <div className="bg-gray-50 p-8 border-t flex gap-4">
               <button onClick={() => setIsVariantModalOpen(false)} className="flex-1 py-4 text-gray-500 font-black uppercase text-xs hover:bg-gray-200 rounded-2xl transition-colors">
                 Cancel
               </button>
               <button 
                 onClick={() => {
                   setFormData({...formData, variants: tempVariants});
                   setIsVariantModalOpen(false);
                 }}
                 className="flex-1 bg-gray-800 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                 <CheckCircle2 className="w-4 h-4" /> Save Add-ons
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default AdminDashboard;
