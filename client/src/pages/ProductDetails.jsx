import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useCoupons } from '../context/CouponContext';
import { Truck, RotateCcw, Headphones, CheckCircle2 } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const { getProductDiscount } = useCoupons();
  const [selectedOptions, setSelectedOptions] = useState({ size: '', color: '', custom: '' });

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
        setMainImage(res.data.images[0]);
        
        // Auto-select first options if available
        const variants = res.data.variants;
        if (variants) {
          setSelectedOptions({
            size: variants.sizes?.[0] || '',
            color: variants.colors?.[0] || '',
            custom: variants.custom?.options?.[0] || ''
          });
        }
        
        // Fetch similar products in same category
        const similarRes = await api.get(`/api/products?category=${res.data.category}`);
        setSimilarProducts(similarRes.data.filter(p => p._id !== res.data._id).slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (product) addToCart(product, selectedOptions);
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, selectedOptions);
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 min-h-[60vh]">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  const discount = product ? getProductDiscount(product._id) : null;
  let finalPrice = product?.price;
  let hasDiscount = false;

  if (discount && discount.type === 'Discount') {
    hasDiscount = true;
    if (discount.discountType === 'Percentage') {
      finalPrice = product.price * (1 - discount.discountValue / 100);
    } else {
      finalPrice = Math.max(0, product.price - discount.discountValue);
    }
  }

  const formatPrice = (p) => `₹${Math.round(p)}`;

  return (
    <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 py-8">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 xl:gap-24">
        {/* Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-2 overflow-x-auto md:w-24 hide-scrollbar">
            {product.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt="thumbnail" 
                className={`w-20 h-20 md:w-full object-cover cursor-pointer rounded-lg border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
          <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden aspect-square shadow-inner">
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col">
          <span className="text-primary font-semibold text-sm mb-2 px-3 py-1 bg-pink-50 rounded-full w-fit">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            {hasDiscount ? (
              <>
                <p className="text-3xl font-black text-green-600">{formatPrice(finalPrice)}</p>
                <p className="text-xl text-gray-400 line-through font-bold">{formatPrice(product.price)}</p>
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs font-black uppercase">Save {discount.discountType === 'Percentage' ? `${discount.discountValue}%` : `₹${discount.discountValue}`}</span>
              </>
            ) : (
              <p className="text-3xl font-black text-primary">{formatPrice(product.price)}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-6 text-gray-500 font-bold text-xs uppercase tracking-widest bg-gray-50 w-fit px-3 py-2 rounded-xl border border-gray-100">
            <Truck className="w-4 h-4 text-primary" />
            <span>Delivery: ₹{product.shippingCharges || 49}</span>
          </div>
          <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>

          {/* Variant Selectors */}
          {product.variants && (
            <div className="space-y-6 mb-10 border-t pt-6">
              {product.variants.sizes?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Select Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedOptions({ ...selectedOptions, size })}
                        className={`px-6 py-2 rounded-xl font-bold text-sm transition-all border-2 ${selectedOptions.size === size ? 'border-primary bg-primary text-white' : 'border-gray-100 text-gray-600 hover:border-primary/30'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.variants.colors?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Select Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedOptions({ ...selectedOptions, color })}
                        className={`px-6 py-2 rounded-xl font-bold text-sm transition-all border-2 ${selectedOptions.color === color ? 'border-primary bg-primary text-white' : 'border-gray-100 text-gray-600 hover:border-primary/30'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.variants.custom?.options?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{product.variants.custom.title || 'Choose Option'}</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.custom.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSelectedOptions({ ...selectedOptions, custom: opt })}
                        className={`px-6 py-2 rounded-xl font-bold text-sm transition-all border-2 ${selectedOptions.custom === opt ? 'border-primary bg-primary text-white' : 'border-gray-100 text-gray-600 hover:border-primary/30'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 mt-auto">
            <button onClick={handleAddToCart} className="flex-1 bg-white border-2 border-primary text-primary hover:bg-pink-50 font-bold py-4 px-6 rounded-2xl transition-colors shadow-sm">
              Add to Bag
            </button>
            <button onClick={handleBuyNow} className="flex-1 bg-primary hover:bg-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition-transform transform hover:scale-[1.02]">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Policies Section */}
      <div className="mt-12 md:mt-20 py-8 md:py-12 border-t border-b border-gray-100">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8">
          <div className="flex flex-col items-center text-center p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-white hover:shadow-xl hover:shadow-pink-50 transition-all duration-500 group border border-transparent hover:border-pink-100">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-pink-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-500">
              <RotateCcw className="w-5 h-5 md:w-8 md:h-8 text-primary" />
            </div>
            <h3 className="text-[8px] sm:text-xs md:text-lg font-black text-gray-900 mb-1 md:mb-2 uppercase tracking-tight line-clamp-1">{product.returnPolicy || "No Return"}</h3>
            <p className="text-[6px] sm:text-[8px] md:text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Policy</p>
          </div>

          <div className="flex flex-col items-center text-center p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-white hover:shadow-xl hover:shadow-pink-50 transition-all duration-500 group border border-transparent hover:border-pink-100">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-500">
              <Truck className="w-5 h-5 md:w-8 md:h-8 text-blue-500" />
            </div>
            <h3 className="text-[8px] sm:text-xs md:text-lg font-black text-gray-900 mb-1 md:mb-2 uppercase tracking-tight line-clamp-1">{product.deliveryTime || "Delivery under 10 days"}</h3>
            <p className="text-[6px] sm:text-[8px] md:text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Fast</p>
          </div>

          <div className="flex flex-col items-center text-center p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-white hover:shadow-xl hover:shadow-pink-50 transition-all duration-500 group border border-transparent hover:border-pink-100">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-green-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-500">
              <Headphones className="w-5 h-5 md:w-8 md:h-8 text-green-500" />
            </div>
            <h3 className="text-[8px] sm:text-xs md:text-lg font-black text-gray-900 mb-1 md:mb-2 uppercase tracking-tight line-clamp-1">24/7 Support</h3>
            <p className="text-[6px] sm:text-[8px] md:text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Service</p>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 lg:gap-6">
            {similarProducts.map(p => (
              <ProductCard key={p._id} product={p} discount={getProductDiscount(p._id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
