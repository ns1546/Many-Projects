import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import worksData from '../data/works.json';

const WorksPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo('.works-hero-title', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 });
    gsap.utils.toArray<HTMLElement>('.work-card').forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
        delay: i * 0.04,
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });
    return () => { ScrollTrigger.getAll().forEach(st => { if (st.trigger && !document.contains(st.trigger)) st.kill(); }); };
  }, [activeFilter, showAll]);

  const categories = [
    { key: 'all', label: 'All Works' },
    { key: 'web-series', label: 'Web Series' },
    { key: 'single-drama', label: 'Single Drama' },
    { key: 'telefilm', label: 'Telefilm' },
    { key: 'short-film', label: 'Short Film' },
  ];

  const filtered = activeFilter === 'all' ? worksData : worksData.filter(w => w.category === activeFilter);
  const displayedWorks = showAll ? filtered : filtered.slice(0, 7);

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* ── Page Hero ── */}
      <section className="relative pt-40 pb-20 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">Complete Archive</p>
          <h1 className="works-hero-title text-6xl md:text-9xl font-heading text-white tracking-wider leading-none mb-6">
            Filmography
          </h1>
          <p className="text-white/40 max-w-xl text-lg">
            Every story. Every frame. Every world Kajal Arefin Ome has brought to life — from first short film to landmark web series.
          </p>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="sticky top-[70px] z-[100] bg-[#050505]/95 backdrop-blur-md border-b border-white/5 px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => { setActiveFilter(cat.key); setShowAll(false); }}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-all duration-300 ${activeFilter === cat.key ? 'bg-red-600 text-white' : 'border border-white/15 text-white/50 hover:border-white/40 hover:text-white'}`}
            >
              {cat.label}
              <span className="ml-2 opacity-50">
                ({cat.key === 'all' ? worksData.length : worksData.filter(w => w.category === cat.key).length})
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Works Grid ── */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Structured cinematic grid with uniform aspect-ratio and row alignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedWorks.map((work, i) => (
              <Link
                key={work.id}
                to={`/works/${work.slug}`}
                className="work-card group relative overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-1.5 flex flex-col h-full rounded-sm"
              >
                {/* Poster image with uniform cinematic 2:3 ratio */}
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#111] shrink-0">
                  <img
                    src={work.poster}
                    alt={work.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90 pointer-events-none" />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#050505]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="w-12 h-12 rounded-full border border-red-600 flex items-center justify-center mx-auto mb-2 bg-black/40 backdrop-blur-sm shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                        <span className="text-white text-base">→</span>
                      </div>
                      <p className="text-white/80 text-[10px] uppercase tracking-widest font-heading">View Project</p>
                    </div>
                  </div>
                </div>

                {/* Card details with equal-height flex spacing */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                      <span className="text-red-600 text-[10px] uppercase tracking-widest font-heading font-semibold">{work.type}</span>
                      <span className="w-2.5 h-[1px] bg-white/20" />
                      <span className="text-white/40 text-[10px] uppercase tracking-widest">{work.year}</span>
                      <span className="w-2.5 h-[1px] bg-white/20" />
                      <span className="text-white/40 text-[10px] uppercase tracking-widest">{work.platform}</span>
                    </div>
                    <h3 className="text-2xl font-display text-white mb-1 group-hover:text-red-400 transition-colors duration-300 leading-tight">
                      {work.title}
                    </h3>
                    {(work as any).banglaTitle && (
                      <p className="text-white/30 text-xs mb-3">{(work as any).banglaTitle}</p>
                    )}
                    <p className="text-white/45 text-xs leading-relaxed line-clamp-2 mt-2">
                      {work.synopsis}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {work.genre.slice(0, 3).map(g => (
                        <span key={g} className="px-2 py-0.5 bg-white/5 border border-white/5 text-white/35 text-[9px] uppercase tracking-wider rounded-sm">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Success stat anchored to card bottom for perfect row alignment */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-red-600 font-heading text-lg tracking-wide">{work.successStats.viewership}</span>
                    <span className="text-white/30 text-[9px] tracking-widest uppercase">{work.role}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="text-white/30 text-lg">No projects found in this category.</p>
            </div>
          )}

          {filtered.length > 7 && !showAll && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setShowAll(true)}
                className="inline-block px-10 py-3 border border-white/20 text-white/70 font-heading tracking-widest uppercase text-sm hover:border-red-600 hover:text-red-600 transition-all"
              >
                View Full Archive
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Table View ── */}
      <section className="py-16 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-heading text-white tracking-widest mb-8">Complete List View</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Year', 'Title', 'Type', 'Platform', 'Viewership', 'Role'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-white/30 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...worksData].sort((a, b) => (b.year as number) - (a.year as number)).map(work => (
                  <tr key={work.id} className="border-b border-white/5 hover:bg-white/3 group transition-colors">
                    <td className="py-4 px-4 text-white/30">{work.year}</td>
                    <td className="py-4 px-4">
                      <Link to={`/works/${work.slug}`} className="text-white group-hover:text-red-400 transition-colors font-medium">
                        {work.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-white/40">{work.type}</td>
                    <td className="py-4 px-4 text-white/40">{work.platform}</td>
                    <td className="py-4 px-4 text-red-600 font-heading">{work.successStats.viewership}</td>
                    <td className="py-4 px-4 text-white/40">{work.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <style>{`
        .font-display { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default WorksPage;
