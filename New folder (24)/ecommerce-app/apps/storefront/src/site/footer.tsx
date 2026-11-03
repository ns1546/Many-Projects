import {getRouteLocale} from '@/platform/i18n/server';
import {cacheLife, cacheTag} from 'next/cache';
import {getTopCollections} from '@/features/collections/data';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {Zap, ShieldCheck, Lock, CreditCard, RefreshCw} from "lucide-react";

const COPYRIGHT_YEAR = 2026;

export async function Footer() {
    'use cache'
    cacheLife('days');

    const locale = await getRouteLocale();
    cacheTag(`footer-${locale}`);

    let collections = [];
    try {
        collections = await getTopCollections(locale);
    } catch {
        collections = [];
    }

    return (
        <footer className="border-t border-border bg-card/60 backdrop-blur-md mt-auto text-card-foreground">
            {/* Trust Banner Bar */}
            <div className="border-b border-border/40 py-6 bg-muted/20">
                <div className="container mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-muted-foreground text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Lock className="size-4 text-emerald-500" />
                        <span>256-Bit SSL Encrypted Checkout</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <CreditCard className="size-4 text-sky-500" />
                        <span>Instant Stripe &amp; Card Processing</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <ShieldCheck className="size-4 text-primary" />
                        <span>2-Year Official Protection</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="size-4 text-violet-500" />
                        <span>Hassle-Free 30-Day Returns</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <NavigationLink href="/" className="flex items-center gap-2 group inline-flex">
                            <div className="size-9 rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-sky-400 p-[1.5px] shadow-md shadow-primary/25">
                                <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                                    <Zap className="size-5 text-primary fill-primary/20" />
                                </div>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-foreground">
                                NEXUS<span className="text-primary font-black">.TECH</span>
                            </span>
                        </NavigationLink>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                            Next-generation audio engineering, custom tactile keyboards, and precision aerospace hardware built for creators, architects, and discerning sound enthusiasts.
                        </p>
                        <div className="pt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>All Systems Operational • Ships Globally</span>
                        </div>
                    </div>

                    {/* Departments Column */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-foreground">
                            Departments
                        </h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            {collections.length > 0 ? (
                                collections.map((collection) => (
                                    <li key={collection.id}>
                                        <NavigationLink
                                            href={`/collection/${collection.slug}`}
                                            className="hover:text-primary transition-colors inline-block"
                                        >
                                            {collection.name}
                                        </NavigationLink>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li><NavigationLink href="/collection/audio-sound" className="hover:text-primary transition-colors">Audio &amp; Acoustics</NavigationLink></li>
                                    <li><NavigationLink href="/collection/computing-desk" className="hover:text-primary transition-colors">Computing &amp; Desk</NavigationLink></li>
                                    <li><NavigationLink href="/collection/wearables-watches" className="hover:text-primary transition-colors">Wearables &amp; Watches</NavigationLink></li>
                                    <li><NavigationLink href="/collection/power-travel" className="hover:text-primary transition-colors">Power &amp; Travel Gear</NavigationLink></li>
                                </>
                            )}
                            <li>
                                <NavigationLink href="/search" className="text-primary font-medium hover:underline inline-block pt-1">
                                    Explore Full Catalog &rarr;
                                </NavigationLink>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-foreground">
                            Customer Care
                        </h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            <li>
                                <NavigationLink href="/search" className="hover:text-primary transition-colors">
                                    Order Tracking
                                </NavigationLink>
                            </li>
                            <li>
                                <NavigationLink href="/cart" className="hover:text-primary transition-colors">
                                    Shopping Bag
                                </NavigationLink>
                            </li>
                            <li>
                                <NavigationLink href="/account/wishlist" className="hover:text-primary transition-colors">
                                    Saved Wishlist
                                </NavigationLink>
                            </li>
                            <li>
                                <NavigationLink href="/account/orders" className="hover:text-primary transition-colors">
                                    Order History
                                </NavigationLink>
                            </li>
                            <li>
                                <NavigationLink href="/account/profile" className="hover:text-primary transition-colors">
                                    Customer Account
                                </NavigationLink>
                            </li>
                        </ul>
                    </div>

                    {/* Security & Accepted Payments */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-foreground">
                            Payment &amp; Trust
                        </h4>
                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                            We accept all major credit cards, digital wallets, and encrypted one-click checkout.
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                            <span className="px-2.5 py-1 rounded bg-muted border border-border text-foreground">VISA</span>
                            <span className="px-2.5 py-1 rounded bg-muted border border-border text-foreground">MASTERCARD</span>
                            <span className="px-2.5 py-1 rounded bg-muted border border-border text-foreground">AMEX</span>
                            <span className="px-2.5 py-1 rounded bg-muted border border-border text-foreground">APPLE PAY</span>
                            <span className="px-2.5 py-1 rounded bg-muted border border-border text-foreground">GOOGLE PAY</span>
                            <span className="px-2.5 py-1 rounded bg-muted border border-border text-foreground">STRIPE</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Legal / Copyright Section */}
                <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <div>
                        &copy; {COPYRIGHT_YEAR} NEXUS TECH E-Commerce Inc. All rights reserved.
                    </div>
                    <div className="flex items-center gap-6">
                        <NavigationLink href="/search" className="hover:text-foreground transition-colors">Privacy Policy</NavigationLink>
                        <NavigationLink href="/search" className="hover:text-foreground transition-colors">Terms of Service</NavigationLink>
                        <NavigationLink href="/search" className="hover:text-foreground transition-colors">Shipping &amp; Customs</NavigationLink>
                        <NavigationLink href="/search" className="hover:text-foreground transition-colors">Security Disclosure</NavigationLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}
