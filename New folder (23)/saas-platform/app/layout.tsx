import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AURA | Premium Audio",
  description: "Experience sound like never before.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-black text-white antialiased`}>
        {/* Minimal Premium Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tighter">AURA</div>
            <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-400">
              <a href="#" className="text-white hover:text-white transition-colors">Headphones</a>
              <a href="#" className="hover:text-white transition-colors">Earbuds</a>
              <a href="#" className="hover:text-white transition-colors">Speakers</a>
              <a href="#" className="hover:text-white transition-colors">Accessories</a>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></span>
              </button>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
