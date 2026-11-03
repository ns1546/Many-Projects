
import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ClapperboardLogin from './components/ClapperboardLogin';
import Hero from './components/Hero';
import Filmography from './components/Filmography';
import About from './components/About';
import Gallery from './components/Gallery';
import Contact from './components/Contact';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  const handleEnter = () => {
    setIsLoggedIn(true);
    document.body.style.overflowY = 'auto';
    
    // Smooth scroll to top on entry
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    document.body.style.overflowY = 'hidden';
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const handleScroll = () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        const progress = document.getElementById('scroll-progress');
        if (progress) progress.style.width = `${scrolled}%`;
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isLoggedIn]);

  return (
    <main className="relative bg-[#050505] min-h-screen selection:bg-red-600 selection:text-white">
      {!isLoggedIn && <ClapperboardLogin onEnter={handleEnter} />}
      
      {isLoggedIn && (
        <div className="content-container">
          {/* Global Cinematic Audio Ambient (Visual only for now) */}
          <div className="fixed top-1/2 left-4 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-8 opacity-20 hover:opacity-100 transition-opacity duration-500">
             <div className="w-1 h-32 bg-white/20 relative rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-red-600"></div>
             </div>
             <p className="vertical-text text-[10px] uppercase tracking-[1em] text-white/40">Cinematic Feed</p>
          </div>

          {/* Navigation Overlay */}
          <nav className="fixed top-0 left-0 w-full z-50 p-6 md:px-12 md:py-8 flex justify-between items-center pointer-events-none">
            <div 
              className="font-heading text-3xl md:text-4xl tracking-tighter pointer-events-auto cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              KAO<span className="text-red-600 group-hover:animate-pulse">.</span>
            </div>
            
            <div className="hidden md:flex gap-12 items-center pointer-events-auto">
              {['Works', 'About', 'Gallery', 'Connect'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/60 hover:text-red-600 transition-all hover:tracking-[0.6em]"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="pointer-events-auto flex items-center gap-6">
               <button className="w-8 h-8 flex flex-col justify-center gap-1.5 cursor-pointer group">
                  <span className="w-full h-[2px] bg-white group-hover:bg-red-600 transition-all duration-300"></span>
                  <span className="w-2/3 h-[2px] bg-white self-end group-hover:w-full group-hover:bg-red-600 transition-all duration-300"></span>
               </button>
            </div>
          </nav>

          <Hero />
          
          <div id="scroll-content">
            <Filmography />
            <About />
            <Gallery />
            <Contact />
          </div>

          {/* Progress Bar (Cinematic Style) */}
          <div className="fixed bottom-0 left-0 h-1.5 bg-red-600 z-[60] shadow-[0_0_15px_rgba(229,9,20,0.8)] transition-all duration-200" id="scroll-progress"></div>
        </div>
      )}
      
      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        #scroll-progress {
          width: 0%;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </main>
  );
};

export default App;
