
import React from 'react';
import SectionWrapper from './SectionWrapper';

const FRAME_IMAGES = [
  { src: '/gallery/photo-1.jpg', label: 'Visual Work #1' },
  { src: '/gallery/photo-2.jpg', label: 'Visual Work #2' },
  { src: '/gallery/photo-3.jpg', label: 'Visual Work #3' },
  { src: '/gallery/photo-4.jpg', label: 'Visual Work #4' },
  { src: '/gallery/photo-5.jpg', label: 'Visual Work #5' },
  { src: '/gallery/photo-6.jpg', label: 'Visual Work #6' },
];

const WORK_IMAGES = [
  { src: '/gallery/bachelor point.jpg', label: 'Bachelor Point' },
  { src: '/gallery/osomoy.jpg',         label: 'Osomoy' },
  { src: '/gallery/female.jpg',         label: 'Female' },
  { src: '/gallery/hotel relax.jpg',    label: 'Hotel Relax' },
];

const Gallery: React.FC = () => {
  return (
    <SectionWrapper id="gallery" className="bg-[#050505]">

      {/* ─── "The Frame" header ─── */}
      <div className="mb-16 text-center">
        <h2 className="text-5xl md:text-7xl font-heading mb-4 text-white animate-left">The Frame</h2>
        <p className="text-red-600 tracking-[0.5em] uppercase text-xs animate-right">
          Visual Craft &amp; Cinematic Work Samples
        </p>
      </div>

      {/* ─── Structured Frame Grid — uniform aspect-square ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {FRAME_IMAGES.map((item, i) => (
          <div
            key={i}
            className={`relative overflow-hidden group rounded-sm border border-white/5 bg-[#0a0a0a] aspect-square animate-${i % 2 === 0 ? 'left' : 'right'}`}
          >
            <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/30 transition-all duration-500 z-10" />
            <img
              src={item.src}
              alt={item.label}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute bottom-3 left-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white font-heading text-xs tracking-widest uppercase bg-black/70 px-2 py-1 block text-center backdrop-blur-sm border border-white/10">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Featured Works strip ─── */}
      <div className="mt-24 mb-12 text-center">
        <h3 className="text-3xl md:text-5xl font-heading mb-4 text-white animate-left">Featured Works</h3>
        <p className="text-red-600 tracking-[0.5em] uppercase text-xs animate-right">
          Iconic Productions
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {WORK_IMAGES.map((item, i) => (
          <div
            key={i}
            className={`relative overflow-hidden group rounded-sm border border-white/5 bg-[#0a0a0a] aspect-[2/3] animate-${i % 2 === 0 ? 'left' : 'right'}`}
          >
            <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/30 transition-all duration-500 z-10" />
            <img
              src={item.src}
              alt={item.label}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute bottom-3 left-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white font-heading text-xs tracking-widest uppercase bg-black/70 px-2 py-1 block text-center backdrop-blur-sm border border-white/10">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>

    </SectionWrapper>
  );
};

export default Gallery;
