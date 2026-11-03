import Link from 'next/link';
import { PawPrint, Mail, MapPin, Phone, Share2, MessageCircle, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white">Petopia</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5 text-gray-400 max-w-xs">
              Your trusted online pet store. We offer premium pet food, accessories & healthcare products for all pet types — delivered to your door.
            </p>
            <div className="flex gap-3 mb-6">
              {[
                { Icon: Share2, label: 'Facebook' },
                { Icon: MessageCircle, label: 'Instagram' },
                { Icon: Send, label: 'Twitter' },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors" aria-label={label}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>support@petopia.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Mon–Sat: 9am–6pm</span>
              </div>
            </div>
          </div>

          {/* Shop by Pet */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Shop by Pet</h3>
            <ul className="space-y-2.5 text-sm">
              {['Dogs', 'Cats', 'Small Pets', 'Birds', 'Fish & Aquatics', 'Reptiles'].map(cat => (
                <li key={cat}>
                  <Link href={`/category/${cat.toLowerCase().replace(/ & .*/,'').replace(' ','-')}`}
                    className="text-gray-400 hover:text-white transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Customer Service</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'My Account', href: '/account' },
                { name: 'Track Order', href: '/account' },
                { name: 'Returns & Refunds', href: '/returns' },
                { name: 'Shipping Info', href: '/shipping' },
                { name: 'FAQ', href: '/faq' },
                { name: 'Contact Us', href: '/contact' },
              ].map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">About</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'About Petopia', href: '/about' },
                { name: 'Careers', href: '/careers' },
                { name: 'Press', href: '/press' },
                { name: 'Pet Blog', href: '/blog' },
                { name: 'Vet Partners', href: '/vet-partners' },
                { name: 'Admin Panel', href: '/admin' },
              ].map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Payment badges bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} Petopia. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-gray-800 px-2 py-1 rounded font-bold">VISA</span>
              <span className="bg-gray-800 px-2 py-1 rounded font-bold">MC</span>
              <span className="bg-gray-800 px-2 py-1 rounded font-bold">PayPal</span>
              <span className="bg-gray-800 px-2 py-1 rounded font-bold">Stripe</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
