import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import directorData from '../data/director.json';

const QuotesPage: React.FC = () => {
  const [featured, setFeatured] = useState(0);
  const { quotes } = directorData;

  useEffect(() => {
    const t = setInterval(() => setFeatured(f => (f + 1) % quotes.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/about" className="text-white/30 text-xs uppercase tracking-widest hover:text-white">About</Link>
            <span className="text-white/20">→</span>
            <span className="text-red-600 text-xs uppercase tracking-widest">Quotes</span>
          </div>
          <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">In His Own Words</p>
          <h1 className="text-6xl md:text-9xl font-heading text-white tracking-wider leading-none">Words That Define</h1>
        </div>
      </section>

      {/* Featured rotating quote */}
      <section className="py-24 px-6 md:px-12 bg-[#080808] border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[100px] font-heading text-red-600/10 leading-none">"</div>
          <div key={featured} className="animate-fadeInUp">
            <blockquote className="text-3xl md:text-5xl font-display text-white leading-tight -mt-12 mb-8">
              {quotes[featured].text}
            </blockquote>
            <p className="text-white/30 text-xs uppercase tracking-widest">{quotes[featured].context}</p>
          </div>
          <div className="flex justify-center gap-2 mt-10">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => setFeatured(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === featured ? 'bg-red-600 w-6' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* All quotes grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {quotes.map((q, i) => (
            <div key={i} className="group bg-[#0a0a0a] border border-white/5 hover:border-red-600/30 p-10 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-4 right-6 text-[80px] font-heading text-red-600/5 leading-none select-none">"</div>
              <p className="text-white/25 text-[10px] uppercase tracking-widest mb-4">{q.context}</p>
              <blockquote className="text-white/80 text-xl md:text-2xl font-display leading-snug group-hover:text-white transition-colors">
                "{q.text}"
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <span className="w-6 h-[1px] bg-red-600/50" />
                <span className="text-red-600 text-xs uppercase tracking-widest font-heading">Kajal Arefin Ome</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .font-display { font-family: 'Playfair Display', serif; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default QuotesPage;
