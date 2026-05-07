import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, discount, dark = false }) => {
  const productId = product._id || product.id;
  const productImage = product.images?.[0] || product.image;
  
  let finalPrice = product.price;
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
    <Link 
      to={`/product/${productId}`} 
      className={`${dark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:shadow-md'} rounded-xl shadow-sm transition-all overflow-hidden group block border ${dark ? 'border-white/5' : 'border-transparent'}`}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 z-20 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-widest">
            SALE
          </div>
        )}
        {/* Tag Badges */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-2 pointer-events-none">
          {product.tags?.map(tag => {
            // Handle both populated objects and IDs
            if (typeof tag !== 'object' || tag.isSuspended) return null;
            return (
              <div key={tag._id} className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 p-1.5 animate-in zoom-in duration-300">
                <img 
                  src={tag.image} 
                  alt={tag.name} 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            );
          })}
        </div>
        <img 
          src={productImage} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className={`text-sm font-semibold line-clamp-1 ${dark ? 'text-white' : 'text-gray-800'}`}>{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          {hasDiscount ? (
            <>
              <p className={`${dark ? 'text-amber-400' : 'text-green-600'} font-black text-lg`}>{formatPrice(finalPrice)}</p>
              <p className="text-gray-400 text-xs line-through font-bold">{formatPrice(product.price)}</p>
            </>
          ) : (
            <p className={`${dark ? 'text-amber-400' : 'text-primary'} font-bold`}>{formatPrice(product.price)}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
