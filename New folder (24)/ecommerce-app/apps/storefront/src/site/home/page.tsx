import type {Metadata} from "next";
import {Suspense} from "react";
import {getRouteLocale} from "@/platform/i18n/server";
import {HeroSection} from "@/site/home/hero-section";
import {CategoriesGrid} from "@/site/home/categories-grid";
import {FeaturedProducts} from '@/features/products/featured-products';
import {DealBanner} from "@/site/home/deal-banner";
import {TrustSection} from "@/site/home/trust-section";
import {ReviewsSection} from "@/site/home/reviews-section";
import {NewsletterSection} from "@/site/home/newsletter-section";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/config/metadata";
import {getTranslations} from 'next-intl/server';
import {toOgLocale} from '@/platform/i18n/locale-utils';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const ogLocale = toOgLocale(locale);

    return {
        title: {
            absolute: `NEXUS TECH | Flagship Audio, Keyboards & Precision Hardware`,
        },
        description: "Discover studio-grade acoustics, custom mechanical keyboards, and precision aerospace titanium EDC designed for modern creators.",
        alternates: {
            canonical: buildCanonicalUrl("/"),
        },
        openGraph: {
            title: `NEXUS TECH | Flagship Audio, Keyboards & Precision Hardware`,
            description: "Studio-tuned acoustics, mechanical keyboards, and aerospace titanium wearables.",
            type: "website",
            locale: ogLocale,
            url: SITE_URL,
        },
    };
}

export default async function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* 1. Cinematic Hero Section */}
            <HeroSection />

            {/* 2. Interactive Department / Categories Showcase */}
            <CategoriesGrid />

            {/* 3. Featured Products Showcase */}
            <div className="py-8 bg-background">
                <Suspense fallback={
                    <div className="container mx-auto px-4 py-16 text-center">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-muted rounded w-48 mx-auto" />
                            <div className="h-64 bg-muted rounded-xl" />
                        </div>
                    </div>
                }>
                    <FeaturedProducts />
                </Suspense>
            </div>

            {/* 4. Limited Drop / Deal of the Week Spotlight */}
            <DealBanner />

            {/* 5. Core Quality & Service Guarantees */}
            <TrustSection />

            {/* 6. Verified Buyer Community Reviews */}
            <ReviewsSection />

            {/* 7. VIP Club Newsletter with Instant Promo Code */}
            <NewsletterSection />
        </div>
    );
}
