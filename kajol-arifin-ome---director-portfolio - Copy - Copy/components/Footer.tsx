import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Film, Send, ChevronRight, MessageSquare } from 'lucide-react';
import directorData from '../data/director.json';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const YoutubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);

const Footer: React.FC = () => {
  const { socialMedia, contact } = directorData;
  const [msgStatus, setMsgStatus] = useState<string>('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setMsgStatus('Sending...');
    setTimeout(() => {
      setMsgStatus('Message Sent! Thank you.');
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setMsgStatus(''), 3000);
    }, 1000);
  };

  return (
    <footer className="bg-[#030303] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Socials */}
          <div className="md:col-span-1">
            <div className="font-heading text-5xl tracking-tighter text-white mb-4">
              OME<span className="text-red-600">.</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-6">
              Official portfolio of Director Kajal Arefin Ome — storyteller, filmmaker, and the creative force behind Bangladesh's most-watched content.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Facebook', url: socialMedia.facebook, Icon: FacebookIcon },
                { label: 'Instagram', url: socialMedia.instagram, Icon: InstagramIcon },
                { label: 'YouTube (Director)', url: socialMedia.youtube_director, Icon: YoutubeIcon },
                { label: 'YouTube (Boom Films)', url: socialMedia.youtube_boom, Icon: YoutubeIcon },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-xs tracking-widest text-white/40 hover:text-red-600 transition-colors w-fit group"
                >
                  <span className="group-hover:scale-110 transition-transform"><s.Icon /></span>
                  <span className="uppercase">{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white/30 text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2"><ChevronRight size={14} /> Navigation</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Works & Filmography', path: '/works' },
                { label: 'About the Director', path: '/about' },
                { label: 'Career Timeline', path: '/about/timeline' },
                { label: 'Director\'s Philosophy', path: '/about/philosophy' },
                { label: 'Archive & BTS', path: '/archive' },
                { label: 'Collaborators', path: '/collaborators' },
                { label: 'Press & Awards', path: '/press-awards' },
                { label: 'Photo Gallery', path: '/gallery' },
              ].map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white/30 text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin size={14} /> Contact Details</h4>
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1.5 flex items-center gap-1.5"><Mail size={12} /> Email</p>
                <p className="text-white/60 text-sm hover:text-white transition-colors cursor-pointer">{contact.email}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1.5 flex items-center gap-1.5"><Mail size={12} /> Hotmail</p>
                <p className="text-white/60 text-sm hover:text-white transition-colors cursor-pointer">{contact.hotmail}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1.5 flex items-center gap-1.5">📞 Phone</p>
                <p className="text-white/60 text-sm hover:text-white transition-colors cursor-pointer">+880 1711-000000</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1.5 flex items-center gap-1.5"><MapPin size={12} /> Location</p>
                <p className="text-white/60 text-sm">{contact.location}</p>
              </div>
            </div>
          </div>

          {/* Quick Message Box */}
          <div>
            <h4 className="text-white/30 text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2"><MessageSquare size={14} /> Quick Message</h4>
            <form onSubmit={handleSend} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Your Email"
                className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-600 transition-colors"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number"
                className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-600 transition-colors"
              />
              <select
                required
                defaultValue=""
                className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm text-white/50 focus:outline-none focus:border-red-600 transition-colors appearance-none"
              >
                <option value="" disabled>Select Purpose</option>
                {contact.enquiry_categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0a0a0a] text-white">{cat}</option>
                ))}
              </select>
              <textarea
                required
                placeholder="Type your message..."
                rows={3}
                className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-600 transition-colors resize-none"
              />
              <button
                type="submit"
                className="bg-white/5 hover:bg-red-600 text-white text-xs uppercase tracking-widest py-3 px-4 border border-white/10 hover:border-red-600 transition-all flex justify-center items-center gap-2 group"
              >
                <span>Send Directly</span>
                <Send size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              {msgStatus && (
                <p className={`text-xs mt-1 ${msgStatus.includes('Sent') ? 'text-green-500' : 'text-white/50'}`}>
                  {msgStatus}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-[10px] uppercase tracking-widest text-center md:text-left">
            © 2024 Kajal Arefin Ome · Boom Films · All Rights Reserved
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link to="/privacy-policy" className="text-white/20 text-[10px] uppercase tracking-widest cursor-pointer hover:text-white/50 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-use" className="text-white/20 text-[10px] uppercase tracking-widest cursor-pointer hover:text-white/50 transition-colors">Terms of Use</Link>
            <span className="text-white/20 text-[10px] uppercase tracking-widest">Built by Evorise Solutions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
