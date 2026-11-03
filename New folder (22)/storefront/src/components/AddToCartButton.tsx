"use client";

import { useCart, CartItem } from "./CartProvider";
import { useToast } from "./ToastProvider";

interface Props {
  product: Omit<CartItem, "quantity">;
  className?: string;
  variant?: "quick" | "full";
  disabled?: boolean;
  themeColor?: string;
}

export function AddToCartButton({ product, className, variant = "quick", disabled, themeColor = "#000" }: Props) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ...product, quantity: 1 });
    showToast(`"${product.name}" added to cart!`);
  };

  if (variant === "full") {
    return (
      <button
        onClick={handleAdd}
        disabled={disabled}
        style={{ backgroundColor: disabled ? "#9ca3af" : themeColor }}
        className={`w-full text-white font-black text-lg py-5 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:cursor-not-allowed uppercase tracking-widest ${className || ""}`}
      >
        {disabled ? "Out of Stock" : "Add to Cart"}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`bg-white/95 backdrop-blur text-black font-bold py-3 px-7 rounded-full shadow-lg hover:bg-black hover:text-white transition-all text-sm ${className || ""}`}
    >
      Add to Cart
    </button>
  );
}
