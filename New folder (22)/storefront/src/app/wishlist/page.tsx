export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-4xl font-black tracking-tight mb-10">My Wishlist</h1>
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
          <div className="text-6xl mb-6">💝</div>
          <h2 className="text-2xl font-black mb-3">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">Save items you love by clicking the heart icon on any product.</p>
          <a href="/shop" className="inline-block bg-black text-white px-10 py-4 rounded-full font-bold hover:opacity-90 transition">
            Browse Products
          </a>
        </div>
      </div>
    </div>
  );
}
