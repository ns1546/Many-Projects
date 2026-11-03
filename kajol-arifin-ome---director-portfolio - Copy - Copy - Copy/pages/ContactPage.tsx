import React, { useEffect, useState } from 'react';
import directorData from '../data/director.json';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', category: '', message: '' });
  const [sent, setSent] = useState(false);
  const [modal, setModal] = useState<'privacy' | 'terms' | null>(null);
  const { contact, socialMedia } = directorData;

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="bg-[#050505] min-h-screen">
      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div className="relative bg-[#0a0a0a] border border-white/10 max-w-2xl w-full p-10 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 text-white/40 hover:text-white" onClick={() => setModal(null)}>✕</button>
            <h3 className="text-3xl font-heading text-white tracking-widest mb-6">{modal === 'privacy' ? 'Privacy Policy' : 'Terms of Production'}</h3>
            {modal === 'privacy' ? (
              <div className="space-y-6 text-white/60 text-sm leading-relaxed">
                <div><h4 className="text-red-600 uppercase tracking-widest text-xs mb-2">Intellectual Property</h4>
                  <p>Every frame, script, and character concept presented on this portfolio is the exclusive property of Kajal Arefin Ome and Boom Films. Unauthorized replication is a violation of international copyright laws.</p></div>
                <div><h4 className="text-red-600 uppercase tracking-widest text-xs mb-2">Data Protection</h4>
                  <p>Information submitted via the inquiry form is used solely for project communication. We do not sell or share your contact information with third parties.</p></div>
                <div><h4 className="text-red-600 uppercase tracking-widest text-xs mb-2">Image Rights</h4>
                  <p>The director's likeness and all project screenshots are protected. Use without written consent is strictly prohibited.</p></div>
              </div>
            ) : (
              <div className="space-y-6 text-white/60 text-sm leading-relaxed">
                {['Creative Strategy', 'Principal Photography', 'Post-Production', 'Financials & Delivery'].map((p, i) => (
                  <div key={p} className="border-l-2 border-red-600 pl-4">
                    <p className="text-white font-bold uppercase text-xs tracking-widest mb-1">Phase {i + 1}: {p}</p>
                    <p>{['Initial briefing involves script lock and creative alignment.', 'Production utilizes cinema-grade workflows. Locations finalized 14 days prior to filming.', 'Includes color grading, sound design, and VFX. Clients entitled to two major revision cycles.', 'A 40% production retainer is required. Final masters released on full payment.'][i]}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setModal(null)} className="mt-8 px-8 py-3 bg-red-600 text-white text-xs uppercase tracking-widest font-bold hover:bg-red-700 transition-colors">
              Accept & Close
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600 font-heading tracking-[0.5em] uppercase text-sm mb-4">Collaborate</p>
          <h1 className="text-6xl md:text-9xl font-heading text-white tracking-wider leading-none">Roll Credits</h1>
          <p className="text-white/40 max-w-xl text-lg mt-4">
            Available for commercial direction, web series production, feature film, and speaking engagements.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
          {/* Left: Contact Info */}
          <div>
            <h2 className="text-4xl font-heading text-white tracking-widest mb-12">Global Representation</h2>

            <div className="space-y-10 mb-12">
              <div className="group">
                <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Direct Inquiries</p>
                <p className="text-2xl text-white/70 hover:text-white transition-colors hover:pl-2 duration-500 cursor-pointer">{contact.email}</p>
              </div>
              <div className="group">
                <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Production</p>
                <p className="text-2xl text-white/70 hover:text-white transition-colors hover:pl-2 duration-500 cursor-pointer">{contact.production_email}</p>
              </div>
              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Location</p>
                <p className="text-xl text-white/60">{contact.location}</p>
              </div>
            </div>

            <div>
              <p className="text-white/25 text-[10px] uppercase tracking-widest mb-6">Social Presence</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'Facebook (Personal)', url: socialMedia.facebook },
                  { label: 'Instagram', url: socialMedia.instagram },
                  { label: 'YouTube (Director)', url: socialMedia.youtube_director },
                  { label: 'YouTube (Boom Films)', url: socialMedia.youtube_boom },
                  { label: 'Facebook (Boom Films)', url: socialMedia.facebook_boom },
                ].map(s => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/40 hover:text-red-600 text-xs uppercase tracking-widest border-b border-white/10 hover:border-red-600 pb-0.5 transition-all"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Inquiry categories */}
            <div className="mt-12">
              <p className="text-white/25 text-[10px] uppercase tracking-widest mb-4">Services Available</p>
              <div className="flex flex-wrap gap-2">
                {contact.enquiry_categories.map(cat => (
                  <span key={cat} className="px-3 py-1.5 bg-[#0a0a0a] border border-white/10 text-white/50 text-xs uppercase tracking-widest hover:border-red-600/50 hover:text-white/80 transition-all cursor-default">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="w-20 h-20 rounded-full border-2 border-red-600 flex items-center justify-center mb-6 text-4xl text-red-600">✓</div>
                <h3 className="text-4xl font-heading text-white tracking-widest mb-4">Message Received</h3>
                <p className="text-white/50">Our production team will be in touch within 48 hours.</p>
                <button onClick={() => setSent(false)} className="mt-8 text-xs uppercase tracking-widest text-white/30 hover:text-white transition-colors">Send Another →</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/5 p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
                <p className="text-white/40 font-heading text-xl tracking-widest uppercase mb-8">New Production Inquiry</p>

                <div className="space-y-6">
                  {[
                    { name: 'name', placeholder: 'Full Name', type: 'text' },
                    { name: 'email', placeholder: 'Email Address', type: 'email' },
                    { name: 'company', placeholder: 'Company / Studio (Optional)', type: 'text' },
                  ].map(f => (
                    <input
                      key={f.name}
                      required={f.name !== 'company'}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(formData as any)[f.name]}
                      onChange={e => setFormData(d => ({ ...d, [f.name]: e.target.value }))}
                      className="w-full bg-transparent border-b border-white/10 focus:border-red-600 outline-none py-4 text-white placeholder-white/15 transition-colors text-lg"
                    />
                  ))}

                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData(d => ({ ...d, category: e.target.value }))}
                    className="w-full bg-transparent border-b border-white/10 focus:border-red-600 outline-none py-4 text-white/50 transition-colors text-sm uppercase tracking-widest appearance-none"
                  >
                    <option value="" disabled className="bg-[#0a0a0a]">Select Project Type</option>
                    {contact.enquiry_categories.map(cat => (
                      <option key={cat} value={cat} className="bg-[#0a0a0a] text-white">{cat}</option>
                    ))}
                  </select>

                  <textarea
                    required
                    rows={4}
                    placeholder="Your Message / Brief"
                    value={formData.message}
                    onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
                    className="w-full bg-transparent border-b border-white/10 focus:border-red-600 outline-none py-4 text-white placeholder-white/15 transition-colors text-lg resize-none"
                  />
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full py-4 bg-red-600 text-white font-heading tracking-widest uppercase text-sm hover:bg-white hover:text-red-600 transition-all duration-300 shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)]"
                  >
                    Send Production Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer legal */}
      <section className="py-12 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-[10px] uppercase tracking-widest">© 2024 Kajal Arefin Ome · Boom Films · All Rights Reserved</p>
          <div className="flex gap-8">
            <button onClick={() => setModal('privacy')} className="text-white/30 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => setModal('terms')} className="text-white/30 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Terms of Shoot</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
