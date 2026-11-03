
import React, { useEffect, useRef, useState } from 'react';
import gsap, { Power4 } from 'gsap';

interface ClapperboardLoginProps {
  onEnter: () => void;
}

const ClapperboardLogin: React.FC<ClapperboardLoginProps> = ({ onEnter }) => {
  const [hasSnapped, setHasSnapped] = useState(false);
  const topBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const performSnap = () => {
    if (hasSnapped) return;
    setHasSnapped(true);

    const tl = gsap.timeline({
      onComplete: () => {
        onEnter();
      }
    });

    tl.to(topBarRef.current, {
      rotate: 0,
      duration: 0.1,
      ease: "power4.in"
    })
    .to(containerRef.current, {
      scale: 2,
      opacity: 0,
      filter: 'blur(40px)',
      duration: 0.3,
      ease: "power4.inOut"
    });
  };

  useEffect(() => {
    // Initial entrance of clapperboard
    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 100, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: Power4.easeOut }
    );

    const timer = setTimeout(() => {
      performSnap();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-hidden">
      {/* Background Split Reveal (Invisible initially) */}
      <div className="absolute inset-0 flex flex-col md:flex-row pointer-events-none">
        <div className="flex-1 bg-black border-r border-white/5"></div>
        <div className="flex-1 bg-black border-l border-white/5"></div>
      </div>



      <div ref={containerRef} className="relative cursor-none group z-10">
        {/* Clapperboard Body */}
        <div className="w-80 h-64 bg-black border-4 border-white rounded-lg shadow-[0_0_50px_rgba(255,255,255,0.1)] relative overflow-hidden backdrop-blur-md">
          <div className="p-4 flex flex-col justify-between h-full">
            <div className="border-b-2 border-white pb-2">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-1">Production</p>
              <h2 className="text-2xl font-heading text-white tracking-wider">KAJOL ARIFIN OME</h2>
            </div>
            <div className="flex justify-between items-end border-t border-white/20 pt-2">
              <div>
                <p className="text-[8px] uppercase text-white/40">Roll</p>
                <p className="font-heading text-xl text-white">2026</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] uppercase text-white/40">Scene</p>
                <p className="font-heading text-xl text-white">INTRO</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase text-white/40">Take</p>
                <p className="font-heading text-xl text-white">AUTO</p>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-red-600 font-heading text-5xl opacity-20 animate-pulse tracking-tighter">DIRECTING</span>
          </div>
        </div>

        {/* Clapperboard Top Bar */}
        <div 
          ref={topBarRef}
          className="absolute -top-12 left-0 w-80 h-12 bg-black border-4 border-white origin-bottom-left shadow-lg"
          style={{ transform: 'rotate(-30deg)' }}
        >
          <div className="flex h-full">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-white' : 'bg-black'} skew-x-[-25deg]`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClapperboardLogin;
