'use client';

import {ProductCard} from "@/features/products/components/product-card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,} from "@/components/ui/carousel";
import {FragmentOf, readFragment} from "@/platform/vendure/graphql";
import {ProductCardFragment} from '@/features/products/graphql';
import { Sparkles } from "lucide-react";

interface ProductCarouselClientProps {
    title: string;
    products: Array<FragmentOf<typeof ProductCardFragment>>;
    preloadFirstProduct?: boolean;
}

export function ProductCarousel({title, products, preloadFirstProduct}: ProductCarouselClientProps) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="py-16 md:py-24 border-b border-border/50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                            <Sparkles className="size-3.5" />
                            <span>Curated Hardware Selection</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                            {title || "Featured Products"}
                        </h2>
                        <p className="text-muted-foreground mt-2 text-base max-w-xl">
                            Handpicked flagship hardware designed for peak performance, studio acoustics, and workspace ergonomics.
                        </p>
                    </div>
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full relative"
                >
                    <CarouselContent className="-ml-3 md:-ml-4">
                        {products.map((product, index) => (
                            <CarouselItem key={readFragment(ProductCardFragment, product).productId}
                                          className="pl-3 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <ProductCard product={product} preload={preloadFirstProduct && index === 0}/>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="flex items-center justify-end gap-3 mt-6">
                        <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border border-border shadow-xs hover:bg-muted" />
                        <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border border-border shadow-xs hover:bg-muted" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
