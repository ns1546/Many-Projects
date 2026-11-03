import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { CartSidebar } from "@/components/CartSidebar";
import { ToastProvider } from "@/components/ToastProvider";

import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Premium Store",
  description: "Shop our curated collection of premium products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>
          <ToastProvider>
            {children}
            <CartSidebar currency="$" />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
