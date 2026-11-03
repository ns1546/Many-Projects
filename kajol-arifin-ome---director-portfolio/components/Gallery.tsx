
import React from 'react';
import SectionWrapper from './SectionWrapper';

const GALLERY_IMAGES = [
  'https://picsum.photos/seed/set1/800/800',
  'https://picsum.photos/seed/set2/800/800',
  'https://picsum.photos/seed/set3/800/800',
  'https://picsum.photos/seed/set4/800/800',
  'https://picsum.photos/seed/set5/800/800',
  'https://picsum.photos/seed/set6/800/800',
];

const Gallery: React.FC = () => {
  return (
    <SectionWrapper id="gallery" className="bg-[#050505]">
      <div className="mb-20 text-center">
        <h2 className="text-5xl md:text-7xl font-heading mb-4 text-white animate-left">The Frame</h2>
        <p className="text-red-600 tracking-[0.5em] uppercase text-xs animate-right">Behind the Scenes & Still Captures</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {GALLERY_IMAGES.map((src, i) => (
          <div 
            key={i} 
            className={`relative aspect-square overflow-hidden group animate-${i % 2 === 0 ? 'left' : 'right'}`}
          >
            <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/40 transition-all duration-500 z-10"></div>
            <img 
              src={src} 
              alt={`Gallery ${i}`} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
            />
            <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <span className="text-white font-heading text-lg tracking-widest uppercase">Shot #{i + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default Gallery;
