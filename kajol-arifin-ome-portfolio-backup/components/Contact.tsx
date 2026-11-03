import React, { useState } from 'react';
import SectionWrapper from './SectionWrapper';
import ApertureButton from './ApertureButton';

const Contact: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Production Message Received! Our team will get back to you soon.");
  };

  return (
    <SectionWrapper id="connect" className="min-h-screen flex items-center relative">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 -z-10 pointer-events-none"></div>
      
      {/* ── Modal Overlay ── */}
      {activeModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            onClick={() => setActiveModal(null)}
          ></div>
          <div className="relative bg-[#0a0a0a] border border-white/10 p-8 md:p-12 max-w-2xl w-full shadow-[0_0_80px_rgba(229,9,20,0.2)] animate-up">
            <h3 className="text-4xl font-heading text-white mb-8 border-b border-white/10 pb-4">
              {activeModal === 'privacy' ? 'Privacy & IP Policy' : 'Terms of Production'}
            </h3>
            <div className="text-white/70 space-y-6 font-light leading-relaxed max-h-[60vh] overflow-y-auto modal-scroll pr-4">
              {activeModal === 'privacy' ? (
                <>
                  <section>
                    <h4 className="text-red-600 font-bold uppercase text-[10px] tracking-widest mb-2">Intellectual Property</h4>
                    <p>Every frame, script, character concept, and melodic score presented on this portfolio is the exclusive property of <strong>Kajal Arefin Ome</strong> and <strong>Boom Films</strong>. Unauthorized replication, redistribution, or modification of these assets is a direct violation of international copyright laws.</p>
                  </section>
                  <section>
                    <h4 className="text-red-600 font-bold uppercase text-[10px] tracking-widest mb-2">Data Protection</h4>
                    <p>We do not store cookies for tracking. Information submitted via the 'Inquiry' form is used solely for project communication. We do not sell, rent, or trade your contact info with third-party marketing firms.</p>
                  </section>
                  <section>
                    <h4 className="text-red-600 font-bold uppercase text-[10px] tracking-widest mb-2">Image Rights</h4>
                    <p>The director's likeness and all project screenshots are protected. Use of these images for AI training, derivative works, or promotional material without written consent is strictly prohibited.</p>
                  </section>
                </>
              ) : (
                <>
                   <div className="space-y-8">
                    <div className="border-l-2 border-red-600 pl-4">
                      <p className="text-white font-bold uppercase text-xs tracking-widest mb-1">Phase 1: Creative Strategy</p>
                      <p className="text-sm">Initial briefing involves script lock and creative alignment. Any fundamental changes post-concept approval may impact timelines and budget.</p>
                    </div>
                    <div className="border-l-2 border-red-600 pl-4">
                      <p className="text-white font-bold uppercase text-xs tracking-widest mb-1">Phase 2: Principal Photography</p>
                      <p className="text-sm">Production utilizes cinema-grade workflows (RED/Arri/Sony). Locations, talent, and logistics are finalized 14 days prior to the first take.</p>
                    </div>
                    <div className="border-l-2 border-red-600 pl-4">
                      <p className="text-white font-bold uppercase text-xs tracking-widest mb-1">Phase 3: Post-Production</p>
                      <p className="text-sm">Includes professional color grading (DaVinci), sound design, and VFX. Clients are entitled to two major revision cycles for digital content.</p>
                    </div>
                    <div className="border-l-2 border-red-600 pl-4">
                      <p className="text-white font-bold uppercase text-xs tracking-widest mb-1">Phase 4: Financials & Delivery</p>
                      <p className="text-sm">A 40% production retainer is required to lock calendar dates. Final masters are released only upon receipt of the final project milestone payment.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-10 flex justify-between items-center bg-white/5 p-4 border border-white/5">
               <p className="text-[10px] uppercase tracking-widest text-white/30 italic">Ref: Production Std_2024</p>
               <button 
                onClick={() => setActiveModal(null)}
                className="bg-red-600 text-white px-8 py-2 text-xs uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-red-600 transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)]"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-24 animate-left">
          <h2 className="text-7xl md:text-9xl font-heading mb-4 text-white opacity-90">Roll Credits</h2>
          <div className="flex items-center justify-center gap-4">
             <span className="h-[1px] w-12 bg-red-600"></span>
             <p className="text-red-600 tracking-[1.2em] uppercase text-xs font-bold">The Final Scene</p>
             <span className="h-[1px] w-12 bg-red-600"></span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-24">
          <div className="animate-left flex flex-col justify-center">
            <h3 className="text-4xl font-heading mb-12 text-white tracking-widest">Global Representation</h3>
            <div className="space-y-10">
              <div className="group cursor-pointer">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] mb-2 group-hover:text-red-600 transition-colors">Direct Link</p>
                <p className="text-2xl md:text-3xl font-light hover:pl-4 transition-all duration-500">hello@omeproductions.com</p>
              </div>
              
              <div className="group cursor-pointer">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] mb-2 group-hover:text-red-600 transition-colors">Agent / Media</p>
                <p className="text-2xl md:text-3xl font-light hover:pl-4 transition-all duration-500">+880 1XXX XXXXXX</p>
              </div>

              <div className="pt-10">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] mb-6">Digital Footprint</p>
                <div className="flex flex-wrap gap-8">
                  {[
                    { label: 'FB (Official)', url: 'https://facebook.com/kajal.arefin.ome' },
                    { label: 'Instagram', url: 'https://instagram.com/kajalarefinome' },
                    { label: 'YouTube (Boom Films)', url: 'https://youtube.com/@BoomFilmsOfficial' },
                    { label: 'YouTube (Director)', url: 'https://youtube.com/@KajalArefinOmeOfficial' },
                    { label: 'FB (Boom Films)', url: 'https://facebook.com/Boomfilmsofficial' },
                  ].map(social => (
                    <a 
                      key={social.label} 
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 hover:text-red-600 transition-all duration-300 uppercase tracking-[0.2em] text-[10px] font-bold border-b border-white/10 pb-1"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="animate-right">
            <form onSubmit={handleSubmit} className="space-y-8 bg-white/[0.02] p-10 rounded-sm border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
              <p className="font-heading text-xl text-white/40 mb-4 tracking-widest uppercase">New Production Inquiry</p>
              
              <div className="space-y-6">
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:border-red-600 outline-none transition-all text-lg placeholder:text-white/10"
                  />
                </div>
                <div className="relative">
                  <input 
                    required
                    type="email" 
                    placeholder="Studio / Email Address" 
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:border-red-600 outline-none transition-all text-lg placeholder:text-white/10"
                  />
                </div>
                <div className="relative">
                  <textarea 
                    required
                    rows={3} 
                    placeholder="The Brief / Project Details" 
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:border-red-600 outline-none transition-all text-lg placeholder:text-white/10 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-6">
                <ApertureButton label="Initiate Action" className="w-full" />
              </div>
            </form>
          </div>
        </div>
        
        {/* Cinematic Footer */}
        <div className="mt-40 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 animate-left">
          <div className="text-[9px] uppercase tracking-[0.8em] text-white/20">
            Kajal Arefin Ome &copy; 2024 • Cinematic Portfolio
          </div>
          <div className="flex gap-8">
             <span 
               onClick={() => setActiveModal('privacy')}
               className="text-[9px] uppercase tracking-[0.4em] text-white/40 cursor-pointer hover:text-red-600 transition-colors"
             >
               Privacy Policy
             </span>
             <span 
               onClick={() => setActiveModal('terms')}
               className="text-[9px] uppercase tracking-[0.4em] text-white/40 cursor-pointer hover:text-red-600 transition-colors"
             >
               Terms of Shoot
             </span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.4em] text-white/40">
             Dhaka, Bangladesh
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Contact;
