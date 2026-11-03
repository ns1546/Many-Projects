import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import directorData from '../data/director.json';

const PhilosophyPage: React.FC = () => {
  const [active, setActive] = useState<number>(0);
  const { philosophy } = directorData;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo('.phil-title', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 });
    gsap.utils.toArray<HTMLElement>('.phil-item').forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
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
            <Link to="/about" className="text-white/30 text-xs uppercase tracking-widest hover:text-white">About</Link>
            <span className="text-white/20">→</span>
            <span className="text-red-600 text-xs uppercase tracking-widest">Philosophy</span>
          </div>
          <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">Director's Desk</p>
          <h1 className="phil-title text-6xl md:text-9xl font-heading text-white tracking-wider leading-none">
            The Art of Truth
          </h1>
        </div>
      </section>

      {/* Interactive Q&A */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Questions sidebar */}
          <div className="space-y-2">
            {philosophy.map((item, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`phil-item w-full text-left px-6 py-4 border-l-2 transition-all duration-300 group ${active === i ? 'border-red-600 bg-red-600/5' : 'border-white/10 hover:border-white/30'}`}
              >
                <p className={`text-sm leading-snug transition-colors ${active === i ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                  {item.question}
                </p>
              </button>
            ))}
          </div>

          {/* Answer panel */}
          <div className="lg:col-span-2 relative">
            <div className="sticky top-28">
              <div className="text-[120px] font-heading text-red-600/5 leading-none select-none mb-0">Q</div>
              <div className="-mt-16 bg-[#0a0a0a] border border-white/5 p-10 md:p-14">
                <p className="text-red-600 font-heading tracking-widest uppercase text-xs mb-4">
                  Question {String(active + 1).padStart(2, '0')} of {String(philosophy.length).padStart(2, '0')}
                </p>
                <h3 className="text-2xl md:text-3xl font-display text-white mb-8 leading-snug">
                  {philosophy[active].question}
                </h3>
                <div className="w-8 h-[2px] bg-red-600 mb-8" />
                <p className="text-white/70 text-lg leading-relaxed">
                  {philosophy[active].answer}
                </p>
                <div className="mt-10 flex gap-4">
                  <button
                    onClick={() => setActive(Math.max(0, active - 1))}
                    disabled={active === 0}
                    className="px-4 py-2 text-xs uppercase tracking-widest border border-white/15 text-white/40 hover:border-white hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setActive(Math.min(philosophy.length - 1, active + 1))}
                    disabled={active === philosophy.length - 1}
                    className="px-4 py-2 text-xs uppercase tracking-widest border border-white/15 text-white/40 hover:border-white hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-24 px-6 md:px-12 bg-[#080808] border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="phil-item text-4xl font-heading text-white tracking-widest mb-16 text-center">Core Creative Principles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', label: 'Truth First', desc: 'If a scene doesn\'t feel true, it doesn\'t matter how beautiful it looks or how clever the dialogue is.' },
              { num: '02', label: 'Radical Empathy', desc: 'Understand every character\'s truth — not just the hero\'s, but the villain\'s, the bystander\'s, the forgotten one.' },
              { num: '03', label: 'Courage', desc: 'The willingness to tell a story even when it\'s uncomfortable. The best work comes from the greatest fears.' },
              { num: '04', label: 'Patience', desc: 'Great art cannot be rushed. The best performance is waiting — you just have to create the conditions for it to emerge.' },
            ].map(p => (
              <div key={p.num} className="phil-item group">
                <div className="text-7xl font-heading text-red-600/10 group-hover:text-red-600/20 transition-colors mb-4">{p.num}</div>
                <h3 className="text-white font-heading text-xl tracking-widest mb-3">{p.label}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`.font-display { font-family: 'Playfair Display', serif; }`}</style>
    </div>
  );
};

export default PhilosophyPage;
