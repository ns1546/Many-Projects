import Link from 'next/link';
import Image from 'next/image';
import { getBrands } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Premium Hero Banner */}
      <div className="bg-slate-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 z-0 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="text-sm text-slate-300 mb-6 flex items-center justify-center gap-2 font-medium tracking-wide">
            <Link href="/" className="hover:text-white transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-primary font-bold">BRANDS</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Our Premium <br className="hidden md:block"/> <span className="text-primary italic">Partners</span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
            We partner with the world's leading pet care manufacturers to ensure your furry friends receive only the highest quality nutrition and accessories.
          </p>
        </div>
      </div>

      {/* Brands Grid */}
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Featured Brands</h2>
            <p className="text-slate-500 mt-2">Browse our curated selection of top-tier pet brands.</p>
          </div>
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{brands.length} Brands</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {brands.map((brand) => (
            <Link 
              key={brand._id} 
              href={`/shop?q=${encodeURIComponent(brand.name)}`}
              className="group flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Decorative background circle on hover */}
              <div className="absolute inset-0 bg-primary/5 rounded-3xl scale-0 group-hover:scale-100 transition-transform duration-500 origin-center z-0"></div>
              
              <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-50 bg-white shadow-md overflow-hidden mb-6 group-hover:border-primary/20 transition-colors flex items-center justify-center">
                {brand.imageUrl ? (
                  <img 
                    src={brand.imageUrl} 
                    alt={`${brand.name} logo`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-4xl">🐾</div>
                )}
              </div>
              
              <div className="relative z-10 text-center w-full">
                <h3 className="font-bold text-slate-900 text-lg md:text-xl group-hover:text-primary transition-colors">{brand.name}</h3>
                {brand.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {brand.description}
                  </p>
                )}
                
                <div className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-primary opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Shop Brand
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {brands.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
            <span className="text-6xl mb-4 block">🏢</span>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Brands Found</h3>
            <p className="text-slate-500">We are currently updating our partner list. Check back soon!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
