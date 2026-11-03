import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PageTransition from '../components/PageTransition';

const ScriptToScreenPage: React.FC = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.fromTo('.process-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
    
    gsap.utils.toArray<HTMLElement>('.process-step').forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, x: i % 2 === 0 ? -50 : 50 }, {
        opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });
    
    return () => { ScrollTrigger.getAll().forEach(st => { if (st.trigger && !document.contains(st.trigger)) st.kill(); }); };
  }, []);

  const steps = [
    {
      phase: "01. Idea",
      title: "The Spark of Inspiration",
      desc: "Every great story starts with an observation. Whether it's a conversation overheard at a tea stall in Dhaka or a deeply personal emotion, the idea must feel authentic to the cultural pulse."
    },
    {
      phase: "02. Script",
      title: "Structuring the Chaos",
      desc: "Writing is about discipline. Translating the raw idea into a structured narrative with distinct character arcs, sharp dialogues, and pacing that hooks the audience from page one."
    },
    {
      phase: "03. Casting",
      title: "Finding the Souls",
      desc: "A script is only as good as the actors who bring it to life. Casting is an intuitive process of matching the psychological profile of the character with the natural essence of the actor."
    },
    {
      phase: "04. Rehearsal",
      title: "Building Chemistry",
      desc: "Before the cameras roll, the actors must become the characters. Rehearsals are about breaking down walls, encouraging improvisation, and finding the unwritten magic between lines."
    },
    {
      phase: "05. Shooting",
      title: "Capturing the Moment",
      desc: "The set is where preparation meets reality. Lighting, camera angles, and raw performances merge. It requires extreme focus, adaptability, and an unyielding commitment to the vision."
    },
    {
      phase: "06. Editing",
      title: "The Final Rewrite",
      desc: "The editing room is where the true pacing of the film is born. Cutting away the excess, finding the perfect rhythm, and layering the sound design to evoke the intended emotional response."
    },
    {
      phase: "07. Release",
      title: "Giving it to the World",
      desc: "The nervous energy of the premiere. Marketing strategies are deployed, teasers are dropped, and the project transitions from being the director's secret to the audience's possession."
    },
    {
      phase: "08. Response",
      title: "The Ultimate Verdict",
      desc: "Audience reaction is the final piece of the puzzle. Reading comments, observing cultural impact, and seeing characters become memes or household names is the ultimate reward."
    }
  ];

  return (
    <PageTransition>
      <div className="bg-[#050505] min-h-screen pt-40 pb-28 px-6 md:px-12 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-4">The Creative Process</p>
            <h1 className="process-title text-5xl md:text-7xl font-heading text-white tracking-wider">From Script to Screen</h1>
          </div>
          
          <div className="relative">
            {/* Center line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 -translate-x-1/2" />
            
            <div className="space-y-12 md:space-y-0">
              {steps.map((step, i) => (
                <div key={i} className={`process-step relative flex flex-col md:flex-row items-center w-full ${i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                  
                  {/* Dot on line */}
                  <div className="hidden md:block absolute left-1/2 top-1/2 w-4 h-4 bg-[#050505] border-2 border-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
                  
                  <div className={`w-full md:w-[45%] bg-[#0a0a0a] border border-white/5 hover:border-red-600/30 p-8 transition-colors ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto md:text-right'}`}>
                    <p className="text-red-600 font-mono text-sm tracking-widest mb-2">{step.phase}</p>
                    <h3 className="text-2xl font-heading text-white tracking-wide mb-4">{step.title}</h3>
                    <p className="text-white/60 leading-relaxed">{step.desc}</p>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ScriptToScreenPage;
