"use client";

import { useCart } from "./CartProvider";

export function CartNavButton({ themeColor }: { themeColor?: string }) {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <div 
      onClick={() => setIsCartOpen(true)}
      className="text-sm font-bold hover:opacity-75 cursor-pointer transition flex items-center gap-2" 
      style={{ color: themeColor || '#000' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
      <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs">
        {cartCount}
      </span>
    </div>
  );
}
