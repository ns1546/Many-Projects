export default function AboutPage() {
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
              <a key={link} href={link === 'Home' ? '/' : `/${link.toLowerCase()}`} className={`text-[13px] font-semibold transition-opacity uppercase tracking-[0.1em] ${link === 'About' ? 'text-black' : 'text-gray-900 hover:text-black hover:opacity-50'}`}>
                {link}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
             <a href="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-50">Back to Shop</a>
          </div>
        </div>
      </header>

      <main className="pt-48 pb-32 px-6 lg:px-12 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-12 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          The <span className="italic font-light text-gray-400">Philosophy</span>
        </h1>
        
        <div className="prose prose-lg prose-gray mx-auto text-gray-500 leading-relaxed space-y-8">
          <p className="text-2xl text-black font-medium leading-snug text-center mb-16">
            We believe that the objects you interact with every day should bring joy, utility, and timeless beauty to your life. 
          </p>
          
          <div className="w-full aspect-video bg-gray-100 rounded-[2rem] overflow-hidden mb-16">
             <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-80 mix-blend-multiply"></div>
          </div>

          <p>
            Founded on the principles of uncompromising quality and essentialist design, our curation process is rigorous. We source from independent artisans and heritage manufacturers who share our obsession with materiality and craftsmanship.
          </p>
          <p>
            Every piece in our collection is intended to be used, loved, and passed down. We reject the cycle of disposable consumption in favor of fewer, better things.
          </p>
        </div>
      </main>
    </div>
  );
}
