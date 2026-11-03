import { notFound } from "next/navigation";
import { CartNavButton } from "@/components/CartNavButton";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import { ReviewsSection } from "@/components/ReviewsSection";
import { SearchBar } from "@/components/SearchBar";

async function getProduct(tenantId: string, productId: string) {
  const apiUrl = process.env.NEXT_PUBLIC_PLATFORM_API_URL;
  try {
    const res = await fetch(`${apiUrl}/store/${tenantId}/products`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const product = data.products?.find((p: any) => p.id === productId);
    return product ? { product, tenant: data.tenant, categories: data.categories, products: data.products } : null;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "tenant_test123";
  const data = await getProduct(tenantId, id);

  if (!data || !data.product) return notFound();

  const { product, tenant, categories, products } = data;
  const currencySymbol = tenant.currency === "USD" ? "$" : tenant.currency === "EUR" ? "€" : tenant.currency === "GBP" ? "£" : "$";
  const catName = categories?.find((c: any) => c.id === product.categoryId)?.name;
  const relatedProducts = products?.filter((p: any) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4) || [];
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const savingsPercent = isSale ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  
  // Create mock thumbnails if none exist
  const thumbnailImages = product.imageUrl 
    ? [product.imageUrl, product.imageUrl, product.imageUrl] 
    : [];

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
              <a key={link} href={link === 'Home' ? '/' : `/${link.toLowerCase()}`} className={`text-[13px] font-semibold transition-opacity uppercase tracking-[0.1em] ${link === 'Shop' ? 'text-black' : 'text-gray-900 hover:text-black hover:opacity-50'}`}>
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

      {/* ── BREADCRUMB ── */}
      <div className="pt-40 pb-8 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">
          <a href="/" className="hover:text-black transition-colors">Home</a>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <a href="/shop" className="hover:text-black transition-colors">Shop</a>
          {catName && (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <a href={`/shop?category=${product.categoryId}`} className="hover:text-black transition-colors">{catName}</a>
            </>
          )}
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-black truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* ── MAIN PRODUCT SECTION ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          
          {/* LEFT: Cinematic Image Gallery */}
          <div className="w-full lg:w-[60%] flex flex-col gap-6">
            <div className="w-full bg-gray-100 rounded-[2rem] overflow-hidden relative">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover aspect-[4/5] md:aspect-[3/4]"
                />
              ) : (
                <div className="w-full h-full aspect-[4/5] bg-gradient-to-tr from-gray-200 to-gray-50 flex items-center justify-center"></div>
              )}
              
              {isSale && (
                <div className="absolute top-8 left-8">
                  <span className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                    Sale -{savingsPercent}%
                  </span>
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-black font-black text-2xl uppercase tracking-[0.3em] bg-white px-8 py-4 rounded-full shadow-2xl">Sold Out</span>
                </div>
              )}
            </div>
            
            {thumbnailImages.length > 0 && (
              <div className="grid grid-cols-3 gap-6">
                {thumbnailImages.map((img, i) => (
                  <div key={i} className="rounded-[1.5rem] overflow-hidden aspect-[4/5] bg-gray-100 cursor-pointer group">
                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Sticky Details Pane */}
          <div className="w-full lg:w-[40%] sticky top-32">
            <div className="flex flex-col">
              
              {/* Product Header */}
              {catName && (
                <a href={`/shop?category=${product.categoryId}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 hover:text-black transition-colors">
                  {catName}
                </a>
              )}
              
              <h1 className="text-5xl font-black tracking-tighter leading-[1.1] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                {product.name}
              </h1>

              {/* Price & Rating */}
              <div className="flex items-end justify-between border-b border-gray-200 pb-8 mb-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-black">{currencySymbol}{product.price.toFixed(2)}</span>
                    {isSale && (
                      <span className="text-xl text-gray-400 line-through font-medium">{currencySymbol}{product.compareAtPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold">Taxes included</div>
                </div>
                
                <div className="flex flex-col items-end gap-2 text-right">
                  <div className="flex text-black">
                     {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                  </div>
                  <span className="text-xs text-gray-500 underline underline-offset-4 cursor-pointer hover:text-black">24 Reviews</span>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm text-gray-500 leading-relaxed mb-10">
                <p>
                  {product.description || "Designed for both utility and aesthetics, this premium piece effortlessly blends into any lifestyle. Crafted from the highest quality materials to ensure durability and comfort that lasts."}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 mb-10 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]">SKU</span>
                  <span className="font-mono text-xs">{product.sku || 'N/A'}</span>
                </div>
                <div className="w-[1px] h-4 bg-gray-200"></div>
                <div>
                  {product.stock > 10 ? (
                    <span className="text-green-600 font-bold flex items-center gap-2 text-xs uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> In Stock
                    </span>
                  ) : product.stock > 0 ? (
                    <span className="text-orange-500 font-bold flex items-center gap-2 text-xs uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Low Stock
                    </span>
                  ) : (
                    <span className="text-gray-400 font-bold flex items-center gap-2 text-xs uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 mb-12">
                <AddToCartButton
                  product={{ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl }}
                  variant="full"
                  disabled={product.stock === 0}
                  themeColor={tenant.themeColor}
                />
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <WishlistButton productId={product.id} productName={product.name} />
                  </div>
                  <button className="flex-1 flex items-center justify-center gap-3 border border-gray-200 rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:border-black transition-colors h-14">
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Accordions (Mock) */}
              <div className="border-t border-gray-200 divide-y divide-gray-200">
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between py-6 text-sm font-bold uppercase tracking-[0.1em] list-none">
                    Shipping & Returns
                    <span className="text-xl group-open:rotate-45 transition-transform duration-300">+</span>
                  </summary>
                  <div className="pb-6 text-gray-500 text-sm leading-relaxed">
                    Complimentary standard shipping on all orders above {currencySymbol}250. Returns accepted within 30 days of delivery in original, unworn condition.
                  </div>
                </details>
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between py-6 text-sm font-bold uppercase tracking-[0.1em] list-none">
                    Materials & Care
                    <span className="text-xl group-open:rotate-45 transition-transform duration-300">+</span>
                  </summary>
                  <div className="pb-6 text-gray-500 text-sm leading-relaxed">
                    Crafted from premium sustainably sourced materials. To maintain the integrity of the object, clean gently with a damp cloth. Avoid harsh chemicals.
                  </div>
                </details>
              </div>

            </div>
          </div>
        </div>

        {/* ── REVIEWS SECTION ── */}
        <div className="mt-32 pt-24 border-t border-gray-200">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-serif italic mb-4">Client Feedback</h2>
            <p className="text-gray-500">Unfiltered experiences from our community.</p>
          </div>
          <ReviewsSection productId={product.id} />
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-4xl font-black tracking-tighter">
                Complete the <span className="font-serif italic font-light text-gray-400">Curaton</span>
              </h2>
              <a href="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">
                View All
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {relatedProducts.map((rp: any) => (
                <a key={rp.id} href={`/product/${rp.id}`} className="group block">
                  <div className="bg-gray-100 rounded-[1.5rem] overflow-hidden aspect-[4/5] mb-6 relative">
                    {rp.imageUrl ? (
                      <img src={rp.imageUrl} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-50"></div>
                    )}
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg leading-snug tracking-tight text-gray-900 group-hover:text-gray-500 transition-colors">{rp.name}</h3>
                    <span className="text-base font-black shrink-0">{currencySymbol}{rp.price.toFixed(2)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-black text-white pt-24 pb-12 rounded-t-[3rem] relative z-30 mt-auto">
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
