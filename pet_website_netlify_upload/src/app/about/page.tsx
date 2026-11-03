import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Heart, Truck, Award } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="grow">
        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2000')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-linear-to-r from-slate-900 to-transparent z-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Our Mission is Simple: <span className="text-primary">Happy Pets.</span></h1>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                Since 2010, Petopia has been dedicated to providing premium nutrition, comfort, and care for your furry family members. We believe every pet deserves the absolute best.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: ShieldCheck, title: "Premium Quality", desc: "Every product is vetted by our in-house experts and veterinarians." },
                { icon: Heart, title: "Animal Welfare First", desc: "A portion of every purchase goes to local animal shelters." },
                { icon: Truck, title: "Lightning Fast Delivery", desc: "We ship 99% of our orders within 24 hours." },
                { icon: Award, title: "Award Winning Service", desc: "Voted #1 Pet Supply Retailer by Pet Care Magazine." }
              ].map((feat, i) => (
                <div key={i} className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                    <feat.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-slate-500 text-sm">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1000" alt="Dog looking happy" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="lg:w-1/2">
                <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Story</span>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Started by Pet Lovers, For Pet Lovers.</h2>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  What started as a small local boutique in a tiny garage has blossomed into a nationwide family of pet enthusiasts. We realized early on that finding trustworthy, high-quality pet supplies was surprisingly difficult.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Today, we maintain the same mom-and-pop dedication to customer service while offering the selection and convenience of a major retailer. We don't just sell pet food; we provide the fuel for a longer, happier life with your best friend.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
