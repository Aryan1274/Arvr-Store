import React, { useState, useEffect } from 'react';

const images = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800&h=400',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800&h=400',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800&h=400'
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // 3 seconds total per slide, satisfying the loop auto-scroll requirement
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[250px] md:h-[400px] overflow-hidden bg-gray-100 my-4">
      {images.map((img, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={img} alt={`Slide ${index}`} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <div 
            key={index} 
            className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
