'use client';
// Force recompile

import { Link } from '@/platform/i18n/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/site/providers/wishlist-provider';
import { useTranslations } from 'next-intl';

export function NavbarWishlist() {
    const { items } = useWishlist();
    const t = useTranslations('Navigation');

    return (
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" render={<Link href="/account/wishlist" />} nativeButton={false}>
            <Heart className="h-5 w-5" />
            <span className="sr-only">{t('wishlist')}</span>
            {items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {items.length}
                </span>
            )}
        </Button>
    );
}
