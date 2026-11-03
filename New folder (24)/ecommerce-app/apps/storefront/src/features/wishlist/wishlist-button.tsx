'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/site/providers/wishlist-provider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function WishlistButton({ productId, className }: { productId: string, className?: string }) {
    const { isInWishlist, addItem, removeItem } = useWishlist();
    const isAdded = isInWishlist(productId);

    const toggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAdded) {
            removeItem(productId);
            toast('Removed from wishlist');
        } else {
            addItem(productId);
            toast('Added to wishlist');
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-full bg-white/50 hover:bg-white/90 shadow-sm backdrop-blur-sm border", className)}
            onClick={toggle}
            aria-label="Wishlist"
            title="Wishlist"
        >
            <Heart className={cn("h-5 w-5 transition-colors", isAdded ? "fill-red-500 text-red-500" : "text-gray-500")} />
        </Button>
    );
}
