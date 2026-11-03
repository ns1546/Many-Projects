
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Hero: React.FC = () => {
  const bgRef = useRef<HTMLImageElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const kajolRef = useRef<HTMLDivElement>(null);
  const omeRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const frameTagRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const subtitleBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Removed infinite Ken Burns zoom for maximum 60FPS performance
    gsap.set(bgRef.current, { scale: 1.05 }); 
    

    // ── 2. Frame tag fades in ──────────────────────────────────────────────
    gsap.fromTo(
      frameTagRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.3 }
    );

    // ── 3. Main name animation ─────────────────────────────────────────────
    tl.fromTo(
      kajolRef.current,
      { x: '-110vw', opacity: 0 },
      { x: 0, opacity: 1, duration: 1.4, ease: 'elastic.out(1, 0.75)' }
    )
      .fromTo(
        omeRef.current,
        { x: '110vw', opacity: 0 },
        { x: 0, opacity: 1, duration: 1.4, ease: 'elastic.out(1, 0.75)' },
        '-=1.1'
      )
      // ── 4. Red accent line grows in ────────────────────────────────────────
      .fromTo(
        accentRef.current,
        { width: 0, opacity: 0 },
        { width: '140px', opacity: 1, duration: 0.9, ease: 'power3.out' },
        '-=0.3'
      )
      // ── 5. Subtitle blur-in ────────────────────────────────────────────────
      .fromTo(
        subtitleRef.current,
        { opacity: 0, filter: 'blur(14px)', y: 22 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, ease: 'power2.out' },
        '-=0.4'
      )
      // ── 6. Red highlight box sweeps in from left ───────────────────────────
      .fromTo(
        subtitleBgRef.current,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, transformOrigin: 'left center', duration: 0.85, ease: 'power3.inOut' },
        '-=0.6'
      );

    // Pulse removed for better scrolling stability
    gsap.set(subtitleBgRef.current, {
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    });

    // ── 8. Scroll indicator gentle glow pulse ─────────────────────────────
    gsap.to(scrollRef.current, {
      opacity: 0.3,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

  }, []);

  return (
    <section className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#050505]">

      {/* ── Hero Photo Background (50% opacity + Ken Burns) ─────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          ref={bgRef}
          src="/gallery/hero-new.png"
          alt="Kajal Arefin Ome"
          className="w-full h-full object-cover"
          style={{ opacity: 0.5, transformOrigin: 'center center' }}
        />
      </div>

      {/* ── Vignette: dark radial edges for cinematic depth ──────────── */}
      <div
        ref={vignetteRef}
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,5,5,0.65) 70%, rgba(5,5,5,0.95) 100%)',
        }}
      />

      {/* Performance check: Removed expensive mix-blend SVG grain overlay */}

      {/* ── Film Roll Frame Tag (top-left) ────────────────────────────── */}
      <div
        ref={frameTagRef}
        className="absolute top-6 left-6 z-20 flex items-center gap-3 opacity-0"
      >
        <div className="w-[3px] h-8 bg-red-600 shadow-[0_0_8px_2px_rgba(229,9,20,0.6)]" />
        <div>
          <p className="text-[9px] uppercase tracking-[0.45em] text-white/30 leading-tight">Director Portfolio</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 leading-tight font-bold">Frame 001 · Director's Cut</p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="text-center z-20 px-4 relative">

        {/* Faint top rule */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="flex-1 max-w-[80px] h-[1px] bg-gradient-to-r from-transparent to-white/20" />
          <span className="text-[9px] uppercase tracking-[0.55em] text-white/25">Kajal Arefin Ome</span>
          <span className="flex-1 max-w-[80px] h-[1px] bg-gradient-to-l from-transparent to-white/20" />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
          <div
            ref={kajolRef}
            className="text-[clamp(4rem,12vw,9rem)] font-heading tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70"
          >
            KAJAL
          </div>
          <div
            ref={omeRef}
            className="text-[clamp(4rem,12vw,9rem)] font-heading tracking-tighter leading-none text-red-600"
          >
            AREFIN OME
          </div>
        </div>

        {/* Red accent line */}
        <div className="flex justify-center mt-3">
          <div
            ref={accentRef}
            className="h-[2px] rounded-full"
            style={{
              width: 0,
              background: 'linear-gradient(90deg, transparent, #E50914, transparent)',
              boxShadow: '0 0 12px 2px rgba(229,9,20,0.7)',
            }}
          />
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className="mt-5 flex items-center justify-center gap-5 relative">
          {/* Red sweep background box */}
          <div
            ref={subtitleBgRef}
            className="absolute inset-0 overflow-hidden rounded-sm pointer-events-none"
            style={{
              transform: 'scaleX(0)',
              transformOrigin: 'left center',
              background: 'linear-gradient(90deg, #6B0008 0%, #C8000F 35%, #E50914 60%, #9B0010 100%)',
              boxShadow: '0 0 25px rgba(229,9,20,0.6), 0 0 60px rgba(229,9,20,0.3), inset 0 0 20px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,60,60,0.35)',
            }}
          >
            {/* Shimmer light pass */}
            <div className="subtitle-shimmer" />
          </div>
          <span className="w-10 h-[1px] bg-white/60 relative z-10" />
          <p className="text-[11px] md:text-sm uppercase tracking-[0.55em] font-semibold text-white relative z-10 px-3"
            style={{ textShadow: '0 0 12px rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.8)' }}>
            Director&nbsp;·&nbsp;Visionary&nbsp;·&nbsp;Storyteller
          </p>
          <span className="w-10 h-[1px] bg-white/60 relative z-10" />
        </div>
      </div>

      {/* ── Scroll Indicator ─────────────────────────────────────────── */}
      <div ref={scrollRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <p className="text-[8px] uppercase tracking-[0.55em] text-white/30">Scroll</p>
        <div className="w-[1px] h-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/0" />
          <div className="scroll-line absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-600 to-transparent" />
        </div>
      </div>

    </section>
  );
};

export default Hero;
