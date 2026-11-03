import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import worksData from '../data/works.json';
import directorData from '../data/director.json';
import IconicCharacters from '../components/IconicCharacters';

const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo('.hero-tag', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
      .fromTo('.hero-name-1', { x: '-100vw', opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }, '-=0.4')
      .fromTo('.hero-name-2', { x: '100vw', opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }, '-=1.1')
      .fromTo('.hero-accent', { width: 0 }, { width: '140px', duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 20, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' }, '-=0.4')
      .fromTo('.hero-ctas', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3');

    // Scroll-triggered sections
    gsap.utils.toArray<HTMLElement>('.fade-up').forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });

    // Parallax bg
    gsap.to('.hero-bg', {
      y: '30%',
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });

    // Number counter animation
    gsap.utils.toArray<HTMLElement>('.stat-number').forEach(el => {
      const text = el.getAttribute('data-target') || '';
      const match = text.match(/^(\d+)(.*)$/);
      if (match) {
        const targetVal = parseInt(match[1], 10);
        const suffix = match[2];
        const counter = { val: 0 };
        
        gsap.to(counter, {
          val: targetVal,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
          },
          onUpdate: () => {
            el.innerText = Math.floor(counter.val) + suffix;
          }
        });
      }
    });

    return () => { ScrollTrigger.getAll().forEach(st => { if (st.trigger && !document.contains(st.trigger)) st.kill(); }); };
  }, []);

  const featured = worksData.filter(w => w.featured);
  const { milestones, quotes } = directorData;

  return (
    <div className="bg-[#050505]">
      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/gallery/hero-new-3.png"
            alt="Kajal Arefin Ome"
            className="hero-bg w-full h-full object-cover scale-110"
            style={{ transformOrigin: 'center top' }}
          />
          {/* Film grain only */}
          <div className="hero-grain absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" />
        </div>

        {/* Frame tag */}
        <div className="hero-tag absolute top-24 left-6 md:left-12 z-20 flex items-center gap-3 opacity-0">
          <div className="w-[3px] h-8 bg-red-600 shadow-[0_0_8px_rgba(229,9,20,0.6)]" />
          <div>
            <p className="text-[9px] uppercase tracking-[0.45em] text-white/30">Official Portfolio</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold">Frame 001 · Director's Cut</p>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-20 text-center px-4 flex flex-col items-center">


          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 overflow-hidden">
            <div className="hero-name-1 opacity-0 text-[clamp(4rem,13vw,10rem)] font-heading tracking-tighter leading-none text-white">KAJAL</div>
            <div className="hero-name-2 opacity-0 text-[clamp(4rem,13vw,10rem)] font-heading tracking-tighter leading-none text-red-600">AREFIN OME</div>
          </div>



          <div className="hero-subtitle flex items-center gap-4 opacity-0">
            <p className="text-sm md:text-base uppercase tracking-[0.5em] text-white/80 font-medium">
              Director · Visionary · Storyteller
            </p>
          </div>

          <div className="hero-ctas mt-10 flex flex-col sm:flex-row gap-4 items-center opacity-0">
            <Link
              to="/works"
              className="px-8 py-3 bg-red-600 text-white font-heading tracking-widest uppercase text-sm hover:bg-red-700 transition-colors shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:shadow-[0_0_30px_rgba(229,9,20,0.6)]"
            >
              Explore Filmography
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 border border-white/30 text-white/70 font-heading tracking-widest uppercase text-sm hover:border-white hover:text-white transition-all"
            >
              About the Director
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
          <p className="text-[8px] uppercase tracking-[0.55em] text-white/25">Scroll</p>
          <div className="w-[1px] h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>


      {/* ═══════════════════════════════════════
          INTRO SECTION
      ═══════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="fade-up">
            <p className="text-red-600 font-heading tracking-[0.4em] text-sm uppercase mb-4">The Director</p>
            <h2 className="text-4xl md:text-6xl font-heading text-white leading-none tracking-wider mb-8">
              Crafting Bangladesh's Most Human Stories
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-6">
              Kajal Arefin Ome is Bangladesh's most-watched director — the creative force behind cultural phenomena that have redefined what Bangladeshi storytelling can be. From the laugh-out-loud comedy of Bachelor Point to the gut-punch social drama of Sorry Sir, he tells stories that make you feel seen.
            </p>
            <p className="text-white/40 leading-relaxed text-base">
              Over a decade of work. Half a billion views. Countless moments of shared humanity.
            </p>
            <div className="mt-10 flex gap-4">
              <Link to="/about" className="text-sm uppercase tracking-widest text-white/50 hover:text-red-600 transition-colors border-b border-white/20 hover:border-red-600 pb-1">
                Full Biography →
              </Link>
              <Link to="/about/timeline" className="text-sm uppercase tracking-widest text-white/50 hover:text-red-600 transition-colors border-b border-white/20 hover:border-red-600 pb-1">
                Career Timeline →
              </Link>
            </div>
          </div>
          <div className="fade-up relative">
            <div className="relative w-full aspect-[3/4] max-w-sm mx-auto">
              <img
                src="/gallery/ome.jpg"
                alt="Kajal Arefin Ome"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 border border-white/10" />
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-red-600/20 -z-10" />
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#050505] to-transparent">
                <p className="text-white/30 text-xs uppercase tracking-widest">Kajal Arefin Ome</p>
                <p className="text-red-600 text-xs uppercase tracking-widest">Director, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED WORKS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="fade-up flex items-end justify-between mb-16">
          <div>
            <p className="text-red-600 font-heading tracking-[0.4em] text-sm uppercase mb-2">Selected Works</p>
            <h2 className="text-4xl md:text-6xl font-heading text-white tracking-wider">Featured Projects</h2>
          </div>
          <Link to="/works" className="hidden md:block text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors border-b border-white/20 pb-1">
            Full Filmography →
          </Link>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {worksData.slice(0, 10).map((work, i) => (
            <Link
              key={work.id}
              to={`/works/${work.slug}`}
              className="fade-up group relative overflow-hidden block break-inside-avoid border border-white/5 hover:border-white/20 transition-colors bg-[#0a0a0a]"
            >
              <img
                src={work.coverImage}
                alt={work.title}
                className="w-full h-auto block transition-transform duration-[2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-red-600 text-[10px] font-heading tracking-widest uppercase">{work.type}</span>
                  <span className="w-4 h-[1px] bg-red-600/50" />
                  <span className="text-white/40 text-[10px] tracking-widest uppercase">{work.year}</span>
                </div>
                <h3 className="font-display text-white group-hover:text-red-400 transition-colors duration-500 text-3xl md:text-4xl">
                  {work.title}
                </h3>
                <p className="text-white/50 text-sm mt-2 line-clamp-2 max-w-lg group-hover:text-white/70 transition-colors">
                  {work.synopsis}
                </p>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                  <span className="text-white text-xs">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/works"
            className="inline-block px-10 py-3 border border-white/20 text-white/70 font-heading tracking-widest uppercase text-sm hover:border-red-600 hover:text-red-600 transition-all"
          >
            View Complete Archive
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          KEY STATS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="fade-up text-center mb-16">
            <p className="text-red-600 font-heading tracking-[0.4em] text-sm uppercase mb-2">By The Numbers</p>
            <h2 className="text-4xl font-heading text-white tracking-wider">Records & Milestones</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {milestones.map((m, i) => (
              <div key={i} className="fade-up text-center group">
                <div className="stat-number text-4xl md:text-5xl font-heading text-red-600 mb-2 group-hover:text-white transition-colors" data-target={m.stat}>{m.stat}</div>
                <div className="text-white/50 text-xs uppercase tracking-widest mb-1">{m.label}</div>
                <div className="text-white/25 text-[10px] leading-tight">{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TOP VIEWED CONTENT (CHARTS)
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <div className="fade-up flex items-end justify-between mb-16">
          <div>
            <p className="text-red-600 font-heading tracking-[0.4em] text-sm uppercase mb-2">YouTube Charts</p>
            <h2 className="text-4xl md:text-6xl font-heading text-white tracking-wider">Top Trending Content</h2>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          {worksData.slice(0, 5).map((work, i) => (
            <Link 
              key={work.id}
              to={`/works/${work.slug}`} 
              className="fade-up group flex flex-col md:flex-row items-center gap-6 bg-[#080808] border border-white/5 p-4 hover:border-red-600/50 transition-all"
            >
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 shrink-0 bg-[#111] text-red-600 font-heading text-2xl md:text-3xl font-bold">
                #{i + 1}
              </div>
              <div className="w-full md:w-48 aspect-video shrink-0 overflow-hidden relative">
                <img src={work.coverImage} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between w-full">
                <div>
                  <h3 className="text-white font-display text-2xl group-hover:text-red-400 transition-colors mb-2 md:mb-1">{work.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40">
                    <span>{work.type}</span>
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    <span>{work.year}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-left md:text-right">
                  <p className="text-red-600 font-heading text-sm uppercase tracking-widest">{work.successStats.viewership}</p>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest">Global Views</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BACHELOR POINT (ICONIC CHARACTERS)
      ═══════════════════════════════════════ */}
      <IconicCharacters />

      {/* ═══════════════════════════════════════
          DIRECTOR QUOTE
      ═══════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-12 max-w-5xl mx-auto text-center">
        <div className="fade-up">
          <div className="text-[100px] font-display text-red-600/10 leading-none mb-0 select-none">"</div>
          <blockquote className="text-3xl md:text-5xl font-display text-white leading-snug -mt-12 mb-8">
            {quotes[0].text}
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <span className="h-[1px] w-12 bg-red-600/50" />
            <p className="text-red-600 text-xs uppercase tracking-widest font-heading">Kajal Arefin Ome</p>
            <span className="h-[1px] w-12 bg-red-600/50" />
          </div>
          <Link to="/about/quotes" className="inline-block mt-8 text-xs uppercase tracking-widest text-white/30 hover:text-white transition-colors">
            More Director Quotes →
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          LATEST NEWS / PRESS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="fade-up flex items-end justify-between mb-12">
          <div>
            <p className="text-red-600 font-heading tracking-[0.4em] text-sm uppercase mb-2">Media Coverage</p>
            <h2 className="text-4xl font-heading text-white tracking-wider">Latest Press</h2>
          </div>
          <Link to="/press-awards" className="hidden md:block text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors border-b border-white/20 pb-1">
            All Coverage →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {directorData.press.slice(0, 3).map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="fade-up group block bg-[#080808] border border-white/5 hover:border-white/20 p-8 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-red-600 text-[10px] uppercase tracking-widest font-heading">{article.publication}</span>
                <span className="text-white/20 text-[10px]">{article.date}</span>
              </div>
              <h3 className="text-white font-display text-xl leading-snug mb-3 group-hover:text-red-400 transition-colors">{article.headline}</h3>
              <p className="text-white/40 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
              <div className="mt-4 text-red-600 text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Read Article →
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA — CONTACT
      ═══════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-12 text-center bg-[#080808] border-t border-white/5">
        <div className="fade-up max-w-3xl mx-auto">
          <p className="text-red-600 font-heading tracking-[0.4em] text-sm uppercase mb-4">Collaborate</p>
          <h2 className="text-5xl md:text-7xl font-heading text-white tracking-wider mb-8">Let's Create Something Extraordinary</h2>
          <p className="text-white/50 text-lg mb-12">
            Available for commercial direction, OTT series production, feature films, and speaking engagements.
          </p>
          <Link
            to="/contact"
            className="inline-block px-12 py-4 bg-red-600 text-white font-heading tracking-widest uppercase text-sm hover:bg-white hover:text-red-600 transition-all duration-300 shadow-[0_0_30px_rgba(229,9,20,0.4)]"
          >
            Send a Production Inquiry
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pageIn {
          animation: pageIn 0.6s ease-out forwards;
        }
        .hero-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
        .font-display { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default HomePage;
