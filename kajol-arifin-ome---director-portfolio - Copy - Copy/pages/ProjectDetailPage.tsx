import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import worksData from '../data/works.json';

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const work = worksData.find(w => w.slug === slug);

  useEffect(() => {
    if (!work) return;
    gsap.fromTo('.detail-hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.3 });
    gsap.fromTo('.detail-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.6 });
  }, [work]);

  if (!work) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] gap-6">
        <h2 className="text-5xl font-heading text-white">Project Not Found</h2>
        <Link to="/works" className="text-red-600 text-sm uppercase tracking-widest hover:underline">← Back to Works</Link>
      </div>
    );
  }

  const relatedWorks = worksData.filter(w => w.slug !== slug && w.category === work.category).slice(0, 3);

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* ── Lightbox ── */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[500] bg-black/96 flex items-center justify-center p-4 md:p-8" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white text-4xl" onClick={() => setLightboxImg(null)}>✕</button>
          <img src={lightboxImg} alt="Still" className="max-w-full max-h-[90vh] object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative h-[80vh] flex flex-col justify-end overflow-hidden">
        <img
          src={work.coverImage}
          alt={work.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />

        <div className="relative z-10 px-6 md:px-12 pb-16 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-end gap-10">
          {/* Poster */}
          <div className="hidden md:block w-72 lg:w-80 shrink-0 shadow-[0_0_60px_rgba(0,0,0,0.9)] border border-white/10 rounded-sm overflow-hidden">
            <img src={work.poster} alt={work.title} className="w-full h-auto block" />
          </div>
          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm">{work.type}</span>
              <span className="text-white/20">·</span>
              <span className="text-white/50 text-sm">{work.year}{work.endYear && work.endYear !== work.year ? `–${work.endYear}` : ''}</span>
              <span className="text-white/20">·</span>
              <span className="text-white/50 text-sm">{work.platform}</span>
              <span className="text-white/20">·</span>
              <span className="text-white/50 text-sm">{work.runtime}</span>
            </div>
            <h1 className="detail-hero-title text-5xl md:text-8xl font-heading text-white tracking-wider leading-none mb-3">
              {work.title}
            </h1>

            <p className="text-white/60 italic text-lg md:text-xl max-w-2xl">{work.logline}</p>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="detail-content max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">

        {/* ── LEFT: Narrative ── */}
        <div className="lg:col-span-2 space-y-16">

          {/* Synopsis */}
          <div>
            <h2 className="text-3xl font-heading text-white tracking-widest border-b border-white/10 pb-4 mb-6">Synopsis</h2>
            <p className="text-white/70 text-lg leading-relaxed">{work.synopsis}</p>
          </div>

          {/* Director's Note */}
          <div className="bg-[#0a0a0a] border-l-4 border-red-600 p-8">
            <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-xs mb-3">Director's Note</p>
            <blockquote className="text-white/80 italic text-xl leading-relaxed">
              "{work.directorNote}"
            </blockquote>
            <p className="text-white/30 text-sm mt-4 uppercase tracking-widest">— Kajal Arefin Ome</p>
          </div>

          {/* Concept */}
          <div>
            <h2 className="text-3xl font-heading text-white tracking-widest border-b border-white/10 pb-4 mb-6">The Concept</h2>
            <p className="text-white/60 leading-relaxed">{work.concept}</p>
          </div>

          {/* Behind the Story */}
          <div>
            <h2 className="text-3xl font-heading text-white tracking-widest border-b border-white/10 pb-4 mb-6">Behind the Story</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-red-600 font-heading tracking-widest uppercase text-sm mb-3">Inspiration</h3>
                <p className="text-white/60 leading-relaxed">{work.inspiration}</p>
              </div>
              <div>
                <h3 className="text-red-600 font-heading tracking-widest uppercase text-sm mb-3">Challenges</h3>
                <p className="text-white/60 leading-relaxed">{work.challenges}</p>
              </div>
              <div>
                <h3 className="text-red-600 font-heading tracking-widest uppercase text-sm mb-3">Director's Perspective</h3>
                <p className="text-white/60 leading-relaxed italic">"{work.directorPerspective}"</p>
              </div>
            </div>
          </div>

          {/* Technical Specs */}
          <div>
            <h2 className="text-3xl font-heading text-white tracking-widest border-b border-white/10 pb-4 mb-6">Technical Specifications</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#0a0a0a] p-4 border border-white/5">
                <p className="text-white/25 text-[10px] uppercase tracking-widest mb-2">Camera</p>
                <p className="text-white text-sm">{work.technicalSpecs.camera}</p>
              </div>
              <div className="bg-[#0a0a0a] p-4 border border-white/5">
                <p className="text-white/25 text-[10px] uppercase tracking-widest mb-2">Lenses</p>
                <p className="text-white text-sm">{work.technicalSpecs.lenses}</p>
              </div>
              <div className="bg-[#0a0a0a] p-4 border border-white/5">
                <p className="text-white/25 text-[10px] uppercase tracking-widest mb-2">Color Grade</p>
                <p className="text-white text-sm">{work.technicalSpecs.colorGrade}</p>
              </div>
            </div>
          </div>

          {/* Cast */}
          <div>
            <h2 className="text-3xl font-heading text-white tracking-widest border-b border-white/10 pb-4 mb-6">Cast</h2>
            <div className="flex flex-wrap gap-3">
              {work.cast.map(name => (
                <span key={name} className="px-4 py-2 bg-[#0a0a0a] border border-white/10 text-white/70 text-sm hover:border-red-600/50 hover:text-white transition-colors">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Stills Gallery */}
          {work.stills && work.stills.length > 0 && (
            <div>
              <h2 className="text-3xl font-heading text-white tracking-widest border-b border-white/10 pb-4 mb-6">Production Stills</h2>
              <div className="grid grid-cols-2 gap-4">
                {work.stills.map((still, i) => (
                  <div
                    key={i}
                    className="aspect-video relative overflow-hidden cursor-pointer group border border-white/5 hover:border-white/20 transition-colors"
                    onClick={() => setLightboxImg(still)}
                  >
                    <img src={still} alt={`Still ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs uppercase tracking-widest">Expand</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {work.awards && work.awards.length > 0 && (
            <div>
              <h2 className="text-3xl font-heading text-white tracking-widest border-b border-white/10 pb-4 mb-6">Awards & Recognition</h2>
              {work.awards.map((award, i) => (
                <div key={i} className="flex items-center gap-6 bg-[#0a0a0a] border border-white/5 p-6 mb-4">
                  <div className="text-5xl font-heading text-red-600/20">★</div>
                  <div>
                    <p className="text-red-600 font-heading tracking-widest uppercase text-xs mb-1">{award.year} · {award.status}</p>
                    <h4 className="text-white text-xl font-display">{award.name}</h4>
                    <p className="text-white/40 text-sm">{award.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="space-y-8">
          {/* Success Stats */}
          <div className="bg-[#0a0a0a] border border-white/5 p-8">
            <h3 className="text-xl font-heading text-white tracking-widest mb-6 border-b border-white/10 pb-4">Success Metrics</h3>
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-heading text-red-600 mb-1">{work.successStats.viewership}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest">Total Viewership</p>
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-1">{work.successStats.milestone}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest">Milestone</p>
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-1">{work.successStats.audienceRating}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest">Audience Rating</p>
              </div>
            </div>
          </div>

          {/* Cultural Impact */}
          <div className="bg-[#0a0a0a] border border-white/5 p-8">
            <h3 className="text-xl font-heading text-white tracking-widest mb-4">Cultural Impact</h3>
            <p className="text-white/60 text-sm leading-relaxed">{work.successStats.culturalImpact}</p>
          </div>

          {/* Credits */}
          <div className="bg-[#0a0a0a] border border-white/5 p-8">
            <h3 className="text-xl font-heading text-white tracking-widest mb-6 border-b border-white/10 pb-4">Credits</h3>
            <ul className="space-y-4">
              {[
                { role: 'Director of Photography', name: work.crew.dop },
                { role: 'Editor', name: work.crew.editor },
                { role: 'Music', name: work.crew.music },
                { role: 'Producer', name: work.crew.producer },
              ].map(c => (
                <li key={c.role} className="flex flex-col">
                  <span className="text-white/25 text-[10px] uppercase tracking-widest mb-0.5">{c.role}</span>
                  <span className="text-white text-sm">{c.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Press Links */}
          {work.pressLinks && work.pressLinks.length > 0 && (
            <div className="bg-[#0a0a0a] border border-white/5 p-8">
              <h3 className="text-xl font-heading text-white tracking-widest mb-6">Press Coverage</h3>
              {work.pressLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer" className="block group mb-4 last:mb-0">
                  <p className="text-red-600 text-[10px] uppercase tracking-widest mb-0.5">{link.publication}</p>
                  <p className="text-white/70 text-sm group-hover:text-white transition-colors">{link.title}</p>
                </a>
              ))}
            </div>
          )}

          {/* Back */}
          <Link to="/works" className="block text-center py-3 border border-white/15 text-white/50 font-heading tracking-widest uppercase text-sm hover:border-red-600 hover:text-red-600 transition-all">
            ← All Works
          </Link>
        </div>
      </div>

      {/* ── RELATED WORKS ── */}
      {relatedWorks.length > 0 && (
        <section className="py-24 px-6 md:px-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-heading text-white tracking-widest mb-12">More {work.type}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedWorks.map(rw => (
                <Link key={rw.id} to={`/works/${rw.slug}`} className="group flex flex-col h-full bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all rounded-sm overflow-hidden hover:-translate-y-1">
                  <div className="relative overflow-hidden w-full aspect-[2/3] bg-[#111] shrink-0">
                    <img src={rw.coverImage || rw.poster} alt={rw.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent pointer-events-none" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-red-600 text-[10px] uppercase tracking-widest font-heading mb-1">{rw.year}</p>
                      <h3 className="text-xl font-display text-white group-hover:text-red-400 transition-colors leading-snug">{rw.title}</h3>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                      View Project →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .font-display { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default ProjectDetailPage;
