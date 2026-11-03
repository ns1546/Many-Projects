'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ClientNewsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    // Simulate API call
    await new Promise(res => setTimeout(res, 800));
    setLoading(false);
    setSubmitted(true);
    toast.success('You\'re subscribed! 🐾 Welcome to the Petopia family!');
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">✅</div>
        <p className="text-white font-semibold">You're subscribed!</p>
        <p className="text-blue-200 text-sm">Check your inbox for a welcome email from us.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap disabled:opacity-70"
      >
        {loading ? 'Subscribing...' : 'Subscribe Free'}
      </button>
    </form>
  );
}
