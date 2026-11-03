import React, { useEffect } from 'react';
import directorData from '../data/director.json';

const FuturePage: React.FC = () => {
  const { futurePlans } = directorData;

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600/3 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">What Comes Next</p>
          <h1 className="text-6xl md:text-9xl font-heading text-white tracking-wider leading-none">The Next Chapter</h1>
          <p className="text-white/40 max-w-xl text-lg mt-4">
            A feature film. International collaborations. The final season. Kajal Arefin Ome is just getting started.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <div className="grid gap-8">
          {futurePlans.map((project, i) => (
            <div key={i} className="group relative bg-[#0a0a0a] border border-white/5 hover:border-red-600/30 transition-all duration-500 p-10 md:p-12 overflow-hidden">
              <div className="absolute top-0 right-0 text-[120px] font-heading text-white/2 leading-none select-none">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="relative flex flex-col md:flex-row md:items-start gap-8">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-heading ${project.status === 'In Production' ? 'bg-red-600 text-white' : project.status === 'Pre-Production' ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                      {project.status}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/30 text-xs uppercase tracking-widest">{project.type}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/30 text-xs">{project.year}</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-heading text-white tracking-wider mb-4 group-hover:text-red-400 transition-colors">{project.title}</h2>
                  <p className="text-white/60 text-lg leading-relaxed mb-6">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.genre.map(g => (
                      <span key={g} className="px-3 py-1 bg-white/5 text-white/40 text-xs uppercase tracking-widest">{g}</span>
                    ))}
                  </div>
                </div>
                <div className="md:w-64 shrink-0 bg-[#050505] border border-white/5 p-6">
                  <p className="text-white/25 text-[10px] uppercase tracking-widest mb-2">Ambition</p>
                  <p className="text-white/70 text-sm">{project.ambition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision quote */}
      <section className="py-32 px-6 md:px-12 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-6">The Vision</p>
          <blockquote className="text-4xl md:text-6xl font-display text-white leading-tight mb-8">
            "Bangladesh has extraordinary stories. We just haven't told them well enough yet."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <span className="h-[1px] w-12 bg-red-600/50" />
            <p className="text-red-600 text-xs uppercase tracking-widest font-heading">Kajal Arefin Ome</p>
            <span className="h-[1px] w-12 bg-red-600/50" />
          </div>
        </div>
      </section>

      <style>{`.font-display { font-family: 'Playfair Display', serif; }`}</style>
    </div>
  );
};

export default FuturePage;
