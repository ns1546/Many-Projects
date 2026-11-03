export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center pt-20 animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900 to-black opacity-50 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black -z-10" />
        
        <div className="text-center max-w-4xl px-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="text-xs font-medium uppercase tracking-widest text-zinc-300">Introducing AURA Pro</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-gradient">
            Silence the Noise.<br/>Hear the Magic.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Experience studio-quality sound with our next-generation adaptive active noise cancellation. 
            Crafted for audiophiles, designed for everyday life.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="premium-hover bg-white text-black px-8 py-4 rounded-full font-medium flex items-center space-x-2 w-full sm:w-auto justify-center">
              <span>Shop Collection</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            <button className="premium-hover bg-transparent border border-white/20 text-white px-8 py-4 rounded-full font-medium flex items-center space-x-2 w-full sm:w-auto justify-center hover:bg-white/5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Watch Film</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="w-full max-w-7xl px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Latest Drops</h2>
          <a href="#" className="text-zinc-400 hover:text-white flex items-center space-x-1 group transition-colors">
            <span>View all</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="premium-hover group relative bg-card border border-white/5 rounded-2xl overflow-hidden aspect-[4/5] flex flex-col justify-end p-6 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-zinc-900/50 group-hover:bg-zinc-800/50 transition-colors" />
            <div className="relative z-20">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">New Arrival</div>
              <h3 className="text-2xl font-bold mb-1">AURA Pro Max</h3>
              <p className="text-zinc-300 font-medium">$549.00</p>
            </div>
          </div>
          
          <div className="premium-hover group relative bg-card border border-white/5 rounded-2xl overflow-hidden aspect-[4/5] flex flex-col justify-end p-6 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-zinc-900/50 group-hover:bg-zinc-800/50 transition-colors" />
            <div className="relative z-20">
              <h3 className="text-2xl font-bold mb-1">AURA Earbuds</h3>
              <p className="text-zinc-300 font-medium">$249.00</p>
            </div>
          </div>
          
          <div className="premium-hover group relative bg-card border border-white/5 rounded-2xl overflow-hidden aspect-[4/5] flex flex-col justify-end p-6 cursor-pointer md:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-zinc-900/50 group-hover:bg-zinc-800/50 transition-colors" />
            <div className="relative z-20">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Best Seller</div>
              <h3 className="text-2xl font-bold mb-1">AURA Studio Speaker</h3>
              <p className="text-zinc-300 font-medium">$399.00</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
