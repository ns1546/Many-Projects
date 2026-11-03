export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-black selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── FLOATING GLASS HEADER ── */}
      <header className="fixed top-12 left-0 right-0 z-50 px-4 md:px-8 flex justify-center pointer-events-none">
        <div className="w-full max-w-7xl mx-auto bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full h-16 flex items-center justify-between px-6 pointer-events-auto transition-all duration-500">
          <a href="/" className="flex items-center gap-3 shrink-0 group">
            <span className="text-lg font-black tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
              SuperCart
            </span>
          </a>
          <nav className="hidden lg:flex items-center gap-8">
            {['Home', 'Shop', 'Collections', 'Editorial', 'About'].map(link => (
              <a key={link} href={link === 'Home' ? '/' : `/${link.toLowerCase()}`} className={`text-[13px] font-semibold transition-opacity uppercase tracking-[0.1em] text-gray-900 hover:text-black hover:opacity-50`}>
                {link}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
             <a href="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-50">Back to Shop</a>
          </div>
        </div>
      </header>

      <main className="pt-48 pb-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">
          <div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="italic font-light text-gray-400">Get in</span> Touch
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-12 max-w-md">
              Whether you have a question about our collections, need assistance with an order, or simply wish to say hello, our concierge team is at your disposal.
            </p>
            
            <div className="space-y-8 text-sm">
               <div>
                 <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Email</h4>
                 <a href="mailto:concierge@supercart.com" className="text-lg font-bold border-b border-black pb-0.5 hover:text-gray-500 hover:border-gray-500 transition-colors">concierge@supercart.com</a>
               </div>
               <div>
                 <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Phone</h4>
                 <p className="text-lg font-medium text-gray-900">+1 (800) 555-0199</p>
               </div>
               <div>
                 <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Atelier</h4>
                 <p className="text-lg font-medium text-gray-900">123 Design Avenue<br/>New York, NY 10001</p>
               </div>
            </div>
          </div>
          
          <div className="bg-white p-10 lg:p-16 rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="text-2xl font-black tracking-tighter mb-8">Send a Message</h3>
            <form className="space-y-6">
              <div className="relative group">
                 <input required type="text" name="name" id="name" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="Name" />
                 <label htmlFor="name" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">Name</label>
              </div>
              <div className="relative group">
                 <input required type="email" name="email" id="email" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="Email Address" />
                 <label htmlFor="email" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">Email Address</label>
              </div>
              <div className="relative group pt-4">
                 <textarea required name="message" id="message" rows={4} className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent resize-none" placeholder="Message"></textarea>
                 <label htmlFor="message" className="absolute left-0 top-8 text-gray-400 text-sm font-semibold transition-all peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">Message</label>
              </div>
              <div className="pt-4">
                <button type="button" className="bg-black text-white px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors w-full">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
