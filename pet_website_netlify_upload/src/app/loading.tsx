import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="grow flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            {/* Pulsing ring */}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
            {/* Spinning icon */}
            <div className="bg-white p-4 rounded-full shadow-lg border border-slate-100 relative z-10">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-2">Loading...</h2>
          <p className="text-slate-500 text-sm">Fetching the best products for your pet</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
