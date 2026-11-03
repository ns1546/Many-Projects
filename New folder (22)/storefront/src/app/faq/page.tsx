export default function FaqPage() {
  const faqs = [
    {
      q: "Where are your products manufactured?",
      a: "Our products are ethically crafted by master artisans in select workshops across Italy, Japan, and Portugal, utilizing techniques passed down through generations."
    },
    {
      q: "What is your return policy?",
      a: "We accept returns on all unused and unaltered items within 30 days of receipt. The objects must be returned in their original packaging to ensure safe transit."
    },
    {
      q: "Do you offer international shipping?",
      a: "Yes, we ship globally. Complimentary express shipping is automatically applied to all international orders exceeding $250."
    },
    {
      q: "How should I care for my object?",
      a: "Each piece comes with specific care instructions. Generally, we recommend keeping them away from direct sunlight and harsh chemicals. Clean only with a soft, damp cloth."
    }
  ];

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
             <a href="/contact" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-50">Contact Us</a>
          </div>
        </div>
      </header>

      <main className="pt-48 pb-32 px-6 lg:px-12 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Common <span className="italic font-light text-gray-400">Inquiries</span>
        </h1>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
              <summary className="flex items-center justify-between p-8 cursor-pointer list-none text-lg font-bold">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-45 transition-transform duration-300 text-2xl font-light">+</span>
              </summary>
              <div className="px-8 pb-8 text-gray-500 leading-relaxed max-w-2xl">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <p className="text-gray-500 mb-6">Cannot find the answer you are looking for?</p>
          <a href="/contact" className="inline-block border-b-2 border-black pb-1 text-sm font-bold uppercase tracking-[0.2em] hover:text-gray-500 hover:border-gray-500 transition-colors">
            Contact Concierge
          </a>
        </div>
      </main>
    </div>
  );
}
