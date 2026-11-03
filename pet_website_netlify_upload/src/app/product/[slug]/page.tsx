export const dynamic = 'force-dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Truck, Shield, ArrowLeft, Heart, Share2, Plus, Minus, ShoppingCart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientProductActions from './ClientProductActions'; // Client component for cart interactions
import { getProductBySlug } from '@/lib/data';

export default async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Fetch product safely (with fallback)
  const dbProduct = await getProductBySlug(slug);
  
  if (!dbProduct) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="grow flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-secondaryxl font-bold text-slate-800 mb-4">Product Not Found</h1>
            <p className="text-slate-500 mb-6">The product you're looking for doesn't exist.</p>
            <Link href="/" className="btn-primary">Return Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Serialize Mongoose document
  const product = {
    id: dbProduct._id.toString(),
    title: dbProduct.title,
    slug: dbProduct.slug,
    brand: dbProduct.brand,
    price: dbProduct.price,
    discountPrice: dbProduct.discountPrice,
    rating: dbProduct.ratings || 5,
    reviews: dbProduct.numOfReviews || 0,
    stock: dbProduct.stock || 0,
    images: dbProduct.images && dbProduct.images.length > 0 ? dbProduct.images : ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80'],
    description: dbProduct.description,
    specifications: dbProduct.specifications || []
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/category/dogs" className="hover:text-primary transition-colors">Dogs</Link>
          <span>/</span>
          <Link href="/category/dogs/food" className="hover:text-primary transition-colors">Food</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-none">{product.title}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* Image Gallery */}
            <div className="p-8 lg:p-12 border-b md:border-b-0 md:border-r border-slate-100 flex items-center justify-center bg-white min-h-[400px]">
              <div className="relative w-full aspect-square max-w-md">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-contain"
                  sizes="(max-w-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            {/* Product Actions and Tabs extracted to a Client Component */}
            <ClientProductActions product={product} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


