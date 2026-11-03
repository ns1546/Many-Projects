import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PageTransition from '../components/PageTransition';

const DirectorDeskPage: React.FC = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.fromTo('.desk-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
    
    gsap.utils.toArray<HTMLElement>('.desk-article').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
    
    return () => { ScrollTrigger.getAll().forEach(st => { if (st.trigger && !document.contains(st.trigger)) st.kill(); }); };
  }, []);

  const articles = [
    {
      date: "Oct 2023",
      title: "The Reality of Comedy",
      excerpt: "People think comedy is just about making people laugh. But the best comedy comes from pain. It comes from the struggles of daily life that we all share. When I write a comedic scene, I am actually looking for the tragedy beneath it.",
      content: "When we started shooting Bachelor Point, the goal wasn't just to throw punchlines. It was to reflect the absolute chaos of bachelor life in Dhaka. The struggles with rent, the unspoken brotherly bonds, the messy relationships. Comedy acts as the sugar coating for the bitter pill of reality. If you look closely at my work, the characters who laugh the loudest are usually the ones hiding the deepest insecurities. That's what makes them human. That's why the audience connects with them on a visceral level."
    },
    {
      date: "Mar 2022",
      title: "Directing the Unspoken",
      excerpt: "Silence is often louder than dialogue. In a high-stakes emotional scene, what the actors don't say matters more than the script.",
      content: "I always tell my actors to feel the space between the words. A glance, a slight hesitation, the way someone holds their breath—these micro-expressions tell the true story. In my darker projects, like Girgiti or Nishiddho, we relied heavily on atmospheric tension rather than exposition. Trusting the audience to understand the subtext is the biggest leap of faith a director can take, but it's also the most rewarding."
    },
    {
      date: "Jan 2021",
      title: "Why I Founded Boom Films",
      excerpt: "Creative freedom isn't given; it's taken. You have to build your own ecosystem to protect your vision.",
      content: "Working under traditional constraints teaches you discipline, but it can also stifle your most daring ideas. I created Boom Films not just as a production house, but as a safe haven for ideas that seemed 'too risky' for mainstream networks. It allowed me to push the boundaries of language, themes, and narrative structures in Bangladeshi media. Owning the means of production is the ultimate creative freedom."
    }
  ];

  return (
    <PageTransition>
      <div className="bg-[#050505] min-h-screen pt-40 pb-28 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-4">Essays & Thoughts</p>
          <h1 className="desk-title text-5xl md:text-7xl font-heading text-white tracking-wider mb-20">From the Director's Desk</h1>
          
          <div className="space-y-16">
            {articles.map((article, i) => (
              <article key={i} className="desk-article border-l border-red-600/50 pl-8 md:pl-12 py-2">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-mono">{article.date}</p>
                <h2 className="text-3xl md:text-4xl font-heading text-white tracking-wide mb-6">{article.title}</h2>
                <div className="text-xl text-white/80 font-serif italic mb-6 leading-relaxed border-b border-white/10 pb-6">
                  "{article.excerpt}"
                </div>
                <div className="text-white/60 text-lg leading-relaxed space-y-4">
                  <p>{article.content}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default DirectorDeskPage;
