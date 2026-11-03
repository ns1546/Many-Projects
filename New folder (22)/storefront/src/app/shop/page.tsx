import { CartNavButton } from "@/components/CartNavButton";
import { SearchBar } from "@/components/SearchBar";
import { AddToCartButton } from "@/components/AddToCartButton";

async function getShopData(searchQuery?: string, categoryId?: string) {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  const apiUrl = process.env.NEXT_PUBLIC_PLATFORM_API_URL;

  if (!tenantId) return { error: "Not configured" };

  try {
    const res = await fetch(`${apiUrl}/store/${tenantId}/products`, { cache: "no-store" });
    if (!res.ok) return { error: "Failed to load" };
    const data = await res.json();
    
    let products = data.products || [];
    
    // Filter by category
    if (categoryId) {
      products = products.filter((p: any) => p.categoryId === categoryId);
    }
    
    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    
    return { ...data, products };
  } catch {
    return { error: "Connection failed" };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const data = await getShopData(params.q, params.category);

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <p className="text-gray-500 font-medium">{data.error}</p>
      </div>
    );
  }

  const { tenant, products = [], categories = [] } = data;
  const currencySymbol = tenant.currency === "USD" ? "$" : tenant.currency === "EUR" ? "€" : tenant.currency === "GBP" ? "£" : "$";

  let sortedProducts = [...products];
  if (params.sort === "price_asc") sortedProducts.sort((a: any, b: any) => a.price - b.price);
  if (params.sort === "price_desc") sortedProducts.sort((a: any, b: any) => b.price - a.price);
  if (params.sort === "new") sortedProducts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeCat = categories.find((c: any) => c.id === params.category);

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
              <a key={link} href={link === 'Home' ? '/' : `/${link.toLowerCase()}`} className={`text-[13px] font-semibold transition-opacity uppercase tracking-widest ${link === 'Shop' ? 'text-black' : 'text-gray-900 hover:text-black hover:opacity-50'}`}>
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

      {/* ── PAGE HEADER ── */}
      <div className="pt-48 pb-20 px-6 lg:px-12 bg-white rounded-b-[3rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-6">
              <a href="/" className="hover:text-black transition-colors">Home</a>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-black">{activeCat ? activeCat.name : "Collection"}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              {params.q ? (
                <>Search: <br/><span className="italic font-light text-gray-400">"{params.q}"</span></>
              ) : activeCat ? (
                <>{activeCat.name}</>
              ) : (
                <>Complete <br/><span className="italic font-light text-gray-400">Collection</span></>
              )}
            </h1>
          </div>
          <div className="pb-2 text-gray-500 font-medium">
             Showing {sortedProducts.length} objects
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 flex flex-col lg:flex-row gap-16">
        {/* ── SIDEBAR FILTERS ── */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-32 space-y-12">
            {/* Categories */}
            <div>
              <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-6 text-gray-400">Categories</h3>
              <div className="space-y-4">
                <a
                  href="/shop"
                  className={`block text-sm font-semibold transition-all ${!params.category ? "text-black translate-x-2" : "text-gray-500 hover:text-black hover:translate-x-1"}`}
                >
                  All Products
                </a>
                {categories.map((cat: any) => (
                  <a
                    key={cat.id}
                    href={`/shop?category=${cat.id}`}
                    className={`block text-sm font-semibold transition-all ${params.category === cat.id ? "text-black translate-x-2" : "text-gray-500 hover:text-black hover:translate-x-1"}`}
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="hidden lg:block">
              <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-6 text-gray-400">Price Range</h3>
              <div className="space-y-4">
                {[
                  { label: "Under $50", q: "?maxPrice=50" },
                  { label: "$50 - $100", q: "?minPrice=50&maxPrice=100" },
                  { label: "$100 - $200", q: "?minPrice=100&maxPrice=200" },
                  { label: "Over $200", q: "?minPrice=200" },
                ].map((r) => (
                  <label key={r.label} className="flex items-center gap-4 cursor-pointer group">
                    <input type="radio" name="price" className="w-4 h-4 accent-black bg-gray-100 border-none rounded-sm" />
                    <span className="text-sm text-gray-600 group-hover:text-black font-semibold transition">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── PRODUCTS GRID ── */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-end mb-12">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Sort By</span>
              <select
                defaultValue={params.sort || "featured"}
                onChange={(e: any) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("sort", e.target.value);
                  window.location.href = url.toString();
                }}
                className="bg-transparent text-sm font-semibold text-black focus:outline-none cursor-pointer appearance-none pr-6 border-b-2 border-black rounded-none pb-1"
                style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right center", backgroundSize: "10px auto" }}
              >
                <option value="featured">Featured</option>
                <option value="new">New Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[3rem]">
              <h3 className="text-3xl font-black text-gray-300 mb-2">No curated objects found</h3>
              <p className="text-gray-400">Try adjusting your filters or search.</p>
              <a href="/shop" className="mt-8 inline-block border-b-2 border-black text-black font-bold text-sm pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors uppercase tracking-[0.2em]">Reset All</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
              {sortedProducts.map((product: any) => {
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-black text-white pt-24 pb-12 rounded-t-[3rem] mt-12 relative z-30">
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
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
