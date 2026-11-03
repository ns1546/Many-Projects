import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Trophy, Star, TrendingUp, Award, PlayCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import directorData from '../data/director.json';

const achievements = [
  {
    id: 1,
    title: "National Phenomenon",
    description: "Directed 'Bachelor Point', which became the most-watched and culturally impactful comedy series in the history of Bangladeshi television.",
    icon: Trophy,
    stat: "500M+ Views",
    year: "2018-2022"
  },
  {
    id: 2,
    title: "Record-Breaking Drama",
    description: "'Sorry Sir' achieved unprecedented success, sparking national conversations and breaking viewing speed records for a single drama.",
    icon: TrendingUp,
    stat: "Record Time",
    year: "2020"
  },
  {
    id: 3,
    title: "OTT Blockbuster",
    description: "Helmed 'Hotel Relax', which broke all previous streaming records on the Binge OTT platform upon its release.",
    icon: PlayCircle,
    stat: "#1 Streamed",
    year: "2023"
  },
  {
    id: 4,
    title: "Critical Acclaim",
    description: "Seamlessly transitioned from comedy to serious social tragedy with 'Oshomoy', proving his versatility and earning immense critical praise.",
    icon: Star,
    stat: "9.0/10 Rating",
    year: "2024"
  },
  {
    id: 5,
    title: "CJFB Performance Award",
    description: "Won Best Director for 'Sorry Sir' at the CJFB Performance Awards, solidifying his status as a top-tier director.",
    icon: Award,
    stat: "Best Director",
    year: "2020"
  }
];

export const achievementPhotos = [
  { id: 1, src: "/images/achievements/achievement_1.jpeg", title: "Award Ceremony", details: "Recognized for exceptional storytelling and direction in the year's top drama. This award reflects the dedication of the entire team." },
  { id: 2, src: "/images/achievements/achievement_2.jpeg", title: "Milestone Celebration", details: "Celebrating unprecedented success with the cast and crew. A moment of joy after months of hard work on set." },
  { id: 3, src: "/images/achievements/achievement_3.jpeg", title: "Press Conference", details: "Addressing the media during the grand premiere of the web series, discussing the creative process and vision." },
  { id: 4, src: "/images/achievements/achievement_4.jpeg", title: "Industry Recognition", details: "Honored by the media industry for contributing to modern entertainment and setting new benchmarks for quality." },
  { id: 5, src: "/images/achievements/achievement_5.jpeg", title: "Behind The Scenes", details: "A candid moment on set while directing a crucial scene, showcasing the intensive creative process." },
  { id: 6, src: "/images/achievements/achievement_6.jpeg", title: "Red Carpet Event", details: "Attending the annual film and television awards ceremony, surrounded by peers and industry veterans." }
];

const AchievementsPage: React.FC = () => {
  const { awards } = directorData;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo('.page-header',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
    );

    gsap.utils.toArray<HTMLElement>('.achievement-card').forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, scale: 0.95, y: 30 }, {
        opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
        delay: i * 0.1
      });
    });

    gsap.utils.toArray<HTMLElement>('.photo-card').forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
        delay: i * 0.1
      });
    });

    return () => { ScrollTrigger.getAll().forEach(st => { if (st.trigger && !document.contains(st.trigger)) st.kill(); }); };
  }, []);

  return (
    <>
      <PageTransition>
        <div className="bg-[#050505] min-h-screen pt-40 pb-28 px-6 md:px-12 relative overflow-hidden">
          {/* Background Accent */}
          <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="page-header mb-24">
              <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-4">Milestones & Records</p>
              <h1 className="text-5xl md:text-7xl font-heading text-white tracking-wider mb-6">Key Achievements</h1>
              <p className="text-white/40 max-w-2xl text-sm leading-relaxed">
                A look at the numbers, records, and milestones that have defined Kajal Arefin Ome's career, establishing him as a powerhouse in the Bangladeshi entertainment industry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((item) => (
                <div key={item.id} className="achievement-card group relative bg-[#0a0a0a] border border-white/5 hover:border-red-600/50 p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-red-600 group-hover:bg-red-600/10 transition-colors">
                        <item.icon size={24} />
                      </div>
                      <span className="text-white/20 text-xs font-mono tracking-widest">{item.year}</span>
                    </div>

                    <h3 className="text-white font-heading text-2xl tracking-widest mb-4 group-hover:text-red-500 transition-colors">{item.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed mb-8">{item.description}</p>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <p className="text-red-600 font-heading text-3xl tracking-wider">{item.stat}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Awards & Nominations ── */}
            <div className="mt-32 border-t border-white/5 pt-32">
              <div className="mb-12 text-center">
                <p className="text-red-600 font-heading tracking-[0.4em] uppercase text-sm mb-2">Recognition</p>
                <h2 className="text-4xl font-heading text-white tracking-wider">Awards & Nominations</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {awards.map((award, i) => (
                  <div key={i} className="group relative bg-[#0a0a0a] border border-white/5 hover:border-red-600/30 p-8 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
                    <div className="pl-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-heading ${award.status === 'Won' || award.status === 'Achieved' ? 'bg-red-600 text-white' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                          {award.status}
                        </span>
                        <span className="text-white/30 text-2xl font-heading">{award.year}</span>
                      </div>
                      <h3 className="text-white font-heading text-2xl tracking-widest mb-1">{award.name}</h3>
                      <p className="text-red-600 text-sm mb-1">{award.category}</p>
                      <p className="text-white/40 text-xs uppercase tracking-widest mb-4">{award.organization} · {award.project}</p>
                      <p className="text-white/50 text-sm leading-relaxed">{award.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Photo Gallery ── */}
            <div className="mt-32">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading text-white tracking-wider mb-4">Captured Moments</h2>
                <p className="text-white/40 max-w-2xl mx-auto text-sm leading-relaxed">
                  A visual journey through key awards, milestones, and memorable achievements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievementPhotos.map((photo) => (
                  <Link
                    key={photo.id}
                    to={`/achievements/photo/${photo.id}`}
                    className="photo-card relative group cursor-pointer overflow-hidden rounded-sm bg-[#0a0a0a] border border-white/5 block w-full aspect-[4/3] hover:-translate-y-1 transition-all duration-500"
                  >
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <h3 className="text-white font-heading text-xl tracking-wider mb-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">{photo.title}</h3>
                      <p className="text-white/60 text-xs line-clamp-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-75">{photo.details}</p>
                      <div className="mt-3 text-red-500 text-xs uppercase tracking-widest font-bold transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 delay-100">View Details →</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Contribution to Media Industry Timeline Tree ── */}
            <div className="mt-32">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading text-white tracking-wider mb-4">Contribution to Media Industry</h2>
                <p className="text-white/40 max-w-2xl mx-auto text-sm leading-relaxed">
                  Tracing the evolution of a visionary director and his profound impact on the landscape of Bangladeshi entertainment year by year.
                </p>
              </div>

              <div className="relative max-w-4xl mx-auto">
                {/* Center Line */}
                <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-red-600/50 via-white/10 to-transparent md:-translate-x-1/2" />

                <div className="space-y-16">
                  {[
                    { year: 2011, title: "Assistant Directorial Journey", desc: "Working intimately on set, mastering the craft and technical fundamentals of television production." },
                    { year: 2012, title: "Understanding the Audience", desc: "Observing audience psychology and honing narrative pacing through traditional television drama sets." },
                    { year: 2013, title: "Building Industry Networks", desc: "Collaborating with veteran actors and establishing key relationships that would form his future core team." },
                    { year: 2014, title: "Shaping Narrative Arcs", desc: "Taking on greater responsibilities in script development and managing complex shooting schedules." },
                    { year: 2015, title: "Transitioning to Direction", desc: "Preparing for the leap to independent direction by overseeing critical scenes and second unit shoots." },
                    { year: 2016, title: "The Directorial Debut", desc: "Stepped into the director's chair, introducing a fresh, conversational style of visual storytelling." },
                    { year: 2017, title: "Early Breakthroughs", desc: "Gained national recognition for distinct comedic timing, authentic dialogue, and relatable characters." },
                    { year: 2018, title: "The Birth of Bachelor Point", desc: "Launched Season 1 of the series that would permanently alter the landscape of Bangladeshi pop culture." },
                    { year: 2019, title: "Scaling the Phenomenon", desc: "Bachelor Point Season 2 shatters traditional television and YouTube viewership records." },
                    { year: 2020, title: "Record-Breaking Dramas", desc: "Released the critically acclaimed 'Sorry Sir', winning the CJFB Performance Award for Best Director." },
                    { year: 2021, title: "Digital Dominance", desc: "Consistently dominating YouTube trending charts with multiple back-to-back hit single dramas." },
                    { year: 2022, title: "The Climax of Comedy", desc: "Bachelor Point Season 4 concludes, leaving an unprecedented cultural legacy and fan following." },
                    { year: 2023, title: "OTT Revolution", desc: "Helmed 'Hotel Relax', breaking all previous streaming and subscription records on the Binge OTT platform." },
                    { year: 2024, title: "Versatility Unleashed", desc: "Directed the social tragedy 'Oshomoy', showcasing a masterful shift from comedy to serious drama." },
                    { year: 2025, title: "Expanding the Canvas", desc: "Setting the stage for massive scale web series, pushing the boundaries of local production quality." },
                    { year: 2026, title: "The Cinematic Vision", desc: "Pioneering the next era of Bangladeshi entertainment, bridging the gap between digital and theatrical." }
                  ].map((item, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <div key={item.year} className={`achievement-card relative flex flex-col md:flex-row items-start md:justify-between w-full group ${!isEven ? 'md:flex-row-reverse' : ''}`}>
                        <div className="absolute left-[28px] md:left-1/2 top-6 w-4 h-4 bg-[#050505] border-2 border-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 group-hover:scale-150 group-hover:bg-red-600 transition-all duration-300" />

                        <div className={`ml-16 md:ml-0 md:w-[45%] pt-1 ${isEven ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                          <h3 className="text-3xl font-heading text-red-600 tracking-wider mb-2">{item.year}</h3>
                          <p className="text-white/20 uppercase tracking-widest text-xs font-bold mb-4">{item.title}</p>
                        </div>

                        <div className={`ml-16 md:ml-0 md:w-[45%] bg-[#0a0a0a] border border-white/5 p-8 group-hover:border-white/20 transition-colors relative ${isEven ? 'md:pl-12' : 'md:pr-12 text-left md:text-right'}`}>
                          <div className={`absolute top-6 w-6 h-[2px] bg-white/10 hidden md:block ${isEven ? '-left-3 md:-left-[25px]' : 'right-auto md:-right-[25px]'}`} />
                          <h4 className="text-xl font-heading text-white mb-3">{item.title}</h4>
                          <p className="text-white/50 text-sm leading-relaxed mb-6">
                            {item.desc}
                          </p>
                          <Link to={`/achievements/contribution/${item.year}`} className="inline-flex items-center gap-2 text-red-600 text-[10px] uppercase tracking-widest hover:text-white transition-colors group/link">
                            Explore {item.year} Details
                            <span className="w-4 h-[1px] bg-red-600 group-hover/link:w-8 group-hover/link:bg-white transition-all" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default AchievementsPage;
