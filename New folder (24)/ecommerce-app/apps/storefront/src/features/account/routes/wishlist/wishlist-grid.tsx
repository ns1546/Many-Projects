'use client';

import { useEffect, useState } from 'react';
import { useWishlist } from '@/site/providers/wishlist-provider';
import { Link } from '@/platform/i18n/navigation';
import Image from 'next/image';
import { Price } from '@/features/pricing/price';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface WishlistGridProps {
    emptyMessage: string;
}

export function WishlistGrid({ emptyMessage }: WishlistGridProps) {
    const { items, removeItem } = useWishlist();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (items.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: items })
        })
        .then(res => res.json())
        .then(data => {
            if (data.items) {
                setProducts(data.items);
            }
        })
        .catch(err => {
            console.error('Failed to fetch wishlist', err);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [items]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-20 border rounded-xl bg-muted/20">
                <p className="text-muted-foreground text-lg mb-4">{emptyMessage}</p>
                <Button render={<Link href="/search" />} nativeButton={false}>
                    Continue Shopping
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
                <div key={product.productId} className="group relative block bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <Link href={`/product/${product.slug}`} className="block">
                        <div className="aspect-square relative bg-muted overflow-hidden">
                            {product.productAsset ? (
                                <Image
                                    src={product.productAsset.preview}
                                    alt={product.productName}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 640px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="p-4 space-y-2">
                            <h3 className="font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                {product.productName}
                            </h3>
                            <p className="text-lg font-bold tracking-tight">
                                {product.priceWithTax?.min !== undefined ? (
                                    <Price value={product.priceWithTax.min} currencyCode={product.currencyCode} />
                                ) : product.priceWithTax?.value !== undefined ? (
                                    <Price value={product.priceWithTax.value} currencyCode={product.currencyCode} />
                                ) : null}
                            </p>
                        </div>
                    </Link>
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.preventDefault();
                            removeItem(product.productId);
                            toast('Removed from wishlist');
                        }}
                        title="Remove"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
