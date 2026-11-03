import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PageTransition from '../components/PageTransition';

const yearData: Record<string, { title: string, quote: string, paragraphs: string[] }> = {
  "2011": {
    title: "Assistant Directorial Journey",
    quote: "The set is a classroom where mistakes cost money. I was determined to never make the same mistake twice.",
    paragraphs: [
      "In 2011, Kajal Arefin Ome stepped onto a professional television set not as a director, but as a student of the craft. Operating as an Assistant Director (AD), he immersed himself in the relentless, high-pressure environment of daily television production.",
      "During this time, he was primarily responsible for ensuring the technical aspects of the shoot ran smoothly. From organizing call sheets to communicating the director's vision to the cast and crew, he learned the vital art of crisis management.",
      "More importantly, this year served as a masterclass in audience psychology. He observed which dialogues resonated, which pacing kept the crew engaged, and how traditional directors approached melodrama—insights that would later inform his revolutionary comedic style."
    ]
  },
  "2012": {
    title: "Understanding the Audience",
    quote: "You have to know the rules perfectly before you can break them effectively.",
    paragraphs: [
      "By 2012, Ome was deeply embedded in the mechanics of traditional television drama. While many ADs focus solely on the technical, Ome began analyzing the narrative structure.",
      "He noticed a recurring pattern: the Bangladeshi audience was hungry for authenticity, yet the industry was feeding them heightened, unrealistic melodrama.",
      "This realization was a turning point. He began making mental notes on how to script conversations that sounded like real people talking at a local tea stall rather than actors reading from a teleprompter."
    ]
  },
  "2013": {
    title: "Building Industry Networks",
    quote: "Filmmaking is not a solo endeavor. The crew you build is the family you go to war with.",
    paragraphs: [
      "2013 was characterized by the forging of critical industry relationships. As his reputation as a reliable and visionary AD grew, he began collaborating with veteran actors and establishing rapport with upcoming talents.",
      "Many of the actors who would later become household names in 'Bachelor Point' crossed paths with Ome during this period.",
      "He learned how to direct actors not by commanding them, but by understanding their psychological triggers and making them comfortable enough to improvise."
    ]
  },
  "2014": {
    title: "Shaping Narrative Arcs",
    quote: "The script is just the skeleton. The pacing is the heartbeat.",
    paragraphs: [
      "Taking on greater responsibilities in 2014, Ome became deeply involved in script development and pacing for major telefilms.",
      "Directors began relying on his input for structural flow and dialogue punching. He was instrumental in managing complex shooting schedules, proving his ability to handle logistics without compromising creative integrity."
    ]
  },
  "2015": {
    title: "Transitioning to Direction",
    quote: "I knew I was ready. I just needed the right story to tell.",
    paragraphs: [
      "In 2015, the transition from AD to independent director began taking shape. Ome was frequently trusted to oversee critical scenes and second unit shoots.",
      "He used these opportunities to experiment with camera angles, lighting setups, and comedic timing, developing a visual signature that was distinctly modern and energetic."
    ]
  },
  "2016": {
    title: "The Directorial Debut",
    quote: "My first " + "Action!" + " was the culmination of thousands of hours of silent observation.",
    paragraphs: [
      "2016 marked the official directorial debut of Kajal Arefin Ome. Stepping into the director's chair, he introduced a fresh, conversational style of visual storytelling.",
      "His early directorial works immediately stood out. They were stripped of the dramatic background scores and exaggerated reactions that plagued the industry, replacing them with situational humor and grounded reality."
    ]
  },
  "2017": {
    title: "Early Breakthroughs",
    quote: "Comedy isn't about telling jokes. It's about characters taking themselves too seriously in absurd situations.",
    paragraphs: [
      "Gaining national recognition, 2017 saw Ome refining his distinct comedic timing. His single dramas became viral hits on YouTube.",
      "Audiences praised the authentic dialogue and deeply relatable characters. He proved that high-budget sets were secondary to brilliant character writing and natural acting."
    ]
  },
  "2018": {
    title: "The Birth of Bachelor Point",
    quote: "We didn't know we were making history. We just wanted to make something that felt like us.",
    paragraphs: [
      "2018 permanently altered the landscape of Bangladeshi pop culture with the launch of 'Bachelor Point' Season 1.",
      "Ome dismantled the rigid tropes of TV dramas, introducing a raw, conversational style. The characters of Kabila, Shuvo, and Habu became instantly iconic, and the show's catchphrases permeated everyday street dialogue."
    ]
  },
  "2019": {
    title: "Scaling the Phenomenon",
    quote: "The pressure wasn't to make it funnier; the pressure was to keep it real.",
    paragraphs: [
      "'Bachelor Point' Season 2 launched in 2019, shattering traditional television and YouTube viewership records.",
      "The show transitioned from a hit comedy to a cultural movement. Ome expertly balanced the expanding cast, ensuring each character had a distinct, evolving arc while maintaining the show's chaotic charm."
    ]
  },
  "2020": {
    title: "Record-Breaking Dramas",
    quote: "I wanted to prove that my storytelling could evoke tears just as easily as laughter.",
    paragraphs: [
      "Amidst the success of his comedy series, 2020 saw Ome release the critically acclaimed 'Sorry Sir'.",
      "The drama sparked national conversations and won him the CJFB Performance Award for Best Director, cementing his status as a versatile, top-tier director capable of handling profound emotional weight."
    ]
  },
  "2021": {
    title: "Digital Dominance",
    quote: "YouTube is the new television. The audience decides what's prime time.",
    paragraphs: [
      "In 2021, Ome consistently dominated YouTube trending charts with multiple back-to-back hit single dramas.",
      "He mastered the digital algorithm not through clickbait, but through high-retention storytelling. His works guaranteed massive concurrent viewership during premieres, a feat rarely seen in the industry."
    ]
  },
  "2022": {
    title: "The Climax of Comedy",
    quote: "Every great story must have a poignant ending.",
    paragraphs: [
      "'Bachelor Point' Season 4 concluded in 2022, leaving an unprecedented cultural legacy.",
      "The finale was an emotional event for millions of fans, proving that a comedy series could forge a deep, empathetic connection with its audience."
    ]
  },
  "2023": {
    title: "OTT Revolution",
    quote: "Streaming platforms allow us to push the boundaries of production without the censorship of traditional TV.",
    paragraphs: [
      "Helming the web series 'Hotel Relax', Ome broke all previous streaming and subscription records on the Binge OTT platform in 2023.",
      "The project set new benchmarks for production quality, lighting, and pacing in the Bangladeshi OTT space, forcing the entire industry to elevate its standards."
    ]
  },
  "2024": {
    title: "Versatility Unleashed",
    quote: "Art must reflect society, even the parts that are uncomfortable to look at.",
    paragraphs: [
      "2024 was defined by the release of 'Oshomoy', a social tragedy that showcased Ome's masterful shift from comedy to serious drama.",
      "He used his massive platform to reflect society's harsh realities, proving that commercial success and meaningful, hard-hitting art are not mutually exclusive."
    ]
  },
  "2025": {
    title: "Expanding the Canvas",
    quote: "We are no longer just competing locally. We are building for a global audience.",
    paragraphs: [
      "Setting the stage for massive scale web series, 2025 sees Ome pushing the boundaries of local production quality.",
      "Engaging in international collaborations and utilizing advanced cinematic technology, he is redefining what a Bangladeshi production can look like."
    ]
  },
  "2026": {
    title: "The Cinematic Vision",
    quote: "The big screen is the ultimate canvas. It's time to bring our stories to the cinema.",
    paragraphs: [
      "Looking ahead to 2026, Ome is pioneering the next era of Bangladeshi entertainment, bridging the gap between digital dominance and theatrical releases.",
      "His cinematic vision promises to combine his unmatched understanding of the local audience with grand-scale cinematic execution."
    ]
  }
};

const MediaContributionPage: React.FC = () => {
  const { year } = useParams<{ year: string }>();
  
  const data = year && yearData[year] ? yearData[year] : {
    title: "A Legacy of Storytelling",
    quote: "From his early days as an assistant director to becoming a pioneer of the digital era, Kajal Arefin Ome's contribution to the entertainment industry is a story of relentless passion.",
    paragraphs: [
      "Please select a specific year from the timeline to view the detailed contributions."
    ]
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.fromTo('.article-header', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
    );
    
    gsap.utils.toArray<HTMLElement>('.article-section').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });
    
    return () => { ScrollTrigger.getAll().forEach(st => { if (st.trigger && !document.contains(st.trigger)) st.kill(); }); };
  }, [year]);

  return (
    <PageTransition>
      <div className="bg-[#050505] min-h-screen pt-40 pb-28 px-6 md:px-12 relative">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Link to="/achievements" className="text-white/40 hover:text-red-600 font-heading text-xs tracking-[0.2em] uppercase transition-colors mb-12 inline-block">
            ← Back to Timeline
          </Link>
          
          <div className="article-header mb-20 text-center">
            <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-6">Year in Focus: {year || "Overview"}</p>
            <h1 className="text-4xl md:text-6xl font-heading text-white tracking-wider leading-tight mb-8">
              {data.title}
            </h1>
          </div>

          <div className="space-y-16">
            <section className="article-section bg-[#0a0a0a] border-l-4 border-red-600 p-10 mb-12 shadow-2xl">
              <p className="text-white/80 text-xl leading-loose italic font-serif">
                "{data.quote}"
              </p>
              <p className="text-white/30 text-sm mt-4 uppercase tracking-widest font-heading">— Kajal Arefin Ome</p>
            </section>

            <section className="article-section">
              <div className="prose prose-invert max-w-none text-white/70 leading-loose text-lg">
                {data.paragraphs.map((p, i) => (
                  <p key={i} className="mb-8">{p}</p>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default MediaContributionPage;


