import Image from 'next/image';
import {FragmentOf, readFragment} from '@/platform/vendure/graphql';
import {ProductCardFragment} from '@/features/products/graphql';
import {Price} from '@/features/pricing/price';
import {Suspense} from "react";
import { Link } from '@/platform/i18n/navigation';
import {useTranslations} from 'next-intl';
import {WishlistButton} from '@/features/wishlist/wishlist-button';
import { Star, Truck } from 'lucide-react';

interface ProductCardProps {
    product: FragmentOf<typeof ProductCardFragment>;
    preload?: boolean;
}

export function ProductCard({product: productProp, preload}: ProductCardProps) {
    const t = useTranslations('Product');
    const product = readFragment(ProductCardFragment, productProp);

    return (
        <div className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border/80 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
            <Link
                href={`/product/${product.slug}`}
                className="block flex-1 flex flex-col"
            >
                <div className="aspect-square relative bg-muted/40 overflow-hidden">
                    {product.productAsset ? (
                        <Image
                            src={product.productAsset.preview}
                            alt={product.productName}
                            fill
                            preload={preload}
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            {t('noImage')}
                        </div>
                    )}
                    {/* In Stock Badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-background/90 backdrop-blur-md border border-border/60 text-foreground shadow-xs">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            In Stock
                        </span>
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-amber-400 text-xs">
                            <Star className="size-3.5 fill-amber-400" />
                            <span className="font-bold text-foreground">4.9</span>
                            <span className="text-muted-foreground text-[11px]">(24+ reviews)</span>
                        </div>
                        <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                            {product.productName}
                        </h3>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <Suspense fallback={<div className="h-6 w-20 rounded bg-muted animate-pulse"></div>}>
                            <div className="text-lg font-extrabold tracking-tight text-foreground">
                                {product.priceWithTax.__typename === 'PriceRange' ? (
                                    product.priceWithTax.min !== product.priceWithTax.max ? (
                                        <>
                                            <span className="text-xs font-normal text-muted-foreground mr-1">{t('from')}</span>
                                            <Price value={product.priceWithTax.min} currencyCode={product.currencyCode}/>
                                        </>
                                    ) : (
                                        <Price value={product.priceWithTax.min} currencyCode={product.currencyCode}/>
                                    )
                                ) : product.priceWithTax.__typename === 'SinglePrice' ? (
                                    <Price value={product.priceWithTax.value} currencyCode={product.currencyCode}/>
                                ) : null}
                            </div>
                        </Suspense>

                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                            <Truck className="size-3 text-primary" /> Free
                        </span>
                    </div>
                </div>
            </Link>

            <div className="absolute top-3 right-3 z-20">
                <WishlistButton productId={product.productId} />
            </div>
        </div>
    );
}
