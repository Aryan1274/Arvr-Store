import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { useCoupons } from '../context/CouponContext';
import { Timer, Zap, Gift, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SubscribeModal from '../components/SubscribeModal';

const FlashTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    if (!endTime) return;

    const calculateTime = () => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end - now;

      if (diff <= 0) return { h: '00', m: '00', s: '00' };

      const h = Math.floor((diff / (1000 * 60 * 60)));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      return {
        h: h.toString().padStart(2, '0'),
        m: m.toString().padStart(2, '0'),
        s: s.toString().padStart(2, '0')
      };
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex items-center gap-4 bg-white/10 p-5 rounded-[2rem] border border-white/20 backdrop-blur-xl">
      <div className="bg-amber-500 p-2.5 rounded-2xl shadow-lg shadow-amber-500/30">
        <Timer className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1">Hurry Up! Ending Soon</p>
        <p className="text-3xl font-black font-mono tracking-wider">{timeLeft.h} : {timeLeft.m} : {timeLeft.s}</p>
      </div>
    </div>
  );
};

const CollectionDetail = () => {
  const { id, cardIndex } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getProductDiscount } = useCoupons();
  const { user } = useAuth();
  
  // State for fetching products for price-based cards
  const [allFetchedProducts, setAllFetchedProducts] = useState(null);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (user) {
      setIsSubscribing(true);
      try {
        await api.post('/api/newsletter/subscribe', { email: user.email, userId: user._id || user.id });
        alert('Successfully subscribed to newsletter!');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to subscribe.');
      } finally {
        setIsSubscribing(false);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/collections/${id}`);
        const colData = res.data;
        setCollection(colData);
        
        // If it's a price-based card, fetch and filter products
        if (cardIndex !== undefined && colData.cards?.[cardIndex]) {
          const activeCard = colData.cards[cardIndex];
          if (activeCard.cardType === 'price') {
            setFetchingProducts(true);
            const prodRes = await api.get('/api/products');
            const allProducts = prodRes.data || [];
            setAllFetchedProducts(allProducts);
            setFetchingProducts(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch collection:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id, cardIndex]);

  if (loading || fetchingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="mt-4 text-gray-500 font-bold animate-pulse">Loading Collection...</div>
        </div>
      </div>
    );
  }

  if (!collection || (cardIndex !== undefined && !collection.cards?.[cardIndex])) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white p-10 rounded-[3rem] shadow-xl max-w-md w-full border-2 border-gray-100">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Collection Not Found</h2>
          <p className="text-gray-500 font-medium mb-4">The collection you are looking for doesn't exist or has been moved.</p>
          
          <div className="bg-gray-50 p-4 rounded-2xl mb-8 text-[10px] text-gray-400 font-mono text-left break-all border border-gray-100">
            <p className="font-bold text-gray-500 mb-1 uppercase tracking-widest">Debug Info:</p>
            <p>Target ID: {id}</p>
            <p>Error: {error || 'No error message'}</p>
            <p>Time: {new Date().toLocaleTimeString()}</p>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isOffer = collection.template === 'offer';
  const isDeal = collection.template === 'deal';
  const isCardDetail = cardIndex !== undefined && collection.cards?.[cardIndex];
  
  // Determine which products to show
  let displayProducts = collection.products || [];
  let displayTitle = collection.title || collection.name;
  let displayDesc = isOffer ? 'Premium handpicked items with exclusive discounts only for today.' : isDeal ? 'Grab these mega deals before the time runs out. Highest discounts ever!' : 'Browse through our curated selection of high-quality products.';
  let isSpecialUI = isOffer || isDeal;
  
  if (isCardDetail) {
    const activeCard = collection.cards[cardIndex];
    if (activeCard.cardType === 'price' && allFetchedProducts) {
      displayProducts = allFetchedProducts.filter(p => {
        let finalPrice = p.price;
        const discount = getProductDiscount(p._id);
        if (discount) {
          if (discount.discountType === 'Percentage') {
            finalPrice = p.price - (p.price * discount.discountValue / 100);
          } else {
            finalPrice = Math.max(0, p.price - discount.discountValue);
          }
        }
        return finalPrice <= activeCard.priceLimit;
      });
    } else {
      displayProducts = activeCard.products || [];
    }
    displayTitle = activeCard.text;
    displayDesc = activeCard.cardType === 'price' ? `Explore our premium picks under ₹${activeCard.priceLimit}.` : 'Specially curated custom collection just for you.';
    // Cards get a premium gold UI by default
    isSpecialUI = true;
  }

  return (
    <div className={`min-h-screen transition-all duration-700 ${isCardDetail ? 'bg-gradient-to-b from-amber-50 to-white' : isOffer ? 'bg-gradient-to-b from-rose-50 to-white' : isDeal ? 'bg-[#0a0c10]' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className={`pt-10 pb-20 px-4 ${isCardDetail ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-2xl shadow-amber-200 rounded-b-[4rem]' : isOffer ? 'bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-700 text-white shadow-2xl shadow-pink-200 rounded-b-[4rem]' : isDeal ? 'bg-gradient-to-b from-gray-900 to-transparent text-white' : 'bg-white border-b border-gray-100'}`}>
        <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 mb-10 font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-full transition-all ${isSpecialUI ? 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            <ChevronLeft className="w-4 h-4" /> Back to Store
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                {isOffer && <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/30 animate-pulse"><Gift className="w-5 h-5 text-white" /></div>}
                {isDeal && <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/20 animate-bounce"><Zap className="w-5 h-5 text-white" /></div>}
                {isCardDetail && <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/30"><Zap className="w-5 h-5 text-white" /></div>}
                {(isSpecialUI) && (
                  <span className={`text-xs font-black uppercase tracking-[0.3em] ${isOffer ? 'text-rose-100' : isDeal ? 'text-amber-400' : 'text-amber-100'}`}>
                    {isOffer ? 'Limited Time Exclusive' : isDeal ? 'Live Flash Deal' : 'Special Collection'}
                  </span>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-[0.9]">
                {displayTitle}
              </h1>
              <p className={`text-lg font-medium max-w-lg ${isOffer ? 'text-rose-100/90' : isDeal ? 'text-gray-400' : isCardDetail ? 'text-amber-100/90' : 'text-gray-500'}`}>
                {displayDesc}
              </p>
            </div>

            {isDeal && <FlashTimer endTime={collection.flashDealEnd} />}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 py-16">
        <div className="flex items-center justify-between mb-10">
          <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${isDeal ? 'text-gray-500' : 'text-gray-400'}`}>
            Showing {displayProducts.length} Products
          </h3>
          <div className="h-px flex-grow mx-6 bg-gray-200 opacity-30"></div>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8">
            {displayProducts.map((product) => (
              <div 
                key={product._id} 
                className={`transition-all duration-500 hover:-translate-y-2 ${isSpecialUI ? 'bg-white/5 p-2 rounded-[2.5rem] border border-white/10 hover:border-white/30' : ''}`}
              >
                <ProductCard 
                  product={product} 
                  discount={getProductDiscount(product._id)} 
                  dark={isDeal} // Only dark for deal template, card template uses light background for products
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] shadow-xl border-2 border-gray-50">
            <p className="text-gray-400 font-bold text-xl">No products found for this section.</p>
          </div>
        )}
      </div>

      {/* Footer CTA (Optional) */}
      <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 pb-20">
        <div className={`p-10 md:p-16 rounded-[4rem] text-center ${isCardDetail ? 'bg-amber-50 border-2 border-amber-100' : isOffer ? 'bg-rose-50 border-2 border-rose-100' : isDeal ? 'bg-gray-900 border border-white/5' : 'bg-gray-100'}`}>
          <h2 className={`text-2xl md:text-3xl font-black mb-4 ${isDeal ? 'text-white' : 'text-gray-900'}`}>
            Stay Updated on New Arrivals
          </h2>
          <p className={`mb-8 font-medium ${isDeal ? 'text-gray-500' : 'text-gray-500'}`}>
            Join our community to get early access to special offers and deals.
          </p>
          <button 
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 mx-auto ${isCardDetail ? 'bg-amber-500 text-white shadow-xl shadow-amber-200 hover:scale-105' : isOffer ? 'bg-rose-600 text-white shadow-xl shadow-rose-200 hover:scale-105' : isDeal ? 'bg-white text-black hover:scale-105' : 'bg-gray-900 text-white hover:scale-105'} disabled:opacity-70`}
          >
            {isSubscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe Now'}
          </button>
        </div>
      </div>
      
      <SubscribeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );

};

export default CollectionDetail;
