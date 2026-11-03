import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import directorData from '../data/director.json';
import PageTransition from '../components/PageTransition';

const FirstsPage: React.FC = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.fromTo('.first-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
    
    gsap.utils.toArray<HTMLElement>('.first-item').forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
        delay: i * 0.1
      });
    });
    
    return () => { ScrollTrigger.getAll().forEach(st => { if (st.trigger && !document.contains(st.trigger)) st.kill(); }); };
  }, []);

  const firsts = directorData.firsts || [
    { year: "2014", milestone: "First Project", detail: "Directed his debut television project." },
    { year: "2018", milestone: "First Major Success", detail: "Bachelor Point Season 1 became a runaway hit." },
    { year: "2020", milestone: "Fastest 10 Million", detail: "Sorry Sir reached 10M views in record time." }
  ];

  return (
    <PageTransition>
      <div className="bg-[#050505] min-h-screen pt-40 pb-28 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-4">Milestones</p>
          <h1 className="first-title text-5xl md:text-7xl font-heading text-white tracking-wider mb-20">My Firsts</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {firsts.map((item, i) => (
              <div key={i} className="first-item group bg-[#0a0a0a] border border-white/5 hover:border-red-600/50 p-10 transition-all duration-500">
                <div className="text-red-600 font-heading text-6xl mb-4 opacity-30 group-hover:opacity-100 transition-opacity">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3">{item.year}</p>
                <h3 className="text-white font-heading text-2xl tracking-widest mb-4">{item.milestone}</h3>
                <p className="text-white/60 text-base leading-relaxed">{item.detail}</p>
              </div>
            ))}
            
            {/* Adding more placeholder firsts for depth if data is small */}
            {firsts.length < 5 && (
              <>
                <div className="first-item group bg-[#0a0a0a] border border-white/5 hover:border-red-600/50 p-10 transition-all duration-500">
                  <div className="text-red-600 font-heading text-6xl mb-4 opacity-30 group-hover:opacity-100 transition-opacity">
                    {String(firsts.length + 1).padStart(2, '0')}
                  </div>
                  <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3">2023</p>
                  <h3 className="text-white font-heading text-2xl tracking-widest mb-4">First Dark Thriller</h3>
                  <p className="text-white/60 text-base leading-relaxed">Nishiddho proved his mastery over genres beyond comedy and drama.</p>
                </div>
                <div className="first-item group bg-[#0a0a0a] border border-white/5 hover:border-red-600/50 p-10 transition-all duration-500">
                  <div className="text-red-600 font-heading text-6xl mb-4 opacity-30 group-hover:opacity-100 transition-opacity">
                    {String(firsts.length + 2).padStart(2, '0')}
                  </div>
                  <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3">Upcoming</p>
                  <h3 className="text-white font-heading text-2xl tracking-widest mb-4">First Feature Film</h3>
                  <p className="text-white/60 text-base leading-relaxed">Currently in pre-production for his debut silver screen masterpiece.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default FirstsPage;
