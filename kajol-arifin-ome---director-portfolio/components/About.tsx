
import React from 'react';
import SectionWrapper from './SectionWrapper';

const About: React.FC = () => {
  return (
    <SectionWrapper id="about" className="bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center animate-left">
           <h2 className="text-5xl md:text-7xl font-heading text-white">The Statement</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="animate-left">
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/director-portrait/600/800" 
                alt="Director Portrait" 
                className="w-full rounded shadow-2xl grayscale"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-r-4 border-b-4 border-red-600"></div>
            </div>
          </div>

          <div className="animate-right">
            <div className="space-y-6 text-lg text-white/80 leading-relaxed font-light">
              <p>
                <span className="text-red-600 font-heading text-2xl">[EXT. DHAKA - DAY]</span><br/>
                Kajol Arifin Ome isn't just a director; he's a chronicler of contemporary life. His lens focuses on the raw, the humorous, and the deeply human elements of society.
              </p>
              <p className="border-l-2 border-red-600 pl-6 italic">
                "My goal has always been to tell stories that resonate with the people who live them every day. If it makes them laugh, it's successful. If it makes them think, it's a masterpiece."
              </p>
              <p>
                From the massive digital success of 'Bachelor Point' to the poignant social commentary in 'Osomoy', Ome has redefined what digital entertainment looks like in the modern era.
              </p>
              <div className="pt-8">
                 <p className="uppercase tracking-[0.3em] text-sm text-red-600">Signature Style</p>
                 <div className="flex gap-4 mt-2">
                    <span className="bg-white/5 border border-white/10 px-4 py-2 rounded text-xs">Sharp Comedy</span>
                    <span className="bg-white/5 border border-white/10 px-4 py-2 rounded text-xs">Social Satire</span>
                    <span className="bg-white/5 border border-white/10 px-4 py-2 rounded text-xs">Cinematic Motion</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default About;
