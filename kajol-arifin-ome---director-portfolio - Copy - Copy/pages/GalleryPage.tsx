import React, { useState } from 'react';
import worksData from '../data/works.json';

// Collect all stills from works
const allStills = worksData.flatMap(w =>
  (w.stills || []).map(url => ({ url, project: w.title, slug: w.slug }))
);

// Generate placeholder gallery images
const galleryImages = [
  ...allStills,
  ...Array.from({ length: 20 - allStills.length }, (_, i) => ({
    url: `https://placehold.co/${i % 2 === 0 ? '1200x800' : '800x1000'}/111111/ffffff?text=Gallery+${i + 1}`,
    project: 'Behind the Scenes',
    slug: null,
  })),
];

const GalleryPage: React.FC = () => {
  const [lightbox, setLightbox] = useState<typeof galleryImages[0] | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const projects = ['all', ...Array.from(new Set(galleryImages.map(g => g.project)))];
  const filtered = filter === 'all' ? galleryImages : galleryImages.filter(g => g.project === filter);

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[500] bg-black/96 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white text-3xl">✕</button>
          <div className="max-w-6xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.project} className="max-w-full max-h-[85vh] object-contain mx-auto" />
            <p className="text-center text-white/40 text-xs uppercase tracking-widest mt-4">{lightbox.project}</p>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">The Visual Archive</p>
          <h1 className="text-6xl md:text-9xl font-heading text-white tracking-wider leading-none">Photo Gallery</h1>
          <p className="text-white/40 max-w-xl text-lg mt-4">
            Stills, behind-the-scenes moments, and rare photographs from across Kajal Arefin Ome's career.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[70px] z-[100] bg-[#050505]/95 backdrop-blur-md border-b border-white/5 px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
          {projects.map(p => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all ${filter === p ? 'bg-red-600 text-white' : 'border border-white/15 text-white/50 hover:border-white/40 hover:text-white'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Structured photo gallery with uniform aspect-ratio and row/column alignment */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((img, i) => (
            <div
              key={i}
              className="group relative overflow-hidden border border-white/5 hover:border-white/20 cursor-pointer transition-all duration-300 rounded-sm bg-[#0a0a0a]"
              onClick={() => setLightbox(img)}
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#111]">
                <img
                  src={img.url}
                  alt={img.project}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#050505]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-white/50 bg-black/40 backdrop-blur-sm flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-white text-sm">↗</span>
                  </div>
                  <p className="text-white/80 text-xs uppercase tracking-widest font-heading">{img.project}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
