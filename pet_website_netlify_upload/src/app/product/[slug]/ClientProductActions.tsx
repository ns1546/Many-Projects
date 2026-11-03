'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Truck, Shield, Plus, Minus, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import toast from 'react-hot-toast';

export default function ClientProductActions({ product }: { product: any }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: '' });
  const [localReviews, setLocalReviews] = useState<any[]>(product.reviews || []);

  const addItem = useCartStore(state => state.addItem);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.discountPrice || product.price,
      image: product.images[0],
      slug: product.slug,
      quantity
    });
    toast.success('Added to cart successfully!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        id: product.id,
        title: product.title,
        price: product.discountPrice || product.price,
        image: product.images[0] || '',
        slug: product.slug,
        brand: product.brand
      });
      toast.success('Added to wishlist! ❤️');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return toast.error("Please fill all fields");
    
    try {
      const res = await fetch(`/api/products/${product.slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });
      const json = await res.json();
      
      if (json.success) {
        setLocalReviews(json.data.reverse()); // Use returned array
        setIsAddingReview(false);
        toast.success("Review submitted successfully!");
        setReviewForm({ rating: 5, comment: '', name: '' });
      } else {
        toast.error(json.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Network error. Could not submit review.");
    }
  };

  return (
    <>
      {/* Product Info Actions */}
      <div className="p-8 lg:p-12 flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold tracking-wider text-secondary uppercase">{product.brand}</span>
          <div className="flex items-center text-sm gap-4">
            <button 
              onClick={handleWishlistToggle}
              className="text-slate-400 hover:text-secondary transition-colors"
            >
              <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? 'fill-secondary text-secondary' : ''}`} />
            </button>
            <div className="flex items-center">
            <div className="flex text-[#ff5252] mr-1">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current text-slate-200" />
              </div>
              <span className="text-slate-500 underline cursor-pointer">{product.rating} ({product.reviews} reviews)</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
          {product.title}
        </h1>
        
        <div className="flex items-end gap-3 mb-6">
          <span className="text-4xl font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
          {product.discountPrice && (
            <span className="text-lg text-slate-400 line-through mb-1">${product.discountPrice.toFixed(2)}</span>
          )}
          {product.discountPrice && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md mb-2 ml-2">
              SAVE ${(product.discountPrice - product.price).toFixed(2)}
            </span>
          )}
        </div>

        <p className="text-slate-600 mb-8 line-clamp-3">
          {product.description}
        </p>

        <div className="border-t border-b border-gray-100 py-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-slate-900">Availability:</span>
            {product.stock > 0 ? (
              <span className="text-primary font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> 
                In Stock ({product.stock} items)
              </span>
            ) : (
              <span className="text-red-500 font-medium">Out of Stock</span>
            )}
          </div>
          
        </div>

        <div className="flex items-center gap-3 mt-auto mb-6">
          <div className="flex items-center border border-slate-200 h-12">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-semibold text-slate-900">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
              className="w-10 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
              disabled={quantity >= product.stock}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-slate-900 text-white font-bold text-sm uppercase tracking-wider h-12 transition-colors hover:bg-black active:bg-slate-950 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            ADD TO CART
          </button>
          
          <button 
            onClick={handleWishlistToggle}
            className="border border-slate-200 w-12 h-12 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0"
            title="Wishlist"
          >
            <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-[#ff5252] text-[#ff5252]' : ''}`} />
          </button>
        </div>



      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12 col-span-full mx-8 lg:mx-0">
        <div className="flex border-b border-gray-100">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'description' | 'specifications' | 'reviews')}
              className={`flex-1 py-5 text-sm sm:text-primaryase font-semibold capitalize transition-colors relative ${activeTab === tab ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
        
        <div className="p-8 lg:p-12">
          {activeTab === 'description' && (
            <div className="prose max-w-none text-slate-600 leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div className="max-w-3xl">
              {product.specifications?.length > 0 ? (
                <table className="w-full text-left text-sm text-slate-600">
                  <tbody>
                    {product.specifications.map((spec: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0">
                        <td className="py-4 font-semibold text-slate-900 w-1/3">{spec.key}</td>
                        <td className="py-4">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-500">No specifications available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      Customer Reviews <span className="bg-slate-100 text-slate-600 text-sm px-2 py-0.5 rounded-full">{localReviews.length}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-[#ff5252]">
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current text-slate-200" />
                      </div>
                      <span className="text-slate-900 font-bold">4.8 out of 5</span>
                    </div>
                  </div>
                  
                  {!isAddingReview && (
                    <button onClick={() => setIsAddingReview(true)} className="btn-primary px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all">Write a Review</button>
                  )}
                </div>

                {isAddingReview && (
                  <form onSubmit={submitReview} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-in fade-in zoom-in-95">
                    <h4 className="font-bold text-slate-900 mb-4">Submit Your Review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                        <input required value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} type="text" className="w-full p-2 border border-slate-200 rounded-lg bg-white" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(num => (
                            <button key={num} type="button" onClick={() => setReviewForm({...reviewForm, rating: num})} className="focus:outline-none">
                              <Star className={`h-8 w-8 ${reviewForm.rating >= num ? 'fill-[#ff5252] text-[#ff5252]' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Your Comment</label>
                        <textarea required value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-white min-h-[100px]" placeholder="Tell us what you think..."></textarea>
                      </div>
                      <div className="flex gap-4">
                        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark">Submit</button>
                        <button type="button" onClick={() => setIsAddingReview(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300">Cancel</button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-6">
                  {localReviews.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No reviews yet. Be the first to share your thoughts!
                    </div>
                  ) : localReviews.map((review, idx) => (
                    <div key={review._id || idx} className="border-b border-slate-100 pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-slate-900">{review.name}</p>
                          <div className="flex text-[#ff5252] text-sm mt-1">
                            {[1,2,3,4,5].map(num => (
                              <Star key={num} className={`h-3 w-3 ${review.rating >= num ? 'fill-current' : 'text-slate-200 fill-current'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-slate-400">{review.date ? new Date(review.date).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed mt-3">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
          )}
        </div>
      </div>
    </>
  );
}
