import React from 'react';
import SectionWrapper from './SectionWrapper';

const Achievements: React.FC = () => {
  return (
    <SectionWrapper id="achievements" className="bg-[#020202] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
        
        {/* Content Side */}
        <div className="w-full lg:w-1/2">
          <div className="mb-12 animate-left">
            <h2 className="text-4xl md:text-6xl font-heading mb-4 text-white">Achievements & <span className="text-red-600">Recognitions</span></h2>
            <div className="w-24 h-1 bg-red-600 mb-6 relative">
              <div className="absolute top-0 right-0 w-2 h-full bg-white animate-pulse"></div>
            </div>
            <p className="text-2xl md:text-3xl font-heading tracking-widest text-white/80">Critically Acclaimed. <span className="text-red-600">Audience Approved.</span></p>
          </div>

          <div className="space-y-12 animate-left">
            {/* Awards */}
            <div>
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-white/30 mb-6 border-b border-white/10 pb-3 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-600 rounded-sm"></span>
                Directorial Awards
              </h3>
              <div className="bg-white/[0.02] border border-white/5 border-l-2 border-l-red-600 p-8 rounded-r-sm hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-red-600/5 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                <p className="text-red-500 font-heading text-xl tracking-widest mb-3 relative z-10">Best Director (Film)</p>
                <p className="text-white/60 text-sm leading-relaxed relative z-10">
                  Blender’s Choice - The Daily Star OTT & Digital Content Awards (2024) for his groundbreaking web film, <strong className="text-white">Osomoy</strong>.
                </p>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-white/30 mb-6 border-b border-white/10 pb-3 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-600 rounded-sm"></span>
                Industry Milestones
              </h3>
              <div className="space-y-8">
                
                <div className="group pl-4 border-l border-white/10 hover:border-red-600/50 transition-colors">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-3 text-lg">
                    The Ultimate OTT Record Breaker
                  </h4>
                  <p className="text-white/50 text-sm leading-relaxed">
                    <strong className="text-red-500">Osomoy</strong> broke all-time viewership records on Bongo, driving over 300,000 new subscriptions and amassing 3.5 million minute views across 100+ countries in just eight days.
                  </p>
                </div>

                <div className="group pl-4 border-l border-white/10 hover:border-red-600/50 transition-colors">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-3 text-lg">
                    Beating His Own Best
                  </h4>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Before Osomoy, the record-holder for Bongo's highest-performing original content was Ome's own blockbuster series, <strong className="text-white">Hotel Relax</strong>.
                  </p>
                </div>

                <div className="group pl-4 border-l border-white/10 hover:border-red-600/50 transition-colors">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-3 text-lg">
                    Digital Dominance
                  </h4>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Awarded multiple YouTube Creator Awards (Silver & Gold Play Buttons) for Boom Films and his personal channels, consistently dominating Bangladesh's trending charts with tens of millions of views per episode.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Image Side */}
        <div className="w-full lg:w-1/2 animate-right">
          <div className="relative group perspective-1000">
            {/* Abstract geometric frame behind image */}
            <div className="absolute -inset-4 border border-red-600/30 transform translate-x-8 translate-y-8 -z-10 transition-transform duration-700 group-hover:translate-x-12 group-hover:translate-y-12 group-hover:border-red-600/60"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none"></div>
            
            <div className="overflow-hidden shadow-2xl relative">
              <img 
                src="/gallery/award.jpg" 
                alt="Kajal Arefin Ome Award" 
                className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Scanline overlay for cinematic feel */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50 z-20 pointer-events-none"></div>
            </div>
            
            {/* Floating Glassmorphism Badge */}
            <div className="absolute -left-4 -bottom-8 md:-left-12 md:top-1/2 md:-translate-y-1/2 z-30 bg-black/80 border border-white/10 p-6 shadow-[0_0_30px_rgba(220,38,38,0.15)] transform transition-transform group-hover:-translate-y-4 max-w-[200px]">
              <div className="w-8 h-1 bg-red-600 mb-4"></div>
              <p className="text-white/90 font-bold uppercase text-sm leading-snug mb-2">The Daily Star OTT Award</p>
              <p className="text-red-500 font-heading tracking-[0.3em] text-[10px]">WINNER '24</p>
            </div>
          </div>
        </div>

      </div>
    </SectionWrapper>
  );
};

export default Achievements;
