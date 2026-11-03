'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Have a question about an order, need pet advice, or just want to say hello? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
            <form 
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                import('react-hot-toast').then(mod => {
                  mod.default.success("Message sent! We will get back to you shortly.");
                });
                (e.target as HTMLFormElement).reset();
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 focus:bg-white transition-colors" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 focus:bg-white transition-colors" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input required type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 focus:bg-white transition-colors" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 focus:bg-white transition-colors">
                  <option>Order Inquiry</option>
                  <option>Product Question</option>
                  <option>Returns & Refunds</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea required rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-slate-50 focus:bg-white transition-colors" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2">
                <Send className="h-5 w-5" /> Send Message
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-linear-to-br from-primary to-blue-700 rounded-2xl p-8 text-white shadow-lg shadow-primary/20">
              <h3 className="text-xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg"><Phone className="h-6 w-6 text-white" /></div>
                  <div>
                    <p className="font-semibold text-lg">+1 (800) 123-4567</p>
                    <p className="text-blue-100 text-sm">Mon-Fri from 8am to 5pm</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg"><Mail className="h-6 w-6 text-white" /></div>
                  <div>
                    <p className="font-semibold text-lg">support@petopia.com</p>
                    <p className="text-blue-100 text-sm">We'll respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg"><MapPin className="h-6 w-6 text-white" /></div>
                  <div>
                    <p className="font-semibold text-lg">123 Pet Street</p>
                    <p className="text-blue-100 text-sm">New York, NY 10001, USA</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Frequently Asked Questions</h3>
              <p className="text-slate-500 mb-6">Find quick answers to common questions about shipping, returns, and our products.</p>
              <a href="/faq" className="btn-outline w-full block">Visit FAQ Center</a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
