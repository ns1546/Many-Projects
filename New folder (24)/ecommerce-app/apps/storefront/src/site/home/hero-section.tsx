import { Link } from '@/platform/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getRouteLocale } from '@/platform/i18n/server';
import { cacheLife } from 'next/cache';
import { ArrowRight, Sparkles, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const SETTINGS_QUERY = `
  query GetStorefrontSettings {
    storefrontSettings {
      customFields {
        heroTitle
        heroSubtitle
        heroBanner
        heroLink
        promoText
        promoLink
        heroBannerTitle
        heroBannerSubtitle
        heroBannerImage
      }
    }
  }
`;

async function getStorefrontSettings() {
    'use cache';
    cacheLife('hours');
    try {
        const result = await fetch(process.env.VENDURE_SHOP_API_URL || "http://localhost:3002/shop-api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: SETTINGS_QUERY }),
        });
        const json = await result.json();
        return json.data?.storefrontSettings?.customFields;
    } catch {
        return null;
    }
}

export async function HeroSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({ locale, namespace: 'Hero' });
    
    let title = "Engineered for Sound,";
    let titleHighlight = "Precision & Performance";
    let subtitle = "Discover studio-tuned acoustics, CNC mechanical keyboards, and aerospace titanium wearables built for creators who demand excellence.";
    let image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop";

    const settings = await getStorefrontSettings();
    if (settings?.heroTitle || settings?.heroBannerTitle) {
        title = settings.heroTitle || settings.heroBannerTitle;
        titleHighlight = "";
    }
    if (settings?.heroSubtitle || settings?.heroBannerSubtitle) {
        subtitle = settings.heroSubtitle || settings.heroBannerSubtitle;
    }
    if (settings?.heroBanner || settings?.heroBannerImage) {
        image = settings.heroBanner || settings.heroBannerImage;
    }

    return (
        <section className="relative w-full min-h-[85vh] pt-28 pb-16 flex items-center justify-center overflow-hidden bg-neutral-950 text-white">
            {/* Background Image with Parallax & Lighting */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 filter brightness-[0.40] contrast-125"
                style={{ backgroundImage: `url('${image}')` }}
            />
            {/* Deep Multi-stop Vignette and Ambient Color Gradients - Dark backdrop */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.22),rgba(0,0,0,0))]" />
            
            <div className="container relative z-10 mx-auto px-6 text-center text-white space-y-8 max-w-5xl">
                {/* Release Badge */}
                <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs font-semibold tracking-wider uppercase text-neutral-200 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
                    <Sparkles className="size-3.5 text-amber-400 fill-amber-400" />
                    <span>2026 Flagship Hardware Edition</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight drop-shadow-2xl text-balance leading-[1.08] text-white">
                    {title} {titleHighlight && <br className="hidden sm:inline" />}
                    {titleHighlight && (
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-300 to-emerald-300 drop-shadow-sm">
                            {titleHighlight}
                        </span>
                    )}
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-xl md:text-2xl text-neutral-200 max-w-3xl mx-auto font-normal leading-relaxed drop-shadow-md text-balance">
                    {subtitle}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Link
                        href="/search"
                        className="inline-flex items-center justify-center gap-2 min-w-[200px] h-12 px-8 text-base font-semibold bg-white text-neutral-950 hover:bg-neutral-100 rounded-full shadow-[0_0_35px_rgba(255,255,255,0.35)] transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <span>Explore Catalog</span>
                        <ArrowRight className="size-4" />
                    </Link>

                    <Link
                        href="#categories"
                        className="inline-flex items-center justify-center gap-2 min-w-[200px] h-12 px-8 text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <span>Browse Collections</span>
                    </Link>
                </div>

                {/* Trust Badges Strip - High Contrast Dark Glassmorphism Container */}
                <div className="pt-8 max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-900/95 backdrop-blur-2xl border border-neutral-700/80 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
                        <div className="flex items-center justify-center gap-2.5 py-1 text-white">
                            <Star className="size-4 text-amber-400 fill-amber-400 shrink-0" />
                            <span className="font-semibold text-xs sm:text-sm tracking-wide">4.9/5 (12K+ Reviews)</span>
                        </div>
                        <div className="flex items-center justify-center gap-2.5 py-1 text-white">
                            <Truck className="size-4 text-sky-400 shrink-0" />
                            <span className="font-semibold text-xs sm:text-sm tracking-wide">Free Global Shipping</span>
                        </div>
                        <div className="flex items-center justify-center gap-2.5 py-1 text-white">
                            <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                            <span className="font-semibold text-xs sm:text-sm tracking-wide">2-Year Full Warranty</span>
                        </div>
                        <div className="flex items-center justify-center gap-2.5 py-1 text-white">
                            <RotateCcw className="size-4 text-violet-400 shrink-0" />
                            <span className="font-semibold text-xs sm:text-sm tracking-wide">30-Day Risk-Free Trial</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
