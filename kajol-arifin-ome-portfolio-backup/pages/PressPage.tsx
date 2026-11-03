import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import directorData from '../data/director.json';

export const pressPhotos = [
  { id: 1, src: '/images/press/press_1.jpeg', alt: 'Press Highlight 1', title: 'Newspaper Feature', details: 'Exclusive interview featured in the daily newspaper discussing recent projects.' },
  { id: 2, src: '/images/press/press_2.jpeg', alt: 'Press Highlight 2', title: 'Magazine Cover', details: 'Cover story highlighting the director\'s journey and upcoming blockbuster releases.' }
];

const PressPage: React.FC = () => {
  const { press } = directorData;

  useEffect(() => {
    document.title = 'Press | Kajal Arefin Ome';
  }, []);

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">Media Coverage</p>
          <h1 className="text-6xl md:text-9xl font-heading text-white tracking-wider leading-none">Press & Media</h1>
          <p className="text-white/40 max-w-xl text-lg mt-4">
            A record of media coverage and news spanning a decade of extraordinary work.
          </p>
        </div>
      </section>


      {/* Featured Press Photos */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <div className="mb-12 text-center">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-2">In The News</p>
          <h2 className="text-4xl font-heading text-white tracking-wider">Featured Press Highlights</h2>
          <p className="text-white/40 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
            Exclusive newspaper features, magazine spreads, and highlighted media moments covering Kajal Arefin Ome's recent projects and achievements.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {pressPhotos.map((photo) => (
            <Link key={photo.id} to={`/press/photo/${photo.id}`} className="group relative bg-[#0a0a0a] border border-white/5 overflow-hidden rounded-sm hover:border-red-600/30 transition-colors duration-500 block">
              <img 
                src={photo.src} 
                alt={photo.alt} 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                <h3 className="text-white font-heading text-xl tracking-wider mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{photo.title}</h3>
                <p className="text-white/60 text-sm line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{photo.details}</p>
                <div className="mt-4 text-red-500 text-xs uppercase tracking-widest font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">View Full Story</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Press */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-2">Media Coverage</p>
          <h2 className="text-4xl font-heading text-white tracking-wider">Selected Press</h2>
        </div>
        <div className="space-y-4">
          {press.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="group block bg-[#0a0a0a] border border-white/5 hover:border-white/20 p-6 md:p-8 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                {/* Thumbnail */}
                {article.thumbnail && (
                  <div className="shrink-0 w-full md:w-48 aspect-video overflow-hidden border border-white/10">
                    <img src={article.thumbnail} alt={article.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-red-600 text-[10px] uppercase tracking-widest font-heading">{article.publication}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/30 text-[10px]">{article.date}</span>
                    <span className="px-2 py-0.5 bg-white/5 text-white/25 text-[9px] uppercase tracking-widest">{article.type}</span>
                  </div>
                  <h3 className="text-white text-xl md:text-2xl font-display group-hover:text-red-400 transition-colors mb-3 leading-tight">{article.headline}</h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">{article.excerpt}</p>
                  
                  <div className="flex items-center gap-2 text-red-600 text-xs font-heading tracking-widest uppercase">
                    <span>Read Original Article</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <style>{`.font-display { font-family: 'Playfair Display', serif; }`}</style>
    </div>
  );
};

export default PressPage;
