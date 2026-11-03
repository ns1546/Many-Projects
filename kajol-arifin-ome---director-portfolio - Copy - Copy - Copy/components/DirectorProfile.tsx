
import React from 'react';

const DirectorProfile: React.FC = () => {
  return (
    <section id="director-profile" className="relative bg-[#050505] overflow-hidden">
      {/* Full-bleed image with overlay */}
      <div className="relative w-full" style={{ minHeight: '90vh' }}>
        <img
          src="/gallery/ome.jpg"
          alt="Kajal Arefin Ome"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ filter: 'brightness(0.35)' }}
        />

        {/* Gradient bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-end h-full px-8 md:px-20 pb-24 pt-40" style={{ minHeight: '90vh' }}>
          {/* Red line accent */}
          <div className="w-16 h-1 bg-red-600 mb-6" />

          <p className="text-red-600 tracking-[0.5em] uppercase text-xs mb-4 font-heading">
            Director &amp; Storyteller
          </p>

          <h1 className="text-6xl md:text-9xl font-heading text-white leading-none mb-6">
            Kajal 
            <span className="text-red-600">Arefin</span> 
            Ome
          </h1>

          <p className="max-w-xl text-white/60 text-lg leading-relaxed">
            One of Bangladesh's most celebrated directors — crafting stories that resonate with millions.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-6 mt-10">
            {[
              { label: 'Bachelor Point', sub: 'Mega Sitcom' },
              { label: 'Millions', sub: 'Dedicated Fans' },
              { label: 'Multi-Genre', sub: 'OTT · TV · YouTube' },
            ].map((s) => (
              <div key={s.label} className="border border-white/10 px-6 py-3 backdrop-blur-sm">
                <p className="font-heading text-white text-lg">{s.label}</p>
                <p className="text-xs text-red-600 tracking-widest uppercase">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DirectorProfile;
