import {NavigationLink} from '@/site/navigation/navigation-link';
import {NavbarCollections} from '@/site/navigation/navbar/navbar-collections';
import {NavbarCart} from '@/site/navigation/navbar/navbar-cart';
import {NavbarWishlist} from '@/site/navigation/navbar/navbar-wishlist';
import {NavbarUser} from '@/site/navigation/navbar/navbar-user';
import {ThemeSwitcher} from '@/site/navigation/navbar/theme-switcher';
import {LanguagePicker} from '@/site/navigation/navbar/language-picker';
import {CurrencyPickerWrapper} from '@/site/navigation/navbar/currency-picker-wrapper';
import {MobileNavWrapper} from '@/site/navigation/navbar/mobile-nav-wrapper';
import {Suspense} from "react";
import {SearchInput} from '@/site/navigation/search-input';
import {NavbarUserSkeleton} from '@/site/navigation/skeletons/navbar-user-skeleton';
import {SearchInputSkeleton} from '@/site/navigation/skeletons/search-input-skeleton';
import {AnnouncementBar} from '@/site/navigation/announcement-bar';
import {Zap} from 'lucide-react';

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex flex-col">
            <AnnouncementBar />
            <div className="border-b backdrop-blur-xl bg-background/85 supports-[backdrop-filter]:bg-background/70 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-6">
                            <Suspense>
                                <MobileNavWrapper />
                            </Suspense>
                            <NavigationLink href="/" className="flex items-center gap-2 group">
                                <div className="size-9 rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-sky-400 p-[1.5px] shadow-md shadow-primary/25 transition-transform duration-300 group-hover:scale-105">
                                    <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                                        <Zap className="size-5 text-primary fill-primary/20" />
                                    </div>
                                </div>
                                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                                    NEXUS<span className="text-primary font-black">.TECH</span>
                                </span>
                            </NavigationLink>
                            <nav className="hidden lg:flex items-center gap-1 pl-2">
                                <Suspense>
                                    <NavbarCollections/>
                                </Suspense>
                                <NavigationLink
                                    href="/search"
                                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-all"
                                >
                                    Catalog
                                </NavigationLink>
                            </nav>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden md:flex">
                                <Suspense fallback={<SearchInputSkeleton />}>
                                    <SearchInput/>
                                </Suspense>
                            </div>
                            <Suspense>
                                <LanguagePicker />
                            </Suspense>
                            <Suspense>
                                <CurrencyPickerWrapper />
                            </Suspense>
                            <Suspense>
                                <ThemeSwitcher />
                            </Suspense>
                            <Suspense>
                                <NavbarWishlist />
                            </Suspense>
                            <Suspense>
                                <NavbarCart/>
                            </Suspense>
                            <Suspense fallback={<NavbarUserSkeleton />}>
                                <NavbarUser/>
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
