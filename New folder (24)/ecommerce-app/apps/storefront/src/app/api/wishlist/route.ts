import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/platform/vendure/api';
import { graphql } from '@/platform/vendure/graphql';

const GetWishlistProductsQuery = graphql(`
    query GetWishlistProducts($ids: [String!]!) {
        products(options: { filter: { id: { in: $ids } } }) {
            items {
                id
                name
                slug
                featuredAsset {
                    id
                    preview
                }
                variants {
                    priceWithTax
                    currencyCode
                }
            }
        }
    }
`);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productIds } = body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ items: [] });
        }

        const response = await query(GetWishlistProductsQuery, { ids: productIds });
        
        const mappedItems = (response.data?.products?.items || []).map(product => {
            const variants = product.variants || [];
            const prices = variants.map(v => v.priceWithTax);
            
            let priceWithTax;
            if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                priceWithTax = minPrice === maxPrice 
                    ? { __typename: 'SinglePrice', value: minPrice }
                    : { __typename: 'PriceRange', min: minPrice, max: maxPrice };
            } else {
                priceWithTax = { __typename: 'SinglePrice', value: 0 };
            }

            return {
                productId: product.id,
                productName: product.name,
                slug: product.slug,
                productAsset: product.featuredAsset || null,
                priceWithTax,
                currencyCode: variants[0]?.currencyCode || 'USD'
            };
        });

        console.log('Wishlist API Response mapped:', JSON.stringify(mappedItems));
        return NextResponse.json({ items: mappedItems });
    } catch (e) {
        console.error('Wishlist error in query:', e);
        return NextResponse.json({ error: 'Failed to fetch wishlist items' }, { status: 500 });
    }
}
