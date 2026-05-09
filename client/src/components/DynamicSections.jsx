import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from './ProductCard';
import { useCoupons } from '../context/CouponContext';
import { Timer, Zap, Gift, ChevronRight, Layout } from 'lucide-react';

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get('/api/collections');
        // Only show active collections that have at least one product
        // and sort by order
        const sorted = res.data
          .filter(c => c.isActive && (c.products?.length > 0 || c.template === 'card'))
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
    <div className="space-y-10 lg:space-y-16 mb-24 lg:mb-32">
      {collections.map((collection) => {
        const isOffer = collection.template === 'offer';
        const isDeal = collection.template === 'deal';
        const isCard = collection.template === 'card';
        
        return (
          <div key={collection._id} className={`${isOffer || isDeal ? 'py-12 lg:py-20 xl:py-24' : isCard ? 'py-10 lg:py-16' : 'py-4'} ${isOffer ? 'bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-700 rounded-[3rem] lg:rounded-[4rem] shadow-xl shadow-pink-200/50 text-white' : isDeal ? 'bg-gray-900 rounded-[3rem] lg:rounded-[4rem] shadow-2xl text-white' : isCard ? 'bg-white rounded-[3rem] lg:rounded-[4rem] shadow-sm border border-gray-100' : 'w-full'}`}>
            <div className="w-full px-3 lg:px-5 xl:px-8 2xl:px-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 lg:mb-12 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isOffer && <div className="bg-white/20 backdrop-blur-sm text-white p-1.5 lg:p-2 rounded-lg animate-pulse border border-white/30"><Gift className="w-4 h-4 lg:w-5 lg:h-5" /></div>}
                    {isDeal && <div className="bg-amber-500 text-white p-1.5 lg:p-2 rounded-lg animate-bounce"><Zap className="w-4 h-4 lg:w-5 lg:h-5" /></div>}
                    {isCard && <div className="bg-amber-100 text-amber-600 p-1.5 lg:p-2 rounded-lg"><Layout className="w-4 h-4 lg:w-5 lg:h-5" /></div>}
                    {(isOffer || isDeal || isCard) && (
                      <span className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] ${isDeal ? 'text-amber-400' : isOffer ? 'text-rose-100' : isCard ? 'text-amber-600' : 'text-primary'}`}>
                        {isOffer ? 'Limited Time Offer' : isDeal ? 'Flash Deal' : 'Special Picks'}
                      </span>
                    )}
                  </div>
                  <h2 className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight flex items-center gap-3 ${isDeal || isOffer ? 'text-white' : 'text-gray-900'}`}>
                    {collection.title || collection.name}
                  </h2>
                  <p className={`text-sm lg:text-base xl:text-lg mt-2 lg:mt-4 font-medium ${isDeal ? 'text-gray-400' : isOffer ? 'text-rose-100/80' : 'text-gray-500'}`}>
                    {isCard ? 'Premium deals curated specifically for your budget.' : 'Exclusive discounts handpicked just for you.'}
                  </p>
                </div>
                
                {isDeal && <FlashTimer endTime={collection.flashDealEnd} />}
                
                {(!isDeal && !isCard) && (
                  <button 
                    onClick={() => navigate(`/collection/${collection._id}`)}
                    className={`flex items-center gap-2 font-black text-xs lg:text-sm uppercase tracking-widest px-6 lg:px-8 py-3 lg:py-4 rounded-2xl transition-all ${isOffer ? 'bg-white text-rose-600 shadow-xl shadow-rose-900/20 hover:scale-105' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    Explore All <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                )}
              </div>

              {isCard ? (
                /* CARD GRID */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 lg:gap-6">
                  {collection.cards?.map((card, cIdx) => (
                    <div 
                      key={cIdx}
                      onClick={() => navigate(`/collection/${collection._id}/card/${cIdx}`)}
                      className="relative aspect-[3/4.5] rounded-2xl overflow-hidden group cursor-pointer shadow-sm border border-gray-100 transition-all hover:shadow-lg active:scale-95"
                    >
                      {/* Background: Image or Golden Gradient */}
                      {card.image ? (
                        <img src={card.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center">
                          <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                          <Zap className="w-10 h-10 md:w-12 md:h-12 text-white/20" />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 lg:p-5">
                        <p className="text-[7px] md:text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1 opacity-80 line-clamp-1">
                          {card.cardType === 'price' ? `Budget Under ₹${card.priceLimit}` : 'Special Collection'}
                        </p>
                        <h4 className="text-base md:text-lg lg:text-xl font-black text-white leading-tight mb-2 line-clamp-2">
                          {card.text}
                        </h4>
                        
                        {/* Hover Explore Button */}
                        <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-white text-black font-black text-[7px] md:text-[9px] uppercase tracking-[0.2em] py-2 rounded-lg flex items-center justify-center gap-1 shadow-2xl">
                            Explore <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* DEFAULT GRID */
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6 xl:gap-8 2xl:gap-10">
                  {collection.products.slice(0, 7).map((product, pIdx) => (
                    <div 
                      key={product._id} 
                      className={`${isDeal || isOffer ? 'bg-white/10 p-2 rounded-3xl border border-white/10 hover:border-white/30 transition-all' : ''} ${pIdx === 6 ? 'hidden 2xl:block' : pIdx === 5 ? 'hidden xl:block' : pIdx === 4 ? 'hidden lg:block' : ''}`}
                    >
                      <ProductCard product={product} discount={getProductDiscount(product._id)} dark={isDeal || isOffer} />
                    </div>
                  ))}
                </div>
              )}

              {isDeal && (
                <div className="mt-10 lg:mt-14 text-center border-t border-white/10 pt-8 lg:pt-10">
                  <button 
                    onClick={() => navigate(`/collection/${collection._id}`)}
                    className="inline-flex items-center gap-3 bg-amber-500 text-black font-black text-sm lg:text-base uppercase tracking-widest px-10 lg:px-14 py-4 lg:py-5 rounded-full hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95"
                  >
                    View All Flash Deals <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
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
