'use client';

import { Link } from '@/platform/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';

export function DealBanner() {
  return (
    <section className="py-20 bg-muted/20 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-8 md:p-14 text-white shadow-2xl">
          {/* Ambient Lighting Accents */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-semibold text-primary uppercase tracking-wider">
                <Sparkles className="size-3.5" />
                <span>Spotlight Feature • Deal of the Week</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                AeroSound Apex Pro <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-300">
                  Pure Studio Silence
                </span>
              </h2>

              <p className="text-neutral-300 text-base md:text-lg leading-relaxed">
                Experience sound the way audio mastering engineers intended. Featuring custom 40mm beryllium drivers, active hybrid noise cancellation, and aerospace-grade memory foam earcups.
              </p>

              {/* Specs Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-neutral-200">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>45-Hour Ultra Battery Life</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-200">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>-42dB Hybrid Dual ANC</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-200">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Lossless LDAC &amp; Hi-Res Audio</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-200">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Multipoint Seamless Bluetooth 5.4</span>
                </div>
              </div>

              {/* Price & Countdown */}
              <div className="pt-4 flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">Limited Deal Price</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">$279.00</span>
                    <span className="text-lg text-neutral-500 line-through">$349.00</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      Save $70 (20% OFF)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300">
                  <Clock className="size-4 text-amber-400" />
                  <span>Offer ends in: <strong className="text-white">2 days, 14 hours</strong></span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  render={<Link href="/product/aerosound-apex-pro" />}
                  nativeButton={false}
                  size="lg"
                  className="bg-white text-black hover:bg-neutral-200 font-bold px-8 h-12 rounded-full shadow-lg transition-transform hover:scale-105"
                >
                  <span>Order Flagship Edition</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Image Showcase */}
            <div className="relative aspect-square max-w-lg mx-auto w-full rounded-2xl overflow-hidden border border-white/15 bg-neutral-900/60 shadow-2xl">
              <Image
                src="http://localhost:3002/assets/preview/product-101.jpg"
                alt="AeroSound Apex Pro"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                EDITOR'S CHOICE 2026
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
