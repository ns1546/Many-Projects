import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import worksData from '../data/works.json';
import directorData from '../data/director.json';

const ArchivePage: React.FC = () => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showAllBts, setShowAllBts] = useState<boolean>(false);

  // BTS stills from all works
  const allStills = worksData.flatMap(w =>
    (w.stills || []).map((url, i) => ({ url, project: w.title, year: w.year }))
  );

  // Add real BTS images from gallery
  const btsImages = [
    ...allStills,
    { url: '/gallery/photo-1.jpg', project: 'Bachelor Point S3', year: 2021 },
    { url: '/gallery/photo-2.jpg', project: 'Oshomoy Set', year: 2024 },
    { url: '/gallery/photo-3.jpg', project: 'Hotel Relax Rehearsal', year: 2023 },
    { url: '/gallery/photo-4.jpg', project: 'Female 3 Action', year: 2023 },
    { url: '/gallery/photo-5.jpg', project: 'Post Production', year: 2022 },
    { url: '/gallery/photo-6.jpg', project: 'Award Night', year: 2021 }
  ];

  const displayedBts = showAllBts ? btsImages : btsImages.slice(0, 7);

  // Rare frame stories using real images
  const rareFrames = [
    { url: '/gallery/bachelor point.jpg', story: 'The very first day of Bachelor Point shooting. Nobody knew it would become a national phenomenon. The cast was nervous, the crew was excited, and I had cold feet all morning.', year: '2018' },
    { url: '/gallery/osomoy.jpg', story: 'During the filming of Oshomoy — the moment when the lead actor delivered the pivotal scene. I didn\'t call cut for two minutes after it ended. Nobody moved. We all knew something extraordinary had just happened.', year: '2024' },
    { url: '/gallery/hotel relax.jpg', story: 'The night we wrapped Hotel Relax. The entire crew sat in silence for fifteen minutes after. No celebration. No noise. Just sitting with what we had made.', year: '2023' },
    { url: '/gallery/female.jpg', story: 'A candid moment from the Female set. I was trying to explain the character\'s internal state and gave up explaining — I just played them a song. They nailed the scene in one take.', year: '2021' },
    { url: '/gallery/ome.jpg', story: 'The first time I held a professional camera. I was 23 years old, working as a production assistant. I knew right then that this was the only thing I would ever want to do.', year: '2008' },
    { url: '/gallery/award.jpg', story: 'Winning my first major directing award. Late night session with the team right after. The best ideas came from that immense feeling of validation.', year: '2021' },
  ];

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[500] bg-black/96 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white text-3xl">✕</button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">Exclusive Access</p>
            <h1 className="text-6xl md:text-9xl font-heading text-white tracking-wider leading-none">The Vault</h1>
            <p className="text-white/40 max-w-xl text-lg mt-4">
              Unpublished photographs, behind-the-scenes moments, and rare memories from across a decade of filmmaking.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Link to="/script-to-screen" className="inline-block px-8 py-4 bg-red-600 text-white font-heading tracking-widest uppercase text-sm hover:bg-red-700 transition-colors text-center">
              The Process: Script to Screen
            </Link>
          </div>
        </div>
      </section>

      {/* Stories Behind the Frames */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-2">The Stories Behind the Frames</p>
            <h2 className="text-4xl md:text-5xl font-heading text-white tracking-wider mb-2">Hover to Reveal the Story</h2>
            <p className="text-white/30 text-sm">Every photograph has a story that never made it to the press release.</p>
          </div>
          <Link to="/stories-behind-frames" className="text-sm uppercase tracking-widest text-white/40 hover:text-red-600 transition-colors border-b border-white/20 hover:border-red-600 pb-1 self-start md:self-auto">
            View Expanded Stories →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {rareFrames.map((frame, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden cursor-pointer border border-white/5">
              <img src={frame.url} alt={`Rare Frame ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {/* Flip overlay */}
              <div className="absolute inset-0 bg-[#050505]/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-red-600/30 text-5xl font-heading mb-3">"</div>
                <p className="text-white/80 text-sm leading-relaxed italic">{frame.story}</p>
                <div className="mt-4 text-red-600 font-heading tracking-widest text-xs">{frame.year}</div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
                <p className="text-white/30 text-[10px] uppercase tracking-widest group-hover:opacity-0 transition-opacity">{frame.year} · Hover for Story</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BTS Masonry */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-2">Raw & Unedited</p>
          <h2 className="text-4xl md:text-5xl font-heading text-white tracking-wider">Behind the Scenes</h2>
        </div>
        {/* BTS Structured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBts.map((img, i) => (
            <div
              key={i}
              className="group relative overflow-hidden border border-white/5 hover:border-white/20 cursor-pointer transition-all duration-300 rounded-sm bg-[#0a0a0a]"
              onClick={() => setLightbox(img.url)}
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#111]">
                <img
                  src={img.url}
                  alt={img.project}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                  <div>
                    <p className="text-white/90 text-sm uppercase tracking-widest font-heading">{img.project}</p>
                    <p className="text-white/40 text-xs mt-0.5">{img.year}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {btsImages.length > 7 && !showAllBts && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowAllBts(true)}
              className="inline-block px-10 py-3 border border-white/20 text-white/70 font-heading tracking-widest uppercase text-sm hover:border-red-600 hover:text-red-600 transition-all"
            >
              View Full Archive
            </button>
          </div>
        )}
      </section>

      {/* Upcoming Projects */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="mb-12">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-2">Future Works</p>
          <h2 className="text-4xl md:text-5xl font-heading text-white tracking-wider">Upcoming Projects</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {directorData.futurePlans.map((plan, i) => (
            <div key={i} className="group relative border border-white/5 bg-[#080808] overflow-hidden hover:border-white/20 transition-all flex flex-col h-full rounded-sm">
              <div className="aspect-video w-full bg-[#111] relative overflow-hidden shrink-0">
                <img 
                  src={`/gallery/photo-${(i % 6) + 1}.jpg`} 
                  alt={plan.title} 
                  className="w-full h-full object-cover object-center opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1">
                    Upcoming Project
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-red-500 font-heading text-[10px] tracking-[0.3em] uppercase mb-1">
                    {plan.type} · {plan.year}
                  </p>
                  <h3 className="text-xl md:text-2xl font-heading text-white tracking-wider mb-3 leading-snug">
                    {plan.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">
                    {plan.description}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap pt-3 border-t border-white/5 mt-auto">
                  {plan.genre.map(g => (
                    <span key={g} className="text-white/30 text-[10px] uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-sm">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArchivePage;
