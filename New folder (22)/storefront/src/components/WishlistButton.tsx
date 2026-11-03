"use client";

import { useState } from "react";

export function WishlistButton({ productId, productName }: { productId: string; productName: string }) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <button
      onClick={() => setWishlisted(!wishlisted)}
      className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 transition-all text-base ${
        wishlisted
          ? "border-red-500 text-red-500 bg-red-50"
          : "border-gray-200 text-gray-700 hover:border-gray-400"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill={wishlisted ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {wishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
    </button>
  );
}
