import type { Product, Variant } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { WishlistButton } from './WishlistButton'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInUSD, title } = product

  let price = priceInUSD

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInUSD &&
      typeof variant.priceInUSD === 'number'
    ) {
      price = variant.priceInUSD
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : false

  return (
    <Link className="relative flex flex-col h-full w-full group overflow-hidden rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 dark:bg-black/40 dark:backdrop-blur-xl dark:border-white/10 dark:hover:border-white/20" href={`/products/${product.slug}`}>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary/50">
        <WishlistButton productId={String(product.id)} />
        {image ? (
          <Media
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            resource={image}
            fill
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm uppercase tracking-widest">
            No Image
          </div>
        )}
        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Quick add button (visual only) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out px-6 py-3 bg-white/90 backdrop-blur-sm text-black rounded-full text-sm font-semibold tracking-wide whitespace-nowrap shadow-lg">
          View Details
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 z-10 bg-gradient-to-b from-card to-card/50">
        <h3 className="font-sans text-lg font-medium tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        {typeof price === 'number' && (
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="font-mono text-base font-semibold text-primary">
              <Price amount={price} />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
