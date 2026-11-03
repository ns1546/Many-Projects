import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PageTransition from '../components/PageTransition';

const StoriesBehindFramesPage: React.FC = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.fromTo('.frame-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
    
    gsap.utils.toArray<HTMLElement>('.frame-card').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, scale: 0.95 }, {
        opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
    
    return () => { ScrollTrigger.getAll().forEach(st => { if (st.trigger && !document.contains(st.trigger)) st.kill(); }); };
  }, []);

  const stories = [
    {
      id: 1,
      title: "The Unscripted Tears",
      project: "Bachelor Point Season 4",
      image: "/hero.png", // Using hero.png as placeholder, can be updated later
      story: "It was 2 AM in Noakhali. We were shooting the emotional farewell scene. I had given the actors specific lines, but when the camera rolled, the emotion was so raw that they completely deviated from the script. They were actually crying. I signaled the cameraman to keep rolling and not cut. That 3-minute continuous unscripted take became the most talked-about scene in the history of the series."
    },
    {
      id: 2,
      title: "Rain on Command",
      project: "Sorry Sir",
      image: "/hero.png",
      story: "We needed a rainy night for the climax. Our budget didn't allow for massive rain machines, so we relied on the local weather forecast. We waited for 5 days. On the 6th night, just as we were about to pack up in frustration, the sky broke open. The actors rushed to their marks. The panic, the cold, and the urgency you see on screen wasn't acting—it was survival."
    },
    {
      id: 3,
      title: "The Silent Stare",
      project: "Nishiddho",
      image: "/hero.png",
      story: "There is a shot where the protagonist just stares into the mirror for a full 45 seconds. The producer thought it was too long and would lose the audience. I fought to keep it in. That silence held the weight of the entire narrative. When it premiered, you could hear a pin drop in the hall during that exact shot."
    }
  ];

  return (
    <PageTransition>
      <div className="bg-[#050505] min-h-screen pt-40 pb-28 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-4">Visual Narratives</p>
            <h1 className="frame-title text-5xl md:text-7xl font-heading text-white tracking-wider">Stories Behind The Frames</h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mt-6">
              A photograph captures a single moment, but a frame from a film holds an entire memory. Here are the untold stories behind iconic shots.
            </p>
          </div>
          
          <div className="space-y-24">
            {stories.map((story) => (
              <div key={story.id} className="frame-card grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative group overflow-hidden">
                  <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  <img 
                    src={story.image} 
                    alt={story.title} 
                    className="w-full h-auto aspect-video object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <p className="bg-black/70 backdrop-blur text-white font-mono text-xs px-3 py-1 border border-white/20">
                      FRAME #{String(story.id).padStart(3, '0')}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-red-600 font-mono text-sm tracking-widest mb-3">{story.project}</p>
                  <h2 className="text-3xl md:text-4xl font-heading text-white tracking-wide mb-6">{story.title}</h2>
                  <p className="text-white/70 text-lg leading-relaxed">
                    {story.story}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StoriesBehindFramesPage;
