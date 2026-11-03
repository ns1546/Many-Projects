
import React, { useState, useRef } from 'react';
import SectionWrapper from './SectionWrapper';
import { ArrowDown, ArrowUp } from 'lucide-react';

const CHARACTERS = [
  { id: 1, name: 'Kabila', role: 'Bachelor Point', image: '/gallery/kabila.jpg' },
  { id: 2, name: 'Habu', role: 'Bachelor Point', image: '/gallery/habu.jpg' },
  { id: 3, name: 'Pasha', role: 'Bachelor Point', image: '/gallery/pasha.jpg' },
  { id: 4, name: 'Shuvo', role: 'Bachelor Point', image: '/gallery/shuvo.jpg' },
  { id: 5, name: 'Arifin', role: 'Bachelor Point', image: '/gallery/arifin.jpg' },
  { id: 6, name: 'Nehal', role: 'Bachelor Point', image: '/gallery/nehal.jpg' },
  { id: 7, name: 'Shimul', role: 'Bachelor Point', image: '/gallery/shimul.jpg' },
  { id: 8, name: 'Jakir', role: 'Bachelor Point', image: '/gallery/jakir.jpg' }
];

const IconicCharacters: React.FC = () => {
  const [isUnfolded, setIsUnfolded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleReveal = () => {
    if (!isUnfolded) {
      // Unfold
      setIsUnfolded(true);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error(e));
      }
      setTimeout(() => {
        document.getElementById('character-grid-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
      // Fold
      setIsUnfolded(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setTimeout(() => {
        document.getElementById('characters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  return (
    <SectionWrapper id="characters" className="bg-[#020202] relative font-sans overflow-hidden">
      
      {/* Performance Optimization: Removed heavy bg-blur to prevent scroll lag */}


      {/* Embedded Audio */}
      <audio ref={audioRef} src="/gallery/voice.mp3" preload="auto" />

      {/* ── Top Section: The Pitch ── */}
      <div className="max-w-5xl mx-auto text-center pt-12 pb-16 relative z-10">
        <h2 className="text-4xl md:text-7xl font-heading text-white mb-8 leading-tight">
          More Than Just Stories. 
          <span className="text-red-600">He Builds Icons.</span>
        </h2>
        
        <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl mx-auto mb-12 font-light">
          Kajal Arefin Ome doesn't just direct web series, natoks, or films—he breathes life into characters. He has an unmatched ability to capture the raw, hilarious, and emotional essence of everyday people. His creations don't just stay on the screen; they enter our daily conversations, become viral memes, and hold a permanent place in the audience's hearts. He doesn't just make dramas; he creates legacies.
        </p>

        <button 
          onClick={handleToggleReveal}
          className={`group relative inline-flex items-center gap-4 border border-red-600 px-8 py-4 font-heading tracking-[0.2em] uppercase text-sm transition-all duration-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] ${
            isUnfolded ? 'bg-white text-red-600 shadow-[0_0_30px_rgba(255,255,255,0.8)]' : 'bg-red-600 text-white hover:bg-white hover:text-red-600 hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.8)]'
          }`}
        >
          <span>{isUnfolded ? 'Close the Frame' : 'Meet the Legends'}</span>
          {isUnfolded ? (
            <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
          ) : (
            <ArrowDown className="w-5 h-5 transition-transform group-hover:translate-y-1" />
          )}
        </button>
      </div>

      {/* ── Bottom Section: Foldable Grid ── */}
      <div id="character-grid-view" className="relative z-10 w-full max-w-7xl mx-auto" style={{ perspective: '2000px' }}>
        
        <div 
          className={`grid transition-[grid-template-rows,opacity,transform] duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${isUnfolded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isUnfolded ? 'rotateX(0deg)' : 'rotateX(-90deg)'
          }}
        >
          <div className="overflow-hidden">
            <div className="pt-8 pb-16 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 md:px-8 bg-[#0a0a0a]/50 rounded-b-xl border border-white/10 border-t-2 border-t-red-600">
              {CHARACTERS.map((char) => (
                <div 
                  key={char.id} 
                  className="group relative aspect-[3/4] overflow-hidden bg-[#050505] cursor-pointer shadow-2xl rounded-md transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
                >
                  <img 
                    src={char.image} 
                    alt={char.name} 
                    className="w-full h-full object-cover object-top grayscale-[50%] brightness-[0.7] group-hover:grayscale-0 group-hover:brightness-110 group-hover:scale-105 transition-all duration-700"
                  />
                  
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
                    <p className="text-red-500 font-heading text-[10px] tracking-[0.3em] uppercase mb-1 drop-shadow-md">
                      {char.role}
                    </p>
                    <h3 className="text-3xl font-heading text-white tracking-widest drop-shadow-lg">
                      {char.name}
                    </h3>
                  </div>

                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-600/50 transition-colors duration-500 pointer-events-none rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </SectionWrapper>
  );
};

export default IconicCharacters;
