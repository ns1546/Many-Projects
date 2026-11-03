export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getAllProducts, getProductsByCategory } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientCategoryProducts from './ClientCategoryProducts';

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug || 'shop';
  const searchQuery = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q.toLowerCase() : '';

  const categoryName = searchQuery
    ? `Search Results for "${resolvedSearchParams.q}"`
    : slug === 'shop'
      ? 'All Products'
      : slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  let dbProducts: any[] = [];

  if (searchQuery) {
    // Search across all products
    const all = await getAllProducts();
    dbProducts = all.filter((p: any) =>
      p.title?.toLowerCase().includes(searchQuery) ||
      p.brand?.toLowerCase().includes(searchQuery) ||
      (p.description && p.description.toLowerCase().includes(searchQuery)) ||
      p.category?.name?.toLowerCase().includes(searchQuery)
    );
  } else if (slug === 'shop') {
    dbProducts = await getAllProducts();
  } else {
    // Filter by category slug
    dbProducts = await getProductsByCategory(slug);
  }

  const products = dbProducts.map((doc: any) => ({
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    brand: doc.brand,
    price: doc.price,
    discountPrice: doc.discountPrice,
    images: doc.images || [],
    ratings: doc.ratings || 5,
    numOfReviews: doc.numOfReviews || 0,
    stock: doc.stock || 0,
    category: doc.category?.name || '',
  }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Category Banner */}
      <div className="bg-slate-900 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-sm text-slate-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{categoryName}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">{categoryName}</h1>
          <p className="text-slate-300 max-w-xl">
            {searchQuery
              ? `Found ${products.length} result${products.length !== 1 ? 's' : ''} for "${resolvedSearchParams.q}"`
              : `Find the best products for your beloved pets in our ${categoryName.toLowerCase()} collection.`}
          </p>
        </div>
      </div>

      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <ClientCategoryProducts products={products} />
      </main>

      <Footer />
    </div>
  );
}
