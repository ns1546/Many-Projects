import React, { useState, useEffect } from 'react';
import collaborators from '../data/collaborators.json';

const CollaboratorsPage: React.FC = () => {
  const [selected, setSelected] = useState<typeof collaborators[0] | null>(null);

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div className="relative bg-[#0a0a0a] border border-white/10 max-w-3xl w-full p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 text-white/40 hover:text-white text-2xl" onClick={() => setSelected(null)}>✕</button>
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <img src={selected.photo} alt={selected.name} className="w-32 h-32 rounded object-cover grayscale border border-white/10" />
              <div>
                <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-xs mb-2">{selected.role}</p>
                <h3 className="text-4xl font-heading text-white tracking-wider mb-3">{selected.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.projects.map(p => (
                    <span key={p} className="px-3 py-1 bg-white/5 text-white/50 text-xs uppercase tracking-widest border border-white/10">{p}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-white/60 leading-relaxed mb-8">{selected.description}</p>
            <div className="bg-[#050505] border-l-4 border-red-600 p-6">
              <p className="text-white/25 text-[10px] uppercase tracking-widest mb-2">Ome's Memory</p>
              <p className="text-white/70 italic">"{selected.directorMemory}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">The People Behind the Stories</p>
          <h1 className="text-6xl md:text-9xl font-heading text-white tracking-wider leading-none">Collaborators</h1>
          <p className="text-white/40 max-w-xl text-lg mt-4">
            The actors, crew, and creative minds who bring Ome's visions to life — and leave their own indelible marks on every frame.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collaborators.map(c => (
            <div
              key={c.id}
              className="group relative bg-[#0a0a0a] border border-white/5 hover:border-red-600/30 transition-all duration-500 cursor-pointer overflow-hidden"
              onClick={() => setSelected(c)}
            >
              {/* Photo */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={c.photo}
                  alt={c.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#050505]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs uppercase tracking-widest border border-white/30 px-4 py-2">View Details</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <p className="text-red-600 text-[10px] uppercase tracking-widest font-heading mb-1">{c.role}</p>
                <h3 className="text-white font-heading text-2xl tracking-wider mb-2 group-hover:text-red-400 transition-colors">{c.name}</h3>
                <p className="text-white/30 text-xs">Notable: {c.notableWork}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.projects.slice(0, 2).map(p => (
                    <span key={p} className="px-2 py-0.5 bg-white/5 text-white/30 text-[9px] uppercase tracking-widest">{p}</span>
                  ))}
                  {c.projects.length > 2 && (
                    <span className="px-2 py-0.5 bg-white/5 text-white/30 text-[9px] uppercase tracking-widest">+{c.projects.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ome on collaboration */}
      <section className="py-24 px-6 md:px-12 bg-[#080808] border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-4">On Collaboration</p>
          <blockquote className="text-3xl md:text-5xl font-display text-white leading-tight mb-6">
            "I don't direct actors. I create conditions for truth. They do the rest."
          </blockquote>
          <p className="text-white/30 text-xs uppercase tracking-widest">— Kajal Arefin Ome</p>
        </div>
      </section>

      <style>{`.font-display { font-family: 'Playfair Display', serif; }`}</style>
    </div>
  );
};

export default CollaboratorsPage;
