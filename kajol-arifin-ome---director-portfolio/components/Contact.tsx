
import React from 'react';
import SectionWrapper from './SectionWrapper';
import ApertureButton from './ApertureButton';

const Contact: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Production Message Received! Our team will get back to you soon.");
  };

  return (
    <SectionWrapper id="connect" className="min-h-screen flex items-center relative">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 -z-10 pointer-events-none"></div>
      
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
                  {['Instagram', 'Youtube', 'Facebook', 'Vimeo'].map(social => (
                    <a 
                      key={social} 
                      href="#" 
                      className="text-white/50 hover:text-red-600 transition-all duration-300 uppercase tracking-[0.3em] text-[10px] font-bold border-b border-white/10 pb-1"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="animate-right">
            <form onSubmit={handleSubmit} className="space-y-8 bg-white/[0.02] p-10 rounded-sm border border-white/10 backdrop-blur-sm relative overflow-hidden">
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
            Kajol Arifin Ome &copy; 2024 • Cinematic Portfolio
          </div>
          <div className="flex gap-8">
             <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 cursor-pointer hover:text-red-600 transition-colors">Privacy Policy</span>
             <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 cursor-pointer hover:text-red-600 transition-colors">Terms of Shoot</span>
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
