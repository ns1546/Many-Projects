import { CartNavButton } from "@/components/CartNavButton";
import { AddToCartButton } from "@/components/AddToCartButton";
import { SearchBar } from "@/components/SearchBar";

async function getStoreData() {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  const apiUrl = process.env.NEXT_PUBLIC_PLATFORM_API_URL;

  if (!tenantId || tenantId === "cl_replace_me") {
    return { error: "Tenant ID not configured. Please set NEXT_PUBLIC_TENANT_ID in .env" };
  }

  try {
    const res = await fetch(`${apiUrl}/store/${tenantId}/products`, { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 403) return { error: "This store is currently unavailable." };
      return { error: "Failed to fetch store data" };
    }
    return res.json();
  } catch {
    return { error: "Cannot connect to the platform API." };
  }
}

export default async function StorefrontPage() {
  const data = await getStoreData();

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="bg-white p-12 rounded-4xl shadow-[0_30px_60px_rgba(0,0,0,0.05)] max-w-lg w-full text-center border border-gray-100">
          <h1 className="text-3xl font-black text-red-600 mb-4 tracking-tighter">Configuration Error</h1>
          <p className="text-gray-500 text-lg leading-relaxed">{data.error}</p>
        </div>
      </div>
    );
  }

  const { tenant, products = [], categories = [], banners = [] } = data;
  const mainBanner = banners.find((b: any) => b.isActive) || null;
  const featuredProducts = products.filter((p: any) => p.isActive !== 0).slice(0, 8);
  const newArrivals = products.filter((p: any) => p.isActive !== 0).slice(0, 4);
  const currencySymbol = tenant.currency === "USD" ? "$" : tenant.currency === "EUR" ? "€" : tenant.currency === "GBP" ? "£" : "$";

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-black selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── TICKER ANNOUNCEMENT ── */}
      <div className="w-full bg-black text-white overflow-hidden py-2 relative z-50">
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] flex items-center gap-12 text-[10px] font-bold tracking-[0.2em] uppercase">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>Free global shipping on orders over {currencySymbol}250</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
              <span>Use code <strong>ELEVATE15</strong> for 15% off your first curation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FLOATING GLASS HEADER ── */}
      <header className="fixed top-12 left-0 right-0 z-50 px-4 md:px-8 flex justify-center pointer-events-none">
        <div className="w-full max-w-7xl mx-auto bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full h-16 flex items-center justify-between px-6 pointer-events-auto transition-all duration-500">
          
          <a href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm transition-transform duration-500 group-hover:rotate-12" style={{ backgroundColor: tenant.themeColor }}>
              {tenant.name.charAt(0)}
            </div>
            <span className="text-lg font-black tracking-tighter hidden sm:block mt-0.5" style={{ color: tenant.themeColor }}>
              {tenant.name}
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {['Home', 'Shop', 'Collections', 'Editorial', 'About'].map(link => (
              <a key={link} href={link === 'Home' ? '/' : `/${link.toLowerCase()}`} className="text-[13px] font-semibold text-gray-900 hover:text-black hover:opacity-50 transition-opacity uppercase tracking-widest">
                {link}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <SearchBar />
            <a href="/account" className="hidden md:flex items-center justify-center hover:opacity-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-[2.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </a>
            <CartNavButton themeColor={tenant.themeColor} />
          </div>
        </div>
      </header>

      {/* ── CINEMATIC HERO ── */}
      <section className="relative w-full h-svh flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {mainBanner ? (
          <>
            <div className="absolute inset-0 scale-105 animate-[slowZoom_20s_ease-out_forwards]">
              <img src={mainBanner.imageUrl} alt="Hero" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#0a0a0a] bg-[radial-gradient(circle_at_center,#222_1px,transparent_1px)] bg-size-[24px_24px] opacity-20" />
        )}
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 mt-20 flex flex-col items-center text-center">
          <div className="overflow-hidden mb-6">
            <p className="text-white/80 font-bold tracking-[0.4em] uppercase text-xs animate-[slideUp_1s_cubic-bezier(0.16,1,0.3,1)_forwards]">
              {mainBanner ? "Introducing the Season" : "Curated Essentials"}
            </p>
          </div>
          <div className="overflow-hidden pb-4">
            <h1 className="text-7xl md:text-[9rem] font-black text-white leading-[0.85] tracking-[-0.04em] animate-[slideUp_1.2s_cubic-bezier(0.16,1,0.3,1)_0.1s_forwards] opacity-0" style={{ fontFamily: "'Playfair Display', serif" }}>
              {mainBanner?.title || tenant.name}
            </h1>
          </div>
          <div className="overflow-hidden mb-12">
            <p className="text-white/70 text-lg md:text-2xl font-light max-w-2xl mx-auto leading-relaxed animate-[slideUp_1.2s_cubic-bezier(0.16,1,0.3,1)_0.2s_forwards] opacity-0">
              {mainBanner?.subtitle || "Elevate your lifestyle with uncompromising quality and timeless design."}
            </p>
          </div>
          
          <div className="flex gap-6 animate-[fadeIn_1.5s_ease_0.6s_forwards] opacity-0 items-center">
            <a href="/shop" className="group relative overflow-hidden rounded-full bg-white text-black px-12 py-5 font-bold text-sm tracking-[0.15em] uppercase transition-transform hover:scale-105">
              <span className="relative z-10 flex items-center gap-3">
                {mainBanner?.ctaText || "Explore Collection"}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0 animate-[fadeIn_2s_ease_1s_forwards]">
          <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-bold">Scroll</span>
          <div className="w-px h-12 bg-white/20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-white animate-[scrollLine_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ── BENTO CATEGORIES ── */}
      {categories.length > 0 && (
        <section className="bg-white py-32 px-4 md:px-8 rounded-t-[3rem] -mt-8 relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
              <div className="max-w-xl">
                <h2 className="text-5xl font-black tracking-tighter mb-6 leading-none">Curated <br/><span className="text-gray-400 font-serif italic font-light">Spaces</span></h2>
                <p className="text-gray-500 text-lg leading-relaxed">Discover collections designed to transform your everyday rituals into moments of beauty.</p>
              </div>
              <a href="/shop" className="text-sm font-bold uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">View All Spaces</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-150">
              {categories.slice(0, 3).map((cat: any, i: number) => (
                <a
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className={`group relative rounded-4xl overflow-hidden bg-gray-100 ${i === 0 ? 'md:col-span-2 md:row-span-2 h-100 md:h-auto' : 'h-75 md:h-auto'}`}
                >
                  <div className="absolute inset-0 bg-gray-200">
                     {/* Placeholder gradient for category images */}
                     <div className="w-full h-full" style={{ background: `linear-gradient(${120 + i*40}deg, #f1f5f9 0%, #e2e8f0 100%)` }} />
                  </div>
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-all duration-700" />
                  
                  <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <h3 className="text-3xl font-black tracking-tight text-gray-900 bg-white/90 backdrop-blur-md inline-block px-6 py-3 rounded-2xl shadow-xl">{cat.name}</h3>
                    </div>
                  </div>
                  <div className="absolute top-8 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EDITORIAL FEATURE ── */}
      <section className="bg-[#0f0f0f] py-32 px-4 md:px-8 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          <div className="relative aspect-3/4 rounded-4xl overflow-hidden">
             <div className="absolute inset-0 bg-gray-800" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=2000&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
             <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase mb-8">The Philosophy</span>
            <h2 className="text-5xl md:text-7xl font-serif italic font-light leading-tight mb-10">
              Form meets <br/><span className="font-sans font-black not-italic text-white">Function.</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-lg">
              We believe that the objects you interact with every day should bring joy, utility, and timeless beauty to your life. Our pieces are crafted with an obsession for detail and a reverence for materials.
            </p>
            <div>
              <a href="/about" className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-[0.2em] group">
                <span className="border-b-2 border-white pb-1 group-hover:border-transparent transition-colors">Read the Journal</span>
                <span className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── PREMIUM PRODUCT GRID ── */}
      <section id="products" className="py-32 px-4 md:px-8 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <h2 className="text-5xl font-black tracking-tighter mb-6">Latest <span className="font-serif italic font-light text-gray-400">Editions</span></h2>
            <p className="text-gray-500 text-lg max-w-2xl">Expertly crafted objects designed to elevate your daily routines.</p>
          </div>

          {featuredProducts.length === 0 ? (
             <div className="text-center py-32">
                <p className="text-gray-400 text-lg">No collections available currently.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {featuredProducts.map((product: any) => {
                const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
                const catName = categories.find((c: any) => c.id === product.categoryId)?.name;
                return (
                  <div key={product.id} className="group flex flex-col">
                    <a href={`/product/${product.id}`} className="block relative bg-gray-100 rounded-3xl overflow-hidden mb-6 aspect-4/5">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-tr from-gray-200 to-gray-50 flex items-center justify-center"></div>
                      )}
                      
                      {/* Floating Badges */}
                      <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
                        {isSale && <span className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">Sale</span>}
                        {product.stock === 0 && <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">Sold Out</span>}
                      </div>

                      {/* Quick Add Overlay */}
                      <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out z-20">
                        <AddToCartButton
                          product={{ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl }}
                          variant="quick"
                          disabled={product.stock === 0}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10 pointer-events-none" />
                    </a>
                    <div className="flex flex-col gap-2 px-2">
                      <div className="flex justify-between items-start gap-4">
                        <a href={`/product/${product.id}`} className="font-bold text-lg leading-snug tracking-tight text-gray-900 group-hover:text-gray-500 transition-colors">{product.name}</a>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-base font-black">{currencySymbol}{product.price.toFixed(2)}</span>
                          {isSale && <span className="text-xs text-gray-400 line-through mt-0.5">{currencySymbol}{product.compareAtPrice.toFixed(2)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                         {catName ? <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{catName}</span> : <div></div>}
                         <div className="flex items-center gap-0.5 text-black">
                           {[...Array(5)].map((_, i) => <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {products.length > 8 && (
            <div className="text-center mt-24">
              <a href="/shop" className="inline-flex items-center gap-4 border border-black text-black font-bold px-10 py-4 rounded-full hover:bg-black hover:text-white transition-all duration-300 text-[11px] uppercase tracking-[0.2em]">
                View Entire Collection
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black text-white pt-24 pb-12 rounded-t-[3rem] -mt-8 relative z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">
            
            <div className="md:col-span-5">
              <h2 className="text-4xl font-serif italic mb-6">Stay Inspired.</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">Join our private newsletter for early access to new collections, exclusive events, and editorial insights.</p>
              <form className="flex gap-2 max-w-md">
                <input type="email" placeholder="Email Address" className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm focus:outline-none focus:border-white/30 transition-colors" />
                <button type="button" className="bg-white text-black font-bold text-[10px] uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-gray-200 transition-colors">Join</button>
              </form>
            </div>

            <div className="md:col-span-2 md:col-start-7">
               <h4 className="font-bold text-[10px] tracking-[0.2em] uppercase text-white/40 mb-8">Navigation</h4>
               <ul className="space-y-4 text-sm text-white/80">
                 <li><a href="/shop" className="hover:text-white transition-colors">Shop</a></li>
                 <li><a href="/collections" className="hover:text-white transition-colors">Collections</a></li>
                 <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                 <li><a href="/journal" className="hover:text-white transition-colors">Journal</a></li>
               </ul>
            </div>

            <div className="md:col-span-2">
               <h4 className="font-bold text-[10px] tracking-[0.2em] uppercase text-white/40 mb-8">Support</h4>
               <ul className="space-y-4 text-sm text-white/80">
                 <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                 <li><a href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</a></li>
                 <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                 <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
               </ul>
            </div>

            <div className="md:col-span-2">
               <h4 className="font-bold text-[10px] tracking-[0.2em] uppercase text-white/40 mb-8">Social</h4>
               <ul className="space-y-4 text-sm text-white/80">
                 <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Pinterest</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
               </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium tracking-wide text-white/40">
            <p>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>{tenant.currency}</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span className="flex items-center gap-2">Powered by SuperCart</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Keyframe additions via style tag for complex tailwind arbitrary animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes slowZoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }
        @keyframes slideUp {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes scrollLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}} />
    </div>
  );
}
