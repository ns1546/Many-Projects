export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Truck, RotateCcw, Headphones, PawPrint, ChevronRight, ShoppingCart, Heart, Tag, Zap } from 'lucide-react';
import { getLatestProducts, getBrands } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeClient from './HomeClient';
import ClientNewsletter from '@/components/ClientNewsletter';

export default async function Home() {
  const dbProducts = await getLatestProducts(8);
  const mapProducts = (raw: any[]) => raw.map((p: any) => ({
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    brand: p.brand,
    price: p.price,
    discountPrice: p.discountPrice,
    images: p.images || [],
    ratings: p.ratings || 4.5,
    numOfReviews: p.numOfReviews || 0,
    stock: p.stock || 0
  })).slice(0, 4); // Only show 4 per row as requested

  // Fetch category specific products
  const { getProductsByCategory } = await import('@/lib/data');
  const dogProductsRaw = await getProductsByCategory('dogs');
  const catProductsRaw = await getProductsByCategory('cats');
  const rabbitProductsRaw = await getProductsByCategory('small-pets');
  const birdProductsRaw = await getProductsByCategory('birds');

  const dogProducts = mapProducts(dogProductsRaw);
  const catProducts = mapProducts(catProductsRaw);
  const rabbitProducts = mapProducts(rabbitProductsRaw);
  const birdProducts = mapProducts(birdProductsRaw);

  const categories = [
    { name: 'Dogs', slug: 'dogs', icon: '🐕', color: 'bg-[#fff9e6]', count: '2,400+ Products' },
    { name: 'Cats', slug: 'cats', icon: '🐈', color: 'bg-[#fff0f0]', count: '1,800+ Products' },
    { name: 'Rabbit', slug: 'small-pets', icon: '🐰', color: 'bg-[#fdf2f8]', count: '900+ Products' },
    { name: 'Birds', slug: 'birds', icon: '🦜', color: 'bg-[#f0fdf4]', count: '600+ Products' },
    { name: 'Offer Item', slug: 'shop', icon: '🏷️', color: 'bg-[#f0f9ff]', count: 'Special Deals' },
  ];

  const allBrands = await getBrands();
  const topBrands = allBrands.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="grow">

        {/* HERO BANNER — Dynamic Lifeful Marketing Style */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
             {/* The Banner Container */}
             <div className="w-full bg-linear-to-r from-[#fdfbf6] to-[#fcf6e5] rounded-[2.5rem] overflow-visible flex flex-col md:flex-row items-center justify-between p-8 md:p-16 min-h-[380px] relative shadow-sm border border-orange-50/50">
                
                {/* Decorative Background Elements for Depth */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-[2.5rem] pointer-events-none">
                  {/* Big soft glow circle behind pets */}
                  <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-white/70 rounded-full blur-3xl"></div>
                  {/* Floating abstract particles */}
                  <div className="absolute top-10 left-1/3 w-4 h-4 bg-red-400 rounded-full opacity-30"></div>
                  <div className="absolute bottom-16 left-[45%] w-6 h-6 bg-amber-400 rounded-full opacity-30"></div>
                  <div className="absolute top-20 right-[50%] w-3 h-3 bg-blue-400 rounded-full opacity-20"></div>
                  
                  {/* Clean CSS Floating Toys for dynamic life */}
                  <div className="absolute top-12 right-20 text-4xl opacity-80 animate-[bounce_3s_infinite_ease-in-out]" style={{ animationDelay: '0s' }}>🎾</div>
                  <div className="absolute top-32 right-[45%] text-5xl opacity-80 animate-[bounce_4s_infinite_ease-in-out]" style={{ animationDelay: '1s' }}>🦴</div>
                  <div className="absolute bottom-20 right-10 text-4xl opacity-80 animate-[bounce_3.5s_infinite_ease-in-out]" style={{ animationDelay: '0.5s' }}>🧶</div>
                </div>

                {/* Left Content Area */}
                <div className="z-20 text-center md:text-left w-full md:w-1/2 md:pr-10 relative">
                   <div className="inline-block bg-[#f85c5c] text-white font-black text-3xl md:text-5xl px-8 py-4 rounded-3xl rotate-[-3deg] mb-8 shadow-xl shadow-red-500/20 border-[3px] border-white font-poppins hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer">
                      SHOP NOW
                   </div>
                   <h2 className="text-gray-800 text-3xl md:text-5xl font-extrabold max-w-md leading-[1.15] tracking-tight">
                     Accessories that make your pets <span className="text-primary">red-carpet ready!</span>
                   </h2>
                   <p className="mt-5 text-gray-500 font-medium max-w-xs md:max-w-sm text-sm md:text-base mx-auto md:mx-0">
                     Discover premium toys, delicious treats, and wellness products for your furry friends.
                   </p>
                </div>
                
                {/* Dynamic Overlapping 3D Cutout Image */}
                <div className="w-full md:w-1/2 mt-16 md:mt-0 relative z-30 pointer-events-none flex justify-center md:block">
                   <div className="relative w-full h-[280px] md:h-full">
                     <img 
                        src="/images/hero-pets-final.png" 
                        alt="Energetic pets playing" 
                        className="md:absolute md:-top-[120px] md:-right-[40px] h-[360px] md:h-[540px] w-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] hover:-translate-y-4 transition-transform duration-500 origin-bottom" 
                     />
                   </div>
                </div>
             </div>
          </div>
        </section>



        {/* SHOP BY PET */}
        <section className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Shop by Pet</h2>
                <p className="text-gray-500 text-sm">Find everything your pet needs</p>
              </div>
              <Link href="/shop" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                All Categories <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`}
                  className={`group ${cat.color} rounded-2xl p-6 flex flex-col items-center justify-center hover:shadow-sm transition-all duration-200 hover:-translate-y-1`}>
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm font-poppins">{cat.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{cat.count}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORY-WISE PRODUCT SECTIONS */}
        <section className="py-8 bg-white space-y-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* DOG SECTION */}
            {dogProducts.length > 0 && (
              <div className="mb-12">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                  <h2 className="text-xl font-bold text-gray-900 uppercase">Dog</h2>
                  <Link href="/category/dogs" className="text-gray-900 font-semibold text-sm hover:underline">
                    View all
                  </Link>
                </div>
                <HomeClient products={dogProducts} />
              </div>
            )}

            {/* CAT SECTION */}
            {catProducts.length > 0 && (
              <div className="mb-12">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                  <h2 className="text-xl font-bold text-gray-900 uppercase">Cat</h2>
                  <Link href="/category/cats" className="text-gray-900 font-semibold text-sm hover:underline">
                    View all
                  </Link>
                </div>
                <HomeClient products={catProducts} />
              </div>
            )}

            {/* RABBIT SECTION */}
            {rabbitProducts.length > 0 && (
              <div className="mb-12">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                  <h2 className="text-xl font-bold text-gray-900 uppercase">Rabbit</h2>
                  <Link href="/category/small-pets" className="text-gray-900 font-semibold text-sm hover:underline">
                    View all
                  </Link>
                </div>
                <HomeClient products={rabbitProducts} />
              </div>
            )}

            {/* BIRD SECTION */}
            {birdProducts.length > 0 && (
              <div className="mb-12">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                  <h2 className="text-xl font-bold text-gray-900 uppercase">Bird</h2>
                  <Link href="/category/birds" className="text-gray-900 font-semibold text-sm hover:underline">
                    View all
                  </Link>
                </div>
                <HomeClient products={birdProducts} />
              </div>
            )}

          </div>
        </section>



        {/* BRANDS */}
        <section className="py-8 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Brands</h2>
              <Link href="/brands" className="text-primary text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {topBrands.map(brand => (
                <Link key={brand._id} href={`/shop?q=${encodeURIComponent(brand.name)}`}
                  className="bg-gray-50 border border-gray-200 rounded-xl py-4 px-3 text-center hover:border-primary hover:bg-blue-50 transition-colors group">
                  <p className="font-semibold text-gray-800 text-sm group-hover:text-primary transition-colors line-clamp-1">{brand.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>



      </main>
      <Footer />
    </div>
  );
}
