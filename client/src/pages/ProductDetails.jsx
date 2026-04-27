import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useCoupons } from '../context/CouponContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const { getProductDiscount } = useCoupons();

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
        setMainImage(res.data.images[0]);
        
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
    if (product) addToCart(product);
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product);
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
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
          <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>

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

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">You might also like</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
            {similarProducts.map(p => (
              <div key={p._id} className="min-w-[200px] max-w-[200px]">
                <ProductCard product={p} discount={getProductDiscount(p._id)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
