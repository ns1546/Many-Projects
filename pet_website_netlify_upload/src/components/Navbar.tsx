'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, PawPrint, Package } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const { user, logout } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = mounted ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const clientUser = mounted ? user : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50" ref={dropdownRef}>
      {/* Top Tier (Thin Bar) */}
      <div className="bg-[#f8f9fa] border-b border-gray-200 text-gray-500 text-[11px] font-medium py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-primary transition-colors">Reward Program</Link>
            <Link href="#" className="hover:text-primary transition-colors">Blog</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary" aria-label="Facebook">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="hover:text-primary" aria-label="Instagram">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="hover:text-primary" aria-label="YouTube">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 19.5 12 19.5 12 19.5s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon fill="white" points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Middle Tier (Main) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between gap-6 md:gap-12">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 flex items-center justify-center text-primary">
              <PawPrint className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight font-poppins"><span className="text-primary">Pet</span>opia</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl bg-gray-50 border border-gray-200 rounded-full h-11 items-center px-2 hover:border-gray-300 transition-colors focus-within:bg-white focus-within:border-gray-400 focus-within:shadow-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-gray-700"
            />
            <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>
            <select className="bg-transparent text-[11px] font-semibold text-gray-600 outline-none cursor-pointer px-2 appearance-none">
              <option>All Categories</option>
              <option>Dogs</option>
              <option>Cats</option>
              <option>Birds</option>
            </select>
            <ChevronDown className="h-3 w-3 text-gray-400 mr-2 -ml-1 pointer-events-none" />
            <button type="submit" className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 transition-colors">
              <Search className="h-4 w-4 stroke-[2]" />
            </button>
          </form>

          {/* Right Icons */}
          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="text-gray-600 hover:text-primary transition-colors flex items-center">
                <User className="h-[22px] w-[22px] stroke-[1.5]" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-up">
                  {clientUser ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm">{clientUser.name}</p>
                        <p className="text-xs text-gray-500">{clientUser.email}</p>
                      </div>
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700" onClick={() => setIsUserMenuOpen(false)}><User className="h-4 w-4" /> My Account</Link>
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700" onClick={() => setIsUserMenuOpen(false)}><Package className="h-4 w-4" /> My Orders</Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 w-full text-left">Sign Out</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 font-medium text-gray-900" onClick={() => setIsUserMenuOpen(false)}>Sign In</Link>
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-600" onClick={() => setIsUserMenuOpen(false)}>Create Account</Link>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <Link href="/wishlist" className="text-gray-600 hover:text-primary transition-colors">
              <Heart className="h-[22px] w-[22px] stroke-[1.5]" />
            </Link>
            
            <Link href="/cart" className="text-gray-600 hover:text-primary transition-colors relative">
              <ShoppingBag className="h-[22px] w-[22px] stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <Link href="/cart" className="text-gray-600 relative">
              <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
              {isMobileMenuOpen ? <X className="h-6 w-6 stroke-[1.5]" /> : <Menu className="h-6 w-6 stroke-[1.5]" />}
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Tier (Navigation) */}
      <div className="hidden md:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-8 h-12 text-[11px] font-bold tracking-wider text-gray-600 uppercase">
            <li className="h-full flex items-center border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors cursor-pointer"><Link href="/">HOME</Link></li>
            <li className="h-full flex items-center border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors cursor-pointer"><Link href="/category/dog-food">DOG FOOD <ChevronDown className="inline h-3 w-3 ml-0.5 opacity-60"/></Link></li>
            <li className="h-full flex items-center border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors cursor-pointer"><Link href="/category/cat-food">CAT FOOD <ChevronDown className="inline h-3 w-3 ml-0.5 opacity-60"/></Link></li>
            <li className="h-full flex items-center border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors cursor-pointer"><Link href="/category/toys-accessories">TOYS & ACCESSORIES <ChevronDown className="inline h-3 w-3 ml-0.5 opacity-60"/></Link></li>
            <li className="h-full flex items-center border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors cursor-pointer"><Link href="/category/health-wellness">HEALTH & WELLNESS <ChevronDown className="inline h-3 w-3 ml-0.5 opacity-60"/></Link></li>
            <li className="h-full flex items-center border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors cursor-pointer"><Link href="/category/small-pets">SMALL PETS <ChevronDown className="inline h-3 w-3 ml-0.5 opacity-60"/></Link></li>
            <li className="h-full flex items-center border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors cursor-pointer"><Link href="/category/birds-exotics">BIRDS & EXOTICS <ChevronDown className="inline h-3 w-3 ml-0.5 opacity-60"/></Link></li>
            <li className="h-full flex items-center border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors cursor-pointer"><Link href="/offers" className="text-red-500">OFFERS %</Link></li>
          </ul>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 max-h-[80vh] overflow-y-auto px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent px-3 text-sm outline-none" />
            <button type="submit" className="bg-white p-2 rounded-md shadow-sm text-gray-500"><Search className="h-4 w-4" /></button>
          </form>
          <div className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
            <Link href="/" className="px-3 py-2.5 rounded-lg hover:bg-gray-50">HOME</Link>
            <Link href="/category/dog-food" className="px-3 py-2.5 rounded-lg hover:bg-gray-50">DOG FOOD</Link>
            <Link href="/category/cat-food" className="px-3 py-2.5 rounded-lg hover:bg-gray-50">CAT FOOD</Link>
            <Link href="/category/toys-accessories" className="px-3 py-2.5 rounded-lg hover:bg-gray-50">TOYS & ACCESSORIES</Link>
            <Link href="/category/health-wellness" className="px-3 py-2.5 rounded-lg hover:bg-gray-50">HEALTH & WELLNESS</Link>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-around">
            <Link href="/account" className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary"><User className="h-5 w-5" /><span className="text-[10px] uppercase font-bold">Account</span></Link>
            <Link href="/wishlist" className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary"><Heart className="h-5 w-5" /><span className="text-[10px] uppercase font-bold">Wishlist</span></Link>
          </div>
        </div>
      )}
    </header>
  );
}
