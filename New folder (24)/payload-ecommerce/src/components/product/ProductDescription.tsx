'use client'
import type { Product, Variant } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  const priceField = `priceIn${currency.code}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const priceField = `priceIn${currency.code}` as keyof Variant
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (
          typeof a === 'object' &&
          typeof b === 'object' &&
          priceField in a &&
          priceField in b &&
          typeof a[priceField] === 'number' &&
          typeof b[priceField] === 'number'
        ) {
          return a[priceField] - b[priceField]
        }

        return 0
      }) as Variant[]

    const lowestVariant = variantsOrderedByPrice[0][priceField]
    const highestVariant = variantsOrderedByPrice[variantsOrderedByPrice.length - 1][priceField]
    if (
      variantsOrderedByPrice &&
      typeof lowestVariant === 'number' &&
      typeof highestVariant === 'number'
    ) {
      lowestAmount = lowestVariant
      highestAmount = highestVariant
    }
  } else if (product[priceField] && typeof product[priceField] === 'number') {
    amount = product[priceField]
  }

  return (
    <div className="flex flex-col h-full justify-between gap-8 p-6 md:p-8 rounded-2xl bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      
      <div className="flex flex-col gap-6 z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {product.title}
          </h1>
          <div className="text-2xl font-mono text-primary/90 mt-4">
            {hasVariants ? (
              <Price highestAmount={highestAmount} lowestAmount={lowestAmount} />
            ) : (
              <Price amount={amount} />
            )}
          </div>
        </div>

        {product.description ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
            <RichText data={product.description} enableGutter={false} />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 mt-8 z-10 p-6 rounded-xl bg-background/50 border border-white/5 backdrop-blur-sm">
        {hasVariants && (
          <div className="flex flex-col gap-4">
            <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded-md" />}>
              <VariantSelector product={product} />
            </Suspense>
            <div className="h-px w-full bg-border/50" />
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm uppercase tracking-wider font-medium">
          <Suspense fallback={null}>
            <StockIndicator product={product} />
          </Suspense>
        </div>

        <div className="w-full mt-2">
          <Suspense fallback={<div className="h-12 animate-pulse bg-primary/20 rounded-lg" />}>
            <AddToCart product={product} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
