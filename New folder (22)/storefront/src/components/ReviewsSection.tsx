"use client";

import { useState } from "react";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  isVerified: boolean;
  createdAt: string;
}

const MOCK_REVIEWS: Review[] = [
  { id: "1", authorName: "Sarah M.", rating: 5, title: "Absolutely love this!", body: "The quality is outstanding. I've been using it for 3 weeks now and it still looks brand new. Highly recommend to anyone looking for premium quality.", isVerified: true, createdAt: "2024-01-15" },
  { id: "2", authorName: "James K.", rating: 5, title: "Exceeded expectations", body: "Fast shipping, great packaging, and the product itself is even better than the photos. Will definitely be ordering again.", isVerified: true, createdAt: "2024-01-10" },
  { id: "3", authorName: "Linda R.", rating: 4, title: "Very good quality", body: "Really happy with this purchase. The quality is great and it fits perfectly. The only minor thing is the shipping took a day longer than expected.", isVerified: false, createdAt: "2024-01-05" },
];

export function ReviewsSection({ productId }: { productId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);

  const avgRating = (MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1);

  return (
    <section className="mt-20 pt-16 border-t border-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Summary */}
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-black tracking-tight mb-6">Customer Reviews</h2>
          <div className="flex flex-col items-center lg:items-start gap-2 mb-6">
            <div className="text-7xl font-black">{avgRating}</div>
            <div className="stars text-2xl">★★★★★</div>
            <p className="text-gray-500 text-sm font-medium">Based on {MOCK_REVIEWS.length} reviews</p>
          </div>
          {/* Rating breakdown */}
          <div className="space-y-2 w-full max-w-xs mx-auto lg:mx-0">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = MOCK_REVIEWS.filter(r => r.rating === star).length;
              const pct = (count / MOCK_REVIEWS.length) * 100;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-4 text-gray-600 font-semibold">{star}</span>
                  <span className="text-yellow-400">★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-8 w-full lg:w-auto bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Write Review Form */}
          {showForm && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-scale-in">
              <h3 className="font-black text-lg mb-6">Your Review</h3>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setRating(star)}
                      className="text-3xl transition-colors"
                    >
                      <span className={(hoveredStar || rating) >= star ? "text-yellow-400" : "text-gray-300"}>★</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Your name" className="px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                  <input type="email" placeholder="Email (optional)" className="px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                </div>
                <input type="text" placeholder="Review title" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                <textarea rows={4} placeholder="Share your experience with this product..." className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none" />
                <div className="flex gap-3">
                  <button className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition">Submit Review</button>
                  <button onClick={() => setShowForm(false)} className="px-8 py-3 rounded-full font-bold text-sm border border-gray-300 hover:bg-gray-50 transition">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {MOCK_REVIEWS.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-black">{review.authorName}</span>
                    {review.isVerified && (
                      <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="stars text-sm">{Array(review.rating).fill("★").join("")}<span className="text-gray-300">{Array(5 - review.rating).fill("★").join("")}</span></div>
                </div>
                <span className="text-sm text-gray-400 shrink-0">{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <h4 className="font-bold mb-2">{review.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{review.body}</p>
              <div className="flex items-center gap-4 mt-4">
                <button className="text-xs text-gray-400 hover:text-gray-600 font-medium transition">Helpful (3)</button>
                <button className="text-xs text-gray-400 hover:text-gray-600 font-medium transition">Report</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
