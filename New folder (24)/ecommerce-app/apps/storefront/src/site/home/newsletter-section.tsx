'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Check, Copy, Sparkles } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubmitted(true);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText('NEXUS15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-gradient-to-b from-card via-card/90 to-background p-8 md:p-14 text-center shadow-2xl">
          {/* Ambient Lighting Accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Insider Club • Special Benefit</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Unlock 15% Off Your First Order
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Join 25,000+ creators getting first access to limited acoustic drops, secret discounts, and hardware firmware updates.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full h-11 pl-10 pr-4 rounded-full border border-input bg-background/80 text-sm outline-none focus:ring-2 focus:ring-primary shadow-xs transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  size="default"
                  className="h-11 px-6 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                >
                  Join VIP
                </Button>
              </form>
            ) : (
              <div className="p-6 rounded-2xl bg-primary/10 border border-primary/30 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-sm">
                  <Check className="size-5" />
                  <span>Welcome to the Nexus VIP Club!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use your exclusive coupon code at checkout:
                </p>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-background border border-border shadow-xs">
                  <span className="font-mono font-bold text-lg text-primary tracking-widest">NEXUS15</span>
                  <button
                    onClick={copyCode}
                    className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground">
              Zero spam. We respect your inbox. Unsubscribe anytime with 1 click.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
