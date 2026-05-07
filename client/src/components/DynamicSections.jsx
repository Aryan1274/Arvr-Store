import React, { useState, useEffect } from 'react';
import api from '../api';
import ProductCard from './ProductCard';
import { useCoupons } from '../context/CouponContext';
import { Timer, Zap, Gift, ChevronRight } from 'lucide-react';

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
    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
      <Timer className="w-5 h-5 text-amber-400" />
      <div>
        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Ending Soon</p>
        <p className="text-xl font-black font-mono">{timeLeft.h} : {timeLeft.m} : {timeLeft.s}</p>
      </div>
    </div>
  );
};

const DynamicSections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getProductDiscount } = useCoupons();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get('/api/collections');
        // Only show active collections that have at least one product
        // and sort by order
        const sorted = res.data
          .filter(c => c.isActive && c.products.length > 0)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setCollections(sorted);
      } catch (err) {
        console.error('Failed to fetch collections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-16 mb-24">
      {collections.map((collection) => {
        const isOffer = collection.template === 'offer';
        const isDeal = collection.template === 'deal';
        
        return (
          <div key={collection._id} className={`py-12 ${isOffer ? 'bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-700 rounded-[3rem] shadow-xl shadow-pink-200/50 mx-4 text-white' : isDeal ? 'bg-gray-900 rounded-[3rem] shadow-2xl mx-4 text-white' : 'container mx-auto px-4'}`}>
            <div className={`container mx-auto px-6`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isOffer && <div className="bg-white/20 backdrop-blur-sm text-white p-1.5 rounded-lg animate-pulse border border-white/30"><Gift className="w-4 h-4" /></div>}
                    {isDeal && <div className="bg-amber-500 text-white p-1.5 rounded-lg animate-bounce"><Zap className="w-4 h-4" /></div>}
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDeal ? 'text-amber-400' : isOffer ? 'text-rose-100' : 'text-primary'}`}>
                      {isOffer ? 'Limited Time Offer' : isDeal ? 'Flash Deal' : 'Featured Collection'}
                    </span>
                  </div>
                  <h2 className={`text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 ${isDeal || isOffer ? 'text-white' : 'text-gray-900'}`}>
                    {collection.title || collection.name}
                    {!isOffer && !isDeal && <span className="text-primary">.</span>}
                  </h2>
                  <p className={`text-sm mt-2 font-medium ${isDeal ? 'text-gray-400' : isOffer ? 'text-rose-100/80' : 'text-gray-500'}`}>
                    Exclusive discounts handpicked just for you.
                  </p>
                </div>
                
                {isDeal && <FlashTimer endTime={collection.flashDealEnd} />}
                
                {(isOffer || !isDeal) && (
                  <button 
                    onClick={() => window.location.href = `/collection/${collection._id}`}
                    className={`flex items-center gap-2 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl transition-all ${isOffer ? 'bg-white text-rose-600 shadow-xl shadow-rose-900/20 hover:scale-105' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    Explore All <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {collection.products.slice(0, 5).map((product) => (
                  <div key={product._id} className={isDeal || isOffer ? 'bg-white/10 p-2 rounded-3xl border border-white/10 hover:border-white/30 transition-all' : ''}>
                    <ProductCard product={product} discount={getProductDiscount(product._id)} dark={isDeal || isOffer} />
                  </div>
                ))}
              </div>

              {isDeal && (
                <div className="mt-10 text-center border-t border-white/10 pt-8">
                  <button 
                    onClick={() => window.location.href = `/collection/${collection._id}`}
                    className="inline-flex items-center gap-3 bg-amber-500 text-black font-black text-sm uppercase tracking-widest px-10 py-4 rounded-full hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95"
                  >
                    View All Flash Deals <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DynamicSections;
