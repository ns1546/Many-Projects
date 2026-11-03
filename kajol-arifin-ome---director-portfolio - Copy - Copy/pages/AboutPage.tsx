import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import timelineData from '../data/timeline.json';
import directorData from '../data/director.json';

const AboutPage: React.FC = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo('.about-title', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 });
    gsap.utils.toArray<HTMLElement>('.fade-in').forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
    return () => { ScrollTrigger.getAll().forEach(st => { if (st.trigger && !document.contains(st.trigger)) st.kill(); }); };
  }, []);

  const { philosophy, firsts, milestones } = directorData;

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-40 pb-28 overflow-hidden border-b border-white/5">

        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">The Director</p>
          <h1 className="about-title text-6xl md:text-9xl font-heading text-white tracking-wider leading-none mb-6">
            Kajal Arefin Ome
          </h1>
          <p className="text-white/50 text-xl max-w-2xl leading-relaxed">
            Storyteller. Filmmaker. Cultural Architect. Over a decade of creating stories that define Bangladeshi popular culture — with honesty, humor, and courage.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/about/timeline" className="px-6 py-3 bg-red-600 text-white font-heading tracking-widest uppercase text-sm hover:bg-red-700 transition-colors">
              Career Timeline
            </Link>
            <Link to="/about/philosophy" className="px-6 py-3 border border-white/20 text-white/70 font-heading tracking-widest uppercase text-sm hover:border-white hover:text-white transition-all">
              Director's Philosophy
            </Link>
            <Link to="/about/quotes" className="px-6 py-3 border border-white/20 text-white/70 font-heading tracking-widest uppercase text-sm hover:border-white hover:text-white transition-all">
              Famous Quotes
            </Link>
          </div>
        </div>
      </section>

      {/* ── Biography ── */}
      <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-3 fade-in">
            <h2 className="text-4xl font-heading text-white tracking-widest mb-8">Biography</h2>
            <div className="space-y-6 text-white/60 text-lg leading-relaxed">
              <p>
                Kajal Arefin Ome is Bangladesh's most-watched director — the creative force behind some of the country's most beloved and consequential media properties. Born and raised in Dhaka, he developed a passion for storytelling through theatre, literature, and the vibrant cultural life of the city.
              </p>
              <p>
                After studying at university, he entered the television industry as an assistant director, where he spent years learning his craft from experienced directors before stepping behind the lens himself. His early independent work signaled the arrival of a distinctly original voice — one that could find humor in hardship, tenderness in conflict, and universal truth in deeply local stories.
              </p>
              <p>
                In 2015, he founded <strong className="text-white">Boom Films</strong>, his own production company, to create content free from network restrictions. The move was an artistic declaration — and it paid off beyond any expectation. Bachelor Point, launched in 2018, became the most-watched web series in Bangladeshi history, spawning five seasons and a devoted following that transcended generations and demographics.
              </p>
              <p>
                But Ome is not a man defined by one success. Sorry Sir (2020), a 43-minute single drama, became the fastest Bangladeshi drama to reach 10 million views and won him the CJFB Performance Award for Best Director. Girgiti (2022) proved his range in the thriller genre. Nishiddho (2023) showed his courage in addressing social taboos.
              </p>
              <p>
                Today, Kajal Arefin Ome stands at the forefront of a new era of Bangladeshi storytelling — with a feature film in development, multiple OTT projects in production, and a legacy that has permanently altered the landscape of his country's creative culture.
              </p>
            </div>
          </div>
          <div className="lg:col-span-2 fade-in">
            <div className="relative">
              <img src="/gallery/ome-about.jpeg" alt="Kajal Arefin Ome" className="w-full grayscale border border-white/10" />
              <div className="absolute -bottom-4 -left-4 border border-red-600/30 w-full h-full -z-10" />
            </div>
            {/* Quick facts */}
            <div className="mt-8 bg-[#0a0a0a] border border-white/5 p-8">
              <h3 className="text-white font-heading tracking-widest uppercase text-sm mb-6 border-b border-white/10 pb-3">Quick Facts</h3>
              <ul className="space-y-4">
                {[
                  { label: 'Full Name', value: 'Kajal Arefin Ome' },
                  { label: 'Nationality', value: 'Bangladeshi' },
                  { label: 'Base', value: 'Dhaka, Bangladesh' },
                  { label: 'Company', value: 'Boom Films' },
                  { label: 'Career Started', value: '2013' },
                  { label: 'Total Views', value: '500M+' },
                  { label: 'Genre Range', value: 'Comedy, Drama, Thriller, Social' },
                  { label: 'Language', value: 'Bangla' },
                ].map(f => (
                  <li key={f.label} className="flex justify-between text-sm">
                    <span className="text-white/30 uppercase tracking-widest text-[10px]">{f.label}</span>
                    <span className="text-white/70">{f.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Firsts ── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <div className="fade-in mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-2">Career Milestones</p>
            <h2 className="text-4xl md:text-5xl font-heading text-white tracking-wider">My Firsts</h2>
          </div>
          <Link to="/about/firsts" className="text-sm uppercase tracking-widest text-white/40 hover:text-red-600 transition-colors border-b border-white/20 hover:border-red-600 pb-1 self-start md:self-auto">
            View All Firsts →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firsts.map((item, i) => (
            <div key={i} className="fade-in group bg-[#0a0a0a] border border-white/5 hover:border-red-600/30 p-8 transition-colors">
              <div className="text-red-600 font-heading text-5xl mb-2 opacity-20 group-hover:opacity-40 transition-opacity">
                {String(i + 1).padStart(2, '0')}
              </div>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">{item.year}</p>
              <h3 className="text-white font-heading text-xl tracking-widest mb-3">{item.milestone}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Philosophy Teaser ── */}
      <section className="py-24 px-6 md:px-12 bg-[#080808] border-b border-white/5">
        <div className="max-w-7xl mx-auto fade-in text-center">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-4">Director's Desk</p>
          <h2 className="text-4xl md:text-6xl font-heading text-white tracking-wider mb-6">How I Think About Storytelling</h2>
          <p className="text-white/50 max-w-2xl mx-auto mb-10">
            In his own words — the principles, beliefs, and creative philosophy that guide every story Kajal Arefin Ome tells.
          </p>
          <blockquote className="text-2xl md:text-4xl font-display text-white/80 italic max-w-3xl mx-auto mb-8">
            "{philosophy[0].answer.split('.')[0]}."
          </blockquote>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/about/philosophy" className="inline-block px-8 py-3 border border-red-600 text-red-600 font-heading tracking-widest uppercase text-sm hover:bg-red-600 hover:text-white transition-all">
              Read Full Philosophy
            </Link>
            <Link to="/about/desk" className="inline-block px-8 py-3 border border-white/20 text-white/70 font-heading tracking-widest uppercase text-sm hover:border-white hover:text-white transition-all">
              Read Director's Notes
            </Link>
          </div>
        </div>
      </section>

      {/* ── Timeline Teaser ── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="fade-in mb-12">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-2">A Life in Film</p>
          <h2 className="text-4xl md:text-5xl font-heading text-white tracking-wider">Career at a Glance</h2>
        </div>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-red-600 via-red-600/30 to-transparent" />
          <div className="space-y-8 pl-16">
            {timelineData.slice(0, 5).map((item, i) => (
              <div key={i} className="fade-in relative group">
                <div className="absolute -left-10 top-1 w-3 h-3 rounded-full bg-red-600 group-hover:scale-150 transition-transform" />
                <p className="text-red-600 font-heading tracking-widest text-sm mb-1">{item.year}</p>
                <h3 className="text-xl font-heading text-white tracking-widest mb-1">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 ml-16">
            <Link to="/about/timeline" className="text-sm uppercase tracking-widest text-white/40 hover:text-red-600 transition-colors border-b border-white/20 hover:border-red-600 pb-1">
              Full Career Timeline →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .font-display { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default AboutPage;
