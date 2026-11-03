export default function AccountPage() {
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
             <a href="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-50">Continue Shopping</a>
          </div>
        </div>
      </header>

      <main className="pt-48 pb-32 px-6 lg:px-12 max-w-3xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl font-black tracking-tighter mb-4 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Client <span className="italic font-light text-gray-400">Portal</span>
        </h1>
        <p className="text-gray-500 mb-12 text-center max-w-md">Access your order history, manage your wishlist, and update your preferences.</p>
        
        <div className="w-full bg-white p-10 lg:p-16 rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.02)] border border-gray-100">
          <form className="space-y-6 max-w-sm mx-auto">
            <div className="relative group">
               <input required type="email" name="email" id="email" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent text-center" placeholder="Email Address" />
               <label htmlFor="email" className="absolute left-1/2 -translate-x-1/2 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">Email Address</label>
            </div>
            <div className="relative group">
               <input required type="password" name="password" id="password" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent text-center" placeholder="Password" />
               <label htmlFor="password" className="absolute left-1/2 -translate-x-1/2 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">Password</label>
            </div>
            
            <div className="pt-8">
              <button type="button" className="bg-black text-white px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors w-full">
                Sign In
              </button>
            </div>
            
            <div className="text-center pt-4 flex flex-col gap-3">
              <a href="#" className="text-xs text-gray-400 hover:text-black font-semibold transition-colors">Forgot your password?</a>
              <a href="#" className="text-xs text-gray-900 border-b border-gray-900 pb-0.5 inline-block mx-auto font-bold uppercase tracking-wider hover:text-gray-500 hover:border-gray-500 transition-colors">Create Account</a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
