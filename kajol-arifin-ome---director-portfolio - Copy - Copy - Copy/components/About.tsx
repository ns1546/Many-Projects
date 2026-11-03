
import React from 'react';
import SectionWrapper from './SectionWrapper';

const highlights = [
  {
    icon: '🎬',
    title: 'The Mind Behind the Hits',
    desc: 'Creator and director of the multi-season blockbuster Bachelor Point, a defining show in Bangladeshi pop culture.',
  },
  {
    icon: '🎭',
    title: 'Versatile Storyteller',
    desc: 'Seamlessly transitions between massively popular YouTube dramas, television specials, and premium OTT web films.',
  },
  {
    icon: '🏆',
    title: 'Industry Innovator',
    desc: 'Known for bringing out career-defining performances from actors and consistently breaking viewership records.',
  },
];

const About: React.FC = () => {
  return (
    <SectionWrapper id="about" className="bg-[#050505]">

      {/* ── Section Title ── */}
      <div className="mb-20 text-center animate-left">
        <h2 className="text-5xl md:text-7xl font-heading text-white">Director's Profile</h2>
        <div className="w-24 h-1 bg-red-600 mx-auto mt-4" />
      </div>

      {/* ── Two-column layout: Text left, Image right ── */}
      <div className="grid md:grid-cols-2 gap-16 items-center mb-20">

        {/* Left — About text */}
        <div className="animate-left space-y-6">
          <div>
            <p className="text-red-600 tracking-[0.4em] uppercase text-xs mb-3">About Kajal Arefin Ome</p>
            <h3 className="text-3xl md:text-4xl font-heading text-white leading-snug mb-6">
              Crafting Stories that Resonate with Millions
            </h3>
          </div>

          <p className="text-white/70 text-lg leading-relaxed">
            Kajal Arefin Ome is one of Bangladesh's most celebrated and influential contemporary directors, known for redefining modern television and digital entertainment. With a keen eye for the everyday nuances of youth and family life, he creates characters that feel incredibly real and stories that leave a lasting cultural footprint.
          </p>

          <p className="text-white/70 text-lg leading-relaxed">
            He is the visionary behind the monumental hit sitcom <span className="text-white font-semibold">Bachelor Point</span>, a massive phenomenon that captured the hearts of millions across the country and created an unprecedented, dedicated fanbase. From record-breaking mega-serials to highly anticipated OTT projects like <span className="text-white font-semibold">How Sweet</span> and beloved dramas like <span className="text-white font-semibold">Hotath Dekha</span>, his portfolio spans a dynamic range of genres, blending comedy, romance, and slice-of-life drama.
          </p>

          <p className="text-white/70 text-lg leading-relaxed">
            Whether directing a high-energy ensemble cast or a deeply emotional narrative, Ome’s signature style relies on authentic dialogue, relatable situations, and an undeniable pulse on what modern audiences want to see.
          </p>
        </div>

        {/* Right — ome.jpg */}
        <div className="animate-right">
          <div className="relative">
            <img
              src="/gallery/ome.jpg"
              alt="Kajal Arefin Ome"
              className="w-full h-auto rounded shadow-2xl border border-white/10"
            />
            {/* Red border accent */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border-l-4 border-b-4 border-red-600 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Key Highlights ── */}
      <div className="border-t border-white/10 pt-16">
        <p className="text-red-600 tracking-[0.4em] uppercase text-sm mb-12 text-center text-white">Key Highlights:</p>
        <div className="grid md:grid-cols-3 gap-8">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="group border border-white/10 p-8 hover:border-red-600/60 transition-all duration-500 rounded-sm bg-[#0a0a0a]"
            >
              <div className="text-4xl mb-6">{h.icon}</div>
              <h4 className="font-heading text-white text-xl mb-3 group-hover:text-red-500 transition-colors duration-300">
                {h.title}
              </h4>
              <p className="text-white/60 text-base leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </SectionWrapper>
  );
};

export default About;
