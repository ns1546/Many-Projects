import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="grow flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <FileQuestion className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-slate-600 mb-8">
          Oops! The page you are looking for doesn't exist or is currently under construction.
        </p>
        <Link href="/" className="btn-primary py-3 px-8 text-lg">
          Go Back Home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
