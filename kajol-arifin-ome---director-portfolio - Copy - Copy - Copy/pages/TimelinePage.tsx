import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import timelineData from '../data/timeline.json';

const TimelinePage: React.FC = () => {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo('.tl-title', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 });

    // Animate the vertical line
    gsap.fromTo(lineRef.current, { scaleY: 0 }, {
      scaleY: 1, duration: 2, ease: 'none',
      scrollTrigger: { trigger: lineRef.current, start: 'top 80%', end: 'bottom 20%', scrub: true }
    });

    gsap.utils.toArray<HTMLElement>('.tl-item').forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, x: i % 2 === 0 ? -50 : 50 }, {
        opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    return () => { ScrollTrigger.getAll().forEach(st => { if (st.trigger && !document.contains(st.trigger)) st.kill(); }); };
  }, []);

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/about" className="text-white/30 text-xs uppercase tracking-widest hover:text-white transition-colors">About</Link>
            <span className="text-white/20">→</span>
            <span className="text-red-600 text-xs uppercase tracking-widest">Timeline</span>
          </div>
          <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">A Life in Film</p>
          <h1 className="tl-title text-6xl md:text-9xl font-heading text-white tracking-wider leading-none">
            Career Timeline
          </h1>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="relative">
          {/* Central line */}
          <div
            ref={lineRef}
            className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-red-600 via-red-600/50 to-transparent origin-top"
          />

          <div className="space-y-16">
            {timelineData.map((item, i) => (
              <div key={i} className={`tl-item relative flex items-start ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-8 md:gap-16`}>
                {/* Dot */}
                <div className="absolute left-1/2 -translate-x-1/2 top-2 w-4 h-4 rounded-full bg-red-600 shadow-[0_0_15px_rgba(229,9,20,0.8)] z-10" />

                {/* Content */}
                <div className={`w-[calc(50%-2rem)] ${i % 2 === 0 ? 'text-right pr-4' : 'text-left pl-4'} group`}>
                  <div className={`bg-[#0a0a0a] border border-white/5 hover:border-red-600/30 p-8 transition-all duration-500 group-hover:-translate-y-1`}>
                    <p className="text-red-600 font-heading tracking-widest text-2xl mb-1">{item.year}</p>
                    <span className="text-white/20 text-[10px] uppercase tracking-widest block mb-3">{item.label}</span>
                    <h3 className="text-white font-heading text-xl tracking-widest mb-3">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-4">{item.description}</p>
                    <p className="text-white/30 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>

                {/* Spacer for other side */}
                <div className="w-[calc(50%-2rem)]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future */}
      <section className="py-24 px-6 md:px-12 bg-[#080808] border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-4">What Comes Next</p>
          <h2 className="text-5xl font-heading text-white tracking-wider mb-6">The Next Chapter</h2>
          <p className="text-white/50 max-w-xl mx-auto mb-10">
            Feature film in development. International collaborations in progress. The story continues.
          </p>
          <Link to="/future" className="inline-block px-8 py-3 bg-red-600 text-white font-heading tracking-widest uppercase text-sm hover:bg-red-700 transition-colors">
            View Future Plans
          </Link>
        </div>
      </section>
    </div>
  );
};

export default TimelinePage;
