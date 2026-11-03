import type {Metadata} from 'next';
import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';
import {WishlistGrid} from './wishlist-grid';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Account'});
    return {
        title: t('wishlistPageTitle'),
    };
}

export default async function WishlistPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Account'});
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t('wishlistPageTitle')}</h1>
                <p className="text-muted-foreground mt-2">
                    {t('wishlistDescription')}
                </p>
            </div>
            
            <WishlistGrid emptyMessage={t('emptyWishlist')} />
        </div>
    );
}
